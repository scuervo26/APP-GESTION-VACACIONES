
import React, { useContext } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { RequestProvider } from './context/RequestContext';
import Layout from './views/Layout';
import LoginPage from './views/LoginPage';
import EmployeeDashboard from './views/EmployeeDashboard';
import ApproverDashboard from './views/ApproverDashboard';
import TeamCalendarView from './views/TeamCalendarView';
import EmployeeManagementView from './views/EmployeeManagementView';
import { ROLES } from './constants';

const FullScreenLoader: React.FC<{ message: string }> = ({ message }) => (
    <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-800">
        <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-700 dark:text-gray-200">{message}</p>
        </div>
    </div>
);


const App: React.FC = () => {
    const authContext = useContext(AuthContext);
    
    if (!authContext) {
        return <FullScreenLoader message="Inicializando contexto..." />;
    }
    const { isAuthenticated, user, isLoading, error } = authContext;

    if (isLoading) {
        return <FullScreenLoader message="Autenticando y cargando datos..." />;
    }

    if (error) {
        return <LoginPage />; // LoginPage will display the error from context
    }

    if (!isAuthenticated || !user) {
        return <LoginPage />;
    }

    return (
        <HashRouter>
            <RequestProvider>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        {user.role === ROLES.EMPLOYEE && (
                            <>
                                <Route index element={<Navigate to="/dashboard" replace />} />
                                <Route path="dashboard" element={<EmployeeDashboard />} />
                                <Route path="calendar" element={<TeamCalendarView />} />
                            </>
                        )}
                        {user.role === ROLES.APPROVER && (
                             <>
                                <Route index element={<Navigate to="/dashboard" replace />} />
                                <Route path="dashboard" element={<ApproverDashboard />} />
                                <Route path="calendar" element={<TeamCalendarView />} />
                                <Route path="employees" element={<EmployeeManagementView />} />
                            </>
                        )}
                         <Route path="*" element={<Navigate to="/" replace />} />
                    </Route>
                </Routes>
            </RequestProvider>
        </HashRouter>
    );
};

export default App;