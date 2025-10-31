import React, { useState } from 'react';
import { VacationRequest, RequestStatus } from '../types';
import { REQUEST_STATUSES } from '../constants';
import { formatDateToSpanish } from '../utils/dateUtils';

const StatusBadge: React.FC<{ status: RequestStatus }> = ({ status }) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
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
}

const RequestTable: React.FC<RequestTableProps> = ({ requests, showEmployeeColumn = false, actionType = 'none', onAction, onEdit }) => {
    const [actionState, setActionState] = useState<{
        action: 'approve' | 'reject' | null;
        requestId: number | null;
    }>({ action: null, requestId: null });
    const [comment, setComment] = useState('');

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

    const getColSpan = () => {
        let span = 5; // Base columns
        if (showEmployeeColumn) span++;
        if (actionType !== 'none') span++;
        return span;
    };

    return (
        <>
            <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            {showEmployeeColumn && <th scope="col" className="py-3 px-6">Empleado</th>}
                            <th scope="col" className="py-3 px-6">Fechas</th>
                            <th scope="col" className="py-3 px-6">Días</th>
                            <th scope="col" className="py-3 px-6">Tipo</th>
                            <th scope="col" className="py-3 px-6">Estado</th>
                            <th scope="col" className="py-3 px-6">Comentarios</th>
                            {actionType !== 'none' && <th scope="col" className="py-3 px-6">Acciones</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {requests.length === 0 ? (
                            <tr>
                                <td colSpan={getColSpan()} className="py-4 px-6 text-center text-gray-500">
                                    No hay solicitudes para mostrar.
                                </td>
                            </tr>
                        ) : requests.map(req => (
                            <tr key={req.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                {showEmployeeColumn && <td className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap dark:text-white">{req.userName}</td>}
                                <td className="py-4 px-6">{formatDateToSpanish(req.startDate)} - {formatDateToSpanish(req.endDate)}</td>
                                <td className="py-4 px-6">{req.days}</td>
                                <td className="py-4 px-6">{req.type}</td>
                                <td className="py-4 px-6"><StatusBadge status={req.status} /></td>
                                <td className="py-4 px-6 text-xs">
                                    {req.employeeComment && <p><strong>Empleado:</strong> {req.employeeComment}</p>}
                                    {req.approverComment && <p><strong>Aprobador:</strong> {req.approverComment}</p>}
                                    {req.approvedBy && <p className="italic text-gray-500 mt-1">Gestionado por: {req.approvedBy.name}</p>}
                                </td>
                                {actionType !== 'none' && (
                                    <td className="py-4 px-6 space-x-2">
                                        {actionType === 'approve-reject' && req.status === REQUEST_STATUSES.PENDING && onAction && (
                                            <>
                                                <button onClick={() => setActionState({ action: 'approve', requestId: req.id })} className="font-medium text-green-600 dark:text-green-500 hover:underline">Aprobar</button>
                                                <button onClick={() => setActionState({ action: 'reject', requestId: req.id })} className="font-medium text-red-600 dark:text-red-500 hover:underline">Rechazar</button>
                                            </>
                                        )}
                                        {actionType === 'edit' && onEdit && (
                                            <button onClick={() => onEdit(req)} className="font-medium text-indigo-600 dark:text-indigo-500 hover:underline">Editar</button>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
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
        </>
    );
};

export default RequestTable;