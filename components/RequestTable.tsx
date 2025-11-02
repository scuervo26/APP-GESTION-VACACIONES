import React, { useState } from 'react';
import { VacationRequest, RequestStatus } from '../types';
import { REQUEST_STATUSES } from '../constants';
import { formatDateToSpanish } from '../utils/dateUtils';
import { TrashIcon } from './icons';

const StatusBadge: React.FC<{ status: RequestStatus }> = ({ status }) => {
    const baseClasses = "px-2 py-0.5 text-xs font-semibold rounded-full inline-block";
    const statusClasses: { [key in RequestStatus]: string } = {
        [RequestStatus.PENDING]: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
        [RequestStatus.APPROVED]: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        [RequestStatus.REJECTED]: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
        [RequestStatus.MODIFIED]: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    };
    return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
};

interface RequestTableProps {
    requests: VacationRequest[];
    showEmployeeColumn?: boolean;
    actionType?: 'approve-reject' | 'edit' | 'none';
    onAction?: (id: number, status: RequestStatus, comment?: string) => void;
    onEdit?: (request: VacationRequest) => void;
    onDelete?: (id: number) => void;
}

const RequestTable: React.FC<RequestTableProps> = ({ requests, showEmployeeColumn = false, actionType = 'none', onAction, onEdit, onDelete }) => {
    const [actionState, setActionState] = useState<{
        action: 'approve' | 'reject' | null;
        requestId: number | null;
    }>({ action: null, requestId: null });
    const [comment, setComment] = useState('');
    const [requestToDelete, setRequestToDelete] = useState<number | null>(null);


    const handleConfirmAction = () => {
        if (!actionState.action || actionState.requestId === null) return;

        if (actionState.action === 'reject' && !comment.trim()) {
            alert("Es obligatorio indicar un motivo de rechazo.");
            return;
        }
        
        const status = actionState.action === 'approve' ? REQUEST_STATUSES.APPROVED : REQUEST_STATUSES.REJECTED;
        onAction?.(actionState.requestId, status, comment);
        
        handleCloseModal();
    };

    const handleCloseModal = () => {
        setActionState({ action: null, requestId: null });
        setComment('');
    };
    
    const handleConfirmDelete = () => {
        if (requestToDelete === null) return;
        onDelete?.(requestToDelete);
        setRequestToDelete(null);
    };

    if (requests.length === 0) {
        return (
            <div className="text-center text-gray-500 py-8">
                No hay solicitudes para mostrar.
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4">
                {requests.map(req => (
                    <div key={req.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-start">
                             <div>
                                <StatusBadge status={req.status} />
                                {showEmployeeColumn && <span className="ml-2 font-bold text-gray-800 dark:text-gray-100">{req.userName}</span>}
                            </div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">{formatDateToSpanish(req.createdAt)}</span>
                        </div>
                        <div className="mt-3 sm:flex justify-between items-end">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    <span className="font-semibold">Período:</span> {formatDateToSpanish(req.startDate)} - {formatDateToSpanish(req.endDate)}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    <span className="font-semibold">Días:</span> {req.days}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    <span className="font-semibold">Tipo:</span> {req.type}
                                </p>
                            </div>
                             <div className="mt-3 sm:mt-0">
                                {(actionType !== 'none' || onDelete) && (
                                    <div className="flex items-center space-x-4">
                                        {actionType === 'approve-reject' && req.status === REQUEST_STATUSES.PENDING && onAction && (
                                            <>
                                                <button onClick={() => setActionState({ action: 'approve', requestId: req.id })} className="font-semibold text-sm text-green-600 hover:text-green-800">Aprobar</button>
                                                <button onClick={() => setActionState({ action: 'reject', requestId: req.id })} className="font-semibold text-sm text-red-600 hover:text-red-800">Rechazar</button>
                                            </>
                                        )}
                                        {actionType === 'edit' && onEdit && (
                                            <button onClick={() => onEdit(req)} className="font-semibold text-sm text-indigo-600 hover:text-indigo-800">Editar</button>
                                        )}
                                        {onDelete && (
                                            (showEmployeeColumn || (!showEmployeeColumn && req.status === REQUEST_STATUSES.PENDING)) &&
                                            <button 
                                                onClick={() => setRequestToDelete(req.id)} 
                                                className="font-semibold text-sm text-red-600 hover:text-red-800 flex items-center"
                                                title="Eliminar Solicitud"
                                            >
                                                <TrashIcon className="w-4 h-4 mr-1" />
                                                <span>Eliminar</span>
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                         {(req.employeeComment || req.approverComment) && (
                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 space-y-1">
                                {req.employeeComment && <p><strong>Empleado:</strong> {req.employeeComment}</p>}
                                {req.approverComment && <p><strong>Aprobador:</strong> {req.approverComment}</p>}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {actionState.action && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center modal-container">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md modal-content">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                            {actionState.action === 'approve' ? 'Aprobar Solicitud' : 'Rechazar Solicitud'}
                        </h2>
                        <p className="mb-4 text-gray-600 dark:text-gray-400">
                            ¿Estás seguro de que quieres {actionState.action === 'approve' ? 'aprobar' : 'rechazar'} esta solicitud?
                        </p>
                        <div className="mb-4">
                            <label htmlFor="comment" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Comentario ({actionState.action === 'approve' ? 'Opcional' : 'Obligatorio para rechazo'})
                            </label>
                            <textarea 
                                id="comment" 
                                rows={3} 
                                value={comment} 
                                onChange={e => setComment(e.target.value)} 
                                className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder={actionState.action === 'reject' ? 'Motivo del rechazo...' : 'Añadir un comentario...'}
                            ></textarea>
                        </div>
                        <div className="flex justify-end space-x-4">
                            <button 
                                type="button" 
                                onClick={handleCloseModal}
                                className="text-gray-600 bg-white border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700"
                            >
                                Cancelar
                            </button>
                            <button 
                                type="button" 
                                onClick={handleConfirmAction} 
                                className={`text-white font-medium rounded-lg text-sm px-5 py-2.5 ${
                                    actionState.action === 'approve' 
                                    ? 'bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-300' 
                                    : 'bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-300'
                                }`}
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {requestToDelete !== null && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center modal-container">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md modal-content">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                            Confirmar Eliminación
                        </h2>
                        <p className="mb-4 text-gray-600 dark:text-gray-400">
                            ¿Estás seguro de que quieres eliminar esta solicitud? Esta acción no se puede deshacer.
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button 
                                type="button" 
                                onClick={() => setRequestToDelete(null)}
                                className="text-gray-600 bg-white border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700"
                            >
                                Cancelar
                            </button>
                            <button 
                                type="button" 
                                onClick={handleConfirmDelete} 
                                className="text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default RequestTable;