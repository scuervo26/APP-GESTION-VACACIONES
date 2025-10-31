import React, { createContext, useState, ReactNode, useContext, useEffect, useMemo } from 'react';
import { VacationRequest, RequestStatus } from '../types';
import { AuthContext } from './AuthContext';
import { callApi } from '../utils/api';

interface RequestContextType {
    requests: VacationRequest[];
    userRequests: VacationRequest[];
    addRequest: (request: Omit<VacationRequest, 'id' | 'userName' | 'userId' | 'createdAt'>) => Promise<void>;
    updateRequest: (id: number, status: RequestStatus, approverComment?: string) => Promise<void>;
    editRequest: (request: VacationRequest) => Promise<void>;
    removeRequestsByUser: (userId: number) => Promise<void>;
}

export const RequestContext = createContext<RequestContextType | undefined>(undefined);

const parseRequestItem = (item: any): VacationRequest => {
    if (item && item.approvedBy && typeof item.approvedBy === 'string') {
        try {
            item.approvedBy = JSON.parse(item.approvedBy);
        } catch (e) { /* ignore malformed JSON */ }
    }
    return item;
};

export const RequestProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [requests, setRequests] = useState<VacationRequest[]>([]);
    const authContext = useContext(AuthContext);
    
    useEffect(() => {
        const fetchRequests = async () => {
            if (authContext?.isAuthenticated) {
                try {
                   const allRequestsData = await callApi('getRequests');
                   const allRequests = Array.isArray(allRequestsData) ? allRequestsData.map(parseRequestItem) : [];
                   setRequests(allRequests);
                } catch (e) {
                    console.error("Failed to fetch requests", e);
                }
            }
        };
        fetchRequests();
    }, [authContext?.isAuthenticated]);

    const userRequests = useMemo(() => {
        if (!authContext?.user) return [];
        return requests
            .filter(req => req.userId === authContext.user!.id)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [requests, authContext?.user]);

    const addRequest = async (request: Omit<VacationRequest, 'id' | 'userName' | 'userId' | 'createdAt'>) => {
        if (!authContext?.user) return;
        const { user } = authContext;

        const newRequestData: Omit<VacationRequest, 'id'> = {
            userId: user.id,
            userName: user.name,
            createdAt: new Date().toISOString(),
            ...request
        };

        const newRequest = await callApi('addRequest', { request: newRequestData });
        setRequests(prev => [parseRequestItem(newRequest), ...prev]);
    };

    const updateRequest = async (id: number, status: RequestStatus, approverComment?: string) => {
        if (!authContext?.user || !authContext.updateUser || !authContext.users) return;
        const { user: approver, updateUser, users } = authContext;
        
        const requestToUpdate = requests.find(req => req.id === id);
        if (!requestToUpdate) return;
        
        const updatedRequestData: VacationRequest = {
            ...requestToUpdate,
            status,
            approverComment: approverComment || requestToUpdate.approverComment,
            approvedBy: { id: approver.id, name: approver.name },
        };
        
        const returnedRequest = await callApi('updateRequest', { request: updatedRequestData });
        setRequests(prev => prev.map(r => r.id === id ? parseRequestItem(returnedRequest) : r));

        // Adjust user's leave balance if a pending request is approved
        if (status === RequestStatus.APPROVED && requestToUpdate.status === RequestStatus.PENDING) {
            const userToUpdate = users.find(u => u.id === requestToUpdate.userId);
            if(userToUpdate) {
                const used = userToUpdate.annualLeave.used + requestToUpdate.days;
                const available = userToUpdate.annualLeave.total - used;
                await updateUser({ ...userToUpdate, annualLeave: { ...userToUpdate.annualLeave, used, available } });
            }
        }
    };

    const editRequest = async (updatedRequestData: VacationRequest) => {
        if (!authContext?.updateUser || !authContext.users) return;

        const originalRequest = requests.find(req => req.id === updatedRequestData.id);
        if (!originalRequest) return;
        
        const returnedRequest = await callApi('editRequest', { request: updatedRequestData });
        setRequests(prev => prev.map(req => req.id === updatedRequestData.id ? parseRequestItem(returnedRequest) : req));

        const wasApproved = originalRequest.status === RequestStatus.APPROVED || originalRequest.status === RequestStatus.MODIFIED;
        if (wasApproved) {
            const daysDifference = updatedRequestData.days - originalRequest.days;
            if (daysDifference !== 0) {
                const userToUpdate = authContext.users.find(u => u.id === originalRequest.userId);
                if (userToUpdate) {
                    const used = userToUpdate.annualLeave.used + daysDifference;
                    const available = userToUpdate.annualLeave.total - used;
                    await authContext.updateUser({ ...userToUpdate, annualLeave: { ...userToUpdate.annualLeave, used, available }});
                }
            }
        }
    };
    
    const removeRequestsByUser = async (userId: number) => {
        await callApi('removeRequestsByUser', { userId });
        setRequests(prev => prev.filter(req => req.userId !== userId));
    };

    return (
        <RequestContext.Provider value={{ requests, userRequests, addRequest, updateRequest, editRequest, removeRequestsByUser }}>
            {children}
        </RequestContext.Provider>
    );
};
