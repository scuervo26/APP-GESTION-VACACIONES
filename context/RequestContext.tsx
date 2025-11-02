import React, { createContext, useState, ReactNode, useContext, useEffect, useMemo } from 'react';
import { VacationRequest, RequestStatus, User } from '../types';
import { AuthContext } from './AuthContext';
import { callApi } from '../utils/api';

interface RequestContextType {
    requests: VacationRequest[];
    userRequests: VacationRequest[];
    addRequest: (request: Omit<VacationRequest, 'id' | 'userName' | 'userId' | 'createdAt'>) => Promise<void>;
    updateRequest: (id: number, status: RequestStatus, approverComment?: string) => Promise<void>;
    editRequest: (request: VacationRequest) => Promise<void>;
    removeRequestsByUser: (userId: number) => Promise<void>;
    deleteRequest: (id: number) => Promise<void>;
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
        try {
            const newRequest = await callApi('addRequest', { request: newRequestData });
            setRequests(prev => [parseRequestItem(newRequest), ...prev]);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error("Failed to add request:", error);
            alert(`Error al enviar la solicitud: ${errorMessage}`);
        }
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
        
        try {
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
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error("Failed to update request:", error);
            alert(`Error al actualizar la solicitud: ${errorMessage}`);
        }
    };

    const editRequest = async (updatedRequestData: VacationRequest) => {
        if (!authContext?.updateUser || !authContext.users) return;

        const originalRequest = requests.find(req => req.id === updatedRequestData.id);
        if (!originalRequest) return;
        
        try {
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
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error("Failed to edit request:", error);
            alert(`Error al editar la solicitud: ${errorMessage}`);
        }
    };
    
    const removeRequestsByUser = async (userId: number) => {
        if (!authContext?.updateUser || !authContext.users) {
            throw new Error("El contexto de autenticación no está listo.");
        }
    
        const { users, updateUser } = authContext;
    
        const userToUpdate = users.find(u => u.id === userId);
        const requestsToRemove = requests.filter(req => req.userId === userId);
        
        const daysToCredit = requestsToRemove
            .filter(req => req.status === RequestStatus.APPROVED || req.status === RequestStatus.MODIFIED)
            .reduce((sum, req) => sum + req.days, 0);
    
        try {
            // First, remove all requests from the backend.
            await callApi('removeRequestsByUser', { userId });
            
            // Then, update the local request state.
            setRequests(prev => prev.filter(req => req.userId !== userId));
    
            // Finally, if days need to be credited back, update the user's balance.
            if (userToUpdate && daysToCredit > 0) {
                const used = userToUpdate.annualLeave.used - daysToCredit;
                const available = userToUpdate.annualLeave.total - used;
                await updateUser({ ...userToUpdate, annualLeave: { ...userToUpdate.annualLeave, used, available } });
            }
        } catch (error) {
            console.error("Fallo al eliminar las solicitudes del usuario:", error);
            // Re-throw the error to be caught by the component.
            throw error;
        }
    };

    const deleteRequest = async (id: number) => {
        if (!authContext?.updateUser || !authContext.users) return;

        const requestToDelete = requests.find(req => req.id === id);
        if (!requestToDelete) return;

        // Store original state for potential rollback
        const originalRequests = [...requests];
        
        // Optimistically update the UI for a faster user experience
        setRequests(prev => prev.filter(req => req.id !== id));

        try {
            // Perform the actual API call to delete the request
            await callApi('deleteRequest', { id: id });

            // If the request was approved or modified, we need to credit the days back to the user.
            const wasApproved = requestToDelete.status === RequestStatus.APPROVED || requestToDelete.status === RequestStatus.MODIFIED;
            if (wasApproved) {
                const userToUpdate = authContext.users.find(u => u.id === requestToDelete.userId);
                if (userToUpdate) {
                    const used = userToUpdate.annualLeave.used - requestToDelete.days;
                    const available = userToUpdate.annualLeave.total - used;
                    // This will trigger another API call to update the user's leave balance
                    await authContext.updateUser({ ...userToUpdate, annualLeave: { ...userToUpdate.annualLeave, used, available } });
                }
            }
        } catch (error) {
            // If any part of the deletion process fails, roll back the UI to its original state
            setRequests(originalRequests);

            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error("Failed to delete request:", error);
            alert(`Error al eliminar la solicitud. La solicitud ha sido restaurada. Error: ${errorMessage}`);
        }
    };

    return (
        <RequestContext.Provider value={{ requests, userRequests, addRequest, updateRequest, editRequest, removeRequestsByUser, deleteRequest }}>
            {children}
        </RequestContext.Provider>
    );
};