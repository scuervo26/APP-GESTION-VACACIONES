
import React, { useContext, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ROLES } from '../constants';
import { HomeIcon, CalendarIcon, UsersIcon, LogoutIcon } from '../components/icons';

const NavItem: React.FC<{ to: string; icon: React.ReactNode; label: string; }> = ({ to, icon, label }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            isActive ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
            }`
        }
    >
        {icon}
        <span className="ml-2">{label}</span>
    </NavLink>
);

const Layout: React.FC = () => {
    const authContext = useContext(AuthContext);
    const { user, logout } = authContext!;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-800">
            {/* Top Navigation Bar */}
            <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center">
                            <div className="flex-shrink-0 flex items-center text-xl font-bold text-indigo-600">
                                <CalendarIcon className="w-7 h-7 mr-2"/>
                                <span>VacationHub</span>
                            </div>
                        </div>

                        {/* Navigation Links */}
                        <nav className="hidden md:flex md:items-center md:space-x-4">
                            <NavItem to="/dashboard" icon={<HomeIcon className="w-5 h-5"/>} label="Dashboard" />
                            <NavItem to="/calendar" icon={<CalendarIcon className="w-5 h-5"/>} label="Calendario" />
                            {user?.role === ROLES.APPROVER && (
                                <NavItem to="/employees" icon={<UsersIcon className="w-5 h-5"/>} label="Empleados" />
                            )}
                        </nav>
                        
                        {/* User Menu */}
                        <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 mr-3">{user?.name}</span>
                            <button 
                                onClick={logout}
                                title="Cerrar Sesión"
                                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                            >
                                <LogoutIcon className="w-5 h-5"/>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;