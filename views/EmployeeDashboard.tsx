import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { RequestContext } from '../context/RequestContext';
import { VacationRequest } from '../types';
import DashboardCard from '../components/DashboardCard';
import RequestTable from '../components/RequestTable';
import RequestModal from '../components/RequestModal';
import { PlusIcon } from '../components/icons';

const EmployeeDashboard: React.FC = () => {
    const authContext = useContext(AuthContext);
    const requestContext = useContext(RequestContext);
    const { user } = authContext!;
    const { userRequests, addRequest } = requestContext!;
    
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleNewRequest = (request: Omit<VacationRequest, 'id' | 'userName' | 'userId' | 'createdAt'>) => {
        addRequest(request);
    };
    
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Tu Resumen</h2>
            
            {/* Dashboard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <DashboardCard title="Días Disponibles" value={user!.annualLeave.available.toString()} />
                <DashboardCard title="Días Usados" value={user!.annualLeave.used.toString()} />
                <DashboardCard title="Total Anual" value={user!.annualLeave.total.toString()} />
            </div>

            {/* Request List */}
            <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Mis Solicitudes</h3>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-300"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Nueva Solicitud
                    </button>
                </div>
                <RequestTable requests={userRequests} />
            </div>
            
            {isModalOpen && (
                <RequestModal 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleNewRequest}
                />
            )}
        </div>
    );
};

export default EmployeeDashboard;