import React, { useState, useContext } from 'react';
import { RequestContext } from '../context/RequestContext';
import { AuthContext } from '../context/AuthContext';
import { VacationRequest, RequestStatus } from '../types';
import RequestTable from '../components/RequestTable';
import RequestModal from '../components/RequestModal';
import { REQUEST_STATUSES } from '../constants';

const ApproverDashboard: React.FC = () => {
    const requestContext = useContext(RequestContext);
    const authContext = useContext(AuthContext);
    const { requests, updateRequest, editRequest, deleteRequest } = requestContext!;
    const { user } = authContext!;
    
    const [filter, setFilter] = useState<RequestStatus | 'All'>('All');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [requestToEdit, setRequestToEdit] = useState<VacationRequest | null>(null);

    const handleAction = (id: number, status: RequestStatus, comment?: string) => {
        updateRequest(id, status, comment);
    };

    const handleEditClick = (request: VacationRequest) => {
        setRequestToEdit(request);
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = (updatedRequest: VacationRequest) => {
        const modifiedRequest: VacationRequest = {
            ...updatedRequest,
            status: REQUEST_STATUSES.MODIFIED,
            approverComment: `Modificado por ${user.name}.`
        };
        editRequest(modifiedRequest);
        handleCloseModal();
    };
    
    const handleCloseModal = () => {
        setIsEditModalOpen(false);
        setRequestToEdit(null);
    }
    
    const handleDeleteRequest = (id: number) => {
        deleteRequest(id);
    };

    const pendingRequests = requests.filter(req => req.status === REQUEST_STATUSES.PENDING);
    const filteredRequests = filter === 'All' ? requests : requests.filter(r => r.status === filter);
    
    return (
        <div className="space-y-8">
             <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard del Aprobador</h1>
                <p className="mt-1 text-md text-gray-600 dark:text-gray-400">Revisa y gestiona las solicitudes de vacaciones de tu equipo.</p>
            </div>
            {/* Pending Requests */}
            <div className="bg-white dark:bg-gray-900 shadow-sm rounded-lg">
                 <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                        <span className="inline-block w-3 h-3 bg-yellow-400 rounded-full mr-2"></span>
                        Solicitudes Pendientes ({pendingRequests.length})
                    </h3>
                </div>
                <div className="p-6">
                    {pendingRequests.length > 0 ? (
                        <RequestTable 
                            requests={pendingRequests} 
                            showEmployeeColumn={true} 
                            actionType="approve-reject"
                            onAction={handleAction} 
                            onDelete={handleDeleteRequest}
                        />
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">No hay solicitudes pendientes de revisión.</p>
                    )}
                </div>
            </div>

            {/* All Requests */}
            <div className="bg-white dark:bg-gray-900 shadow-sm rounded-lg">
                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Todas las Solicitudes del Equipo</h3>
                    <div>
                        <select 
                            value={filter}
                            onChange={(e) => setFilter(e.target.value as RequestStatus | 'All')}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-3 pr-10 py-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                        >
                            <option value="All">Todos los estados</option>
                            {Object.values(REQUEST_STATUSES).map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
                </div>
                 <div className="p-6">
                    <RequestTable 
                        requests={filteredRequests} 
                        showEmployeeColumn={true} 
                        actionType="edit"
                        onEdit={handleEditClick}
                        onDelete={handleDeleteRequest}
                    />
                </div>
            </div>
             {isEditModalOpen && (
                <RequestModal 
                    isOpen={isEditModalOpen} 
                    onClose={handleCloseModal}
                    onSubmitEdit={handleEditSubmit}
                    requestToEdit={requestToEdit}
                />
            )}
        </div>
    );
};

export default ApproverDashboard;