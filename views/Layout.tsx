import React, { useContext } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ROLES } from '../constants';
import { HomeIcon, CalendarIcon, UsersIcon, LogoutIcon } from '../components/icons';

const NavItem: React.FC<{ to: string; icon: React.ReactNode; label: string; }> = ({ to, icon, label }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `flex items-center p-2 text-base font-normal rounded-lg transition duration-75 group ${
            isActive ? 'bg-indigo-700 text-white' : 'text-gray-300 hover:bg-indigo-600 hover:text-white'
            }`
        }
    >
        {icon}
        <span className="ml-3">{label}</span>
    </NavLink>
);

const Layout: React.FC = () => {
    const authContext = useContext(AuthContext);
    const { user, logout } = authContext!;

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-800">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 bg-indigo-800 text-white flex flex-col">
                <div className="h-16 flex items-center justify-center text-2xl font-bold border-b border-indigo-700">
                    <CalendarIcon className="w-8 h-8 mr-2"/>
                    <span>Vacaciones</span>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <NavItem to="/dashboard" icon={<HomeIcon className="w-6 h-6"/>} label="Dashboard" />
                    <NavItem to="/calendar" icon={<CalendarIcon className="w-6 h-6"/>} label="Calendario de Equipo" />
                    {user?.role === ROLES.APPROVER && (
                        <NavItem to="/employees" icon={<UsersIcon className="w-6 h-6"/>} label="Gestionar Empleados" />
                    )}
                </nav>
                 <div className="p-4 border-t border-indigo-700">
                     <button 
                        onClick={logout}
                        className="w-full flex items-center p-2 text-base font-normal text-gray-300 rounded-lg hover:bg-indigo-600 hover:text-white group"
                     >
                         <LogoutIcon className="w-6 h-6"/>
                         <span className="ml-3">Cerrar Sesión</span>
                     </button>
                 </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white dark:bg-gray-900 shadow-md flex items-center justify-between px-6">
                    <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                        Bienvenido, {user?.name}
                    </h1>
                     <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full">
                        Rol: <span className="font-medium text-gray-800 dark:text-gray-200">{user?.role}</span>
                    </div>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-800 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
