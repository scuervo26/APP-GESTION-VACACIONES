import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { RequestContext } from '../context/RequestContext';
import { User } from '../types';
import { PlusIcon } from '../components/icons';
import UserModal from '../components/UserModal';

const EmployeeManagementView: React.FC = () => {
    const authContext = useContext(AuthContext);
    const requestContext = useContext(RequestContext);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    if (!authContext || !requestContext) return null;
    const { users, addUser, updateUser, deleteUser } = authContext;
    const { removeRequestsByUser } = requestContext;

    const openModalForNew = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const openModalForEdit = (user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleSave = (user: User, totalLeave: number) => {
        if (editingUser) { // Editing existing user
             const updatedUser = {
                ...editingUser,
                ...user,
                annualLeave: {
                    ...editingUser.annualLeave,
                    total: totalLeave,
                    available: totalLeave - editingUser.annualLeave.used,
                }
            };
            updateUser(updatedUser);
        } else { // Adding new user
            addUser({ ...user, totalLeave });
        }
        setIsModalOpen(false);
        setEditingUser(null);
    };

    const handleDelete = (userId: number) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este empleado? Todas sus solicitudes de vacaciones también serán eliminadas.')) {
            deleteUser(userId);
            removeRequestsByUser(userId);
        }
    };

    return (
        <>
            <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Gestionar Empleados</h2>
                    <button 
                        onClick={openModalForNew}
                        className="flex items-center bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-300">
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Añadir Empleado
                    </button>
                </div>
                
                <div className="overflow-x-auto relative">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="py-3 px-6">Nombre</th>
                                <th scope="col" className="py-3 px-6">Email</th>
                                <th scope="col" className="py-3 px-6">Rol</th>
                                <th scope="col" className="py-3 px-6">Días Disponibles</th>
                                <th scope="col" className="py-3 px-6">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap dark:text-white">{user.name}</td>
                                    <td className="py-4 px-6">{user.email}</td>
                                    <td className="py-4 px-6">{user.role}</td>
                                    <td className="py-4 px-6">{user.annualLeave.available} / {user.annualLeave.total}</td>
                                    <td className="py-4 px-6 space-x-2">
                                        <button onClick={() => openModalForEdit(user)} className="font-medium text-indigo-600 dark:text-indigo-500 hover:underline">Editar</button>
                                        <button onClick={() => handleDelete(user.id)} className="font-medium text-red-600 dark:text-red-500 hover:underline">Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && (
                <UserModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    userToEdit={editingUser}
                />
            )}
        </>
    );
};

export default EmployeeManagementView;