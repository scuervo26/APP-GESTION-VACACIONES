import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { RequestContext } from '../context/RequestContext';
import { VacationRequest } from '../types';
import DashboardCard from '../components/DashboardCard';
import RequestTable from '../components/RequestTable';
import RequestModal from '../components/RequestModal';
import { PlusIcon, CalendarIcon, ClockIcon, CheckCircleIcon } from '../components/icons';

const EmployeeDashboard: React.FC = () => {
    const authContext = useContext(AuthContext);
    const requestContext = useContext(RequestContext);
    const { user } = authContext!;
    const { userRequests, addRequest, deleteRequest } = requestContext!;
    
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleNewRequest = (request: Omit<VacationRequest, 'id' | 'userName' | 'userId' | 'createdAt'>) => {
        addRequest(request);
    };

    const handleDeleteRequest = (id: number) => {
        // Confirmation is now handled within the RequestTable component's modal
        deleteRequest(id);
    };
    
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">¡Bienvenido de nuevo!</h1>
                <p className="mt-1 text-md text-gray-600 dark:text-gray-400">Gestiona tus solicitudes de vacaciones y consulta tu estado.</p>
            </div>
            
            {/* Dashboard Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <DashboardCard title="Días Disponibles" value={user!.annualLeave.available.toString()} icon={<ClockIcon/>} iconBgClass="bg-green-100 dark:bg-green-900/50" iconColorClass="text-green-600 dark:text-green-400"/>
                <DashboardCard title="Días Usados" value={user!.annualLeave.used.toString()} icon={<CheckCircleIcon/>} iconBgClass="bg-blue-100 dark:bg-blue-900/50" iconColorClass="text-blue-600 dark:text-blue-400"/>
                <DashboardCard title="Total Anual" value={user!.annualLeave.total.toString()} icon={<CalendarIcon/>} iconBgClass="bg-indigo-100 dark:bg-indigo-900/50" iconColorClass="text-indigo-600 dark:text-indigo-400"/>
            </div>

            {/* Request List */}
            <div className="bg-white dark:bg-gray-900 shadow-sm rounded-lg">
                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Mis Solicitudes de Vacaciones</h3>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        disabled={user!.annualLeave.available <= 0}
                        title={user!.annualLeave.available <= 0 ? "No tienes días disponibles para solicitar" : "Crear una nueva solicitud"}
                        className="flex items-center bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-px disabled:bg-indigo-400 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Nueva Solicitud
                    </button>
                </div>
                <div className="p-6">
                    <RequestTable requests={userRequests} onDelete={handleDeleteRequest}/>
                </div>
            </div>
            
            {isModalOpen && (
                <RequestModal 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleNewRequest}
                    availableDays={user!.annualLeave.available}
                />
            )}
        </div>
    );
};

export default EmployeeDashboard;