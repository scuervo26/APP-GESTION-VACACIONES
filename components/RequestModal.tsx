import React, { useState, useEffect } from 'react';
import { RequestType, VacationRequest } from '../types';
import { REQUEST_TYPES, REQUEST_STATUSES } from '../constants';
import { formatSpanishDateForInput, formatInputDateForApi } from '../utils/dateUtils';

interface RequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: (request: Omit<VacationRequest, 'id' | 'userName' | 'userId' | 'createdAt'>) => void;
    onSubmitEdit?: (request: VacationRequest) => void;
    requestToEdit?: VacationRequest | null;
}

const RequestModal: React.FC<RequestModalProps> = ({ isOpen, onClose, onSubmit, onSubmitEdit, requestToEdit }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [type, setType] = useState<RequestType>(REQUEST_TYPES.VACATION);
    const [comment, setComment] = useState('');

    const today = new Date().toISOString().split('T')[0];
    const isEditMode = !!requestToEdit;

    useEffect(() => {
        if (isEditMode && requestToEdit) {
            setStartDate(formatSpanishDateForInput(requestToEdit.startDate));
            setEndDate(formatSpanishDateForInput(requestToEdit.endDate));
            setType(requestToEdit.type);
            setComment(requestToEdit.employeeComment || '');
        } else {
            // Reset for new request
            setStartDate('');
            setEndDate('');
            setType(REQUEST_TYPES.VACATION);
            setComment('');
        }
    }, [requestToEdit, isEditMode, isOpen]);


    if (!isOpen) return null;
    
    // Simple business day calculation (Mon-Fri)
    const calculateBusinessDays = (start: string, end: string): number => {
        if (!start || !end) return 0;
        let count = 0;
        const curDate = new Date(start);
        const lastDate = new Date(end);
        
        // Add one day to curDate to make it timezone-agnostic for loop comparison
        curDate.setUTCDate(curDate.getUTCDate() + 1);
        lastDate.setUTCDate(lastDate.getUTCDate() + 1);

        while (curDate <= lastDate) {
            const dayOfWeek = curDate.getUTCDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 0=Sun, 6=Sat
                count++;
            }
            curDate.setUTCDate(curDate.getUTCDate() + 1);
        }
        return count;
    };
    
    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newStartDate = e.target.value;
        setStartDate(newStartDate);
        if (endDate && newStartDate > endDate) {
            setEndDate(newStartDate);
        }
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const days = calculateBusinessDays(startDate, endDate);
        if (days <= 0) {
            alert("La fecha de fin debe ser posterior o igual a la fecha de inicio.");
            return;
        }

        const startDateForApi = formatInputDateForApi(startDate);
        const endDateForApi = formatInputDateForApi(endDate);

        if (isEditMode && onSubmitEdit) {
            const updatedRequest: VacationRequest = {
                ...requestToEdit!,
                startDate: startDateForApi,
                endDate: endDateForApi,
                days,
                type,
                employeeComment: comment,
            };
            onSubmitEdit(updatedRequest);
        } else if (onSubmit) {
             onSubmit({
                startDate: startDateForApi,
                endDate: endDateForApi,
                days,
                type,
                status: REQUEST_STATUSES.PENDING,
                employeeComment: comment
            });
        }
       
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center modal-container">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-lg modal-content">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
                    {isEditMode ? 'Editar Solicitud' : 'Nueva Solicitud de Ausencia'}
                </h2>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label htmlFor="startDate" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Fecha de Inicio</label>
                            <input type="date" id="startDate" value={startDate} onChange={handleStartDateChange} required min={isEditMode ? undefined : today} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        </div>
                        <div>
                            <label htmlFor="endDate" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Fecha de Fin</label>
                            <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} required min={startDate || today} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        </div>
                    </div>
                     <div className="mb-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Días laborables solicitados: <span className="font-bold">{calculateBusinessDays(startDate, endDate)}</span></p>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="type" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Tipo de Ausencia</label>
                        <select id="type" value={type} onChange={e => setType(e.target.value as RequestType)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            {Object.values(REQUEST_TYPES).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div className="mb-6">
                        <label htmlFor="comment" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Comentario (Opcional)</label>
                        <textarea id="comment" rows={4} value={comment} onChange={e => setComment(e.target.value)} className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
                    </div>
                    <div className="flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="text-gray-600 bg-white border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700">Cancelar</button>
                        <button type="submit" className="text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 font-medium rounded-lg text-sm px-5 py-2.5">
                            {isEditMode ? 'Guardar Cambios' : 'Enviar Solicitud'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RequestModal;