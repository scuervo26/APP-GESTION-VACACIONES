import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { RequestContext } from '../context/RequestContext';
import { User } from '../types';
import { PlusIcon, PencilIcon, TrashIcon } from '../components/icons';
import UserModal from '../components/UserModal';

const EmployeeManagementView: React.FC = () => {
    const authContext = useContext(AuthContext);
    const requestContext = useContext(RequestContext);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<number | null>(null);

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

    const handleSave = async (user: Omit<User, 'id' | 'annualLeave'> & { password?: string }, totalLeave: number) => {
        try {
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
                await updateUser(updatedUser);
            } else { // Adding new user
                await addUser({ ...user, totalLeave, password: user.password });
            }
            setIsModalOpen(false);
            setEditingUser(null);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Un error desconocido ocurrió.";
            console.error("Failed to save user:", error);
            alert(`Error al guardar el empleado: ${errorMessage}`);
        }
    };

    const handleDeleteRequest = (userId: number) => {
        setUserToDelete(userId);
        setIsDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (userToDelete) {
            try {
                // First, remove all requests associated with the user.
                await removeRequestsByUser(userToDelete);
                // Then, delete the user.
                await deleteUser(userToDelete);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Un error desconocido ocurrió.";
                console.error("An error occurred during the delete operation:", error);
                alert(`No se pudo eliminar al empleado. ${errorMessage}`);
            } finally {
                setIsDeleteConfirmOpen(false);
                setUserToDelete(null);
            }
        }
    };

    return (
        <>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Gestión de Empleados</h1>
                    <p className="mt-1 text-md text-gray-600 dark:text-gray-400">Gestiona la información de los empleados y la asignación de vacaciones.</p>
                </div>
                <div className="bg-white dark:bg-gray-900 shadow-sm rounded-lg">
                    <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Miembros del Equipo</h2>
                        <button 
                            onClick={openModalForNew}
                            className="flex items-center bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 transition duration-300 shadow-sm">
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
                                    <th scope="col" className="py-3 px-6 text-center">Total Días</th>
                                    <th scope="col" className="py-3 px-6 text-center">Usados</th>
                                    <th scope="col" className="py-3 px-6 text-center">Disponibles</th>
                                    <th scope="col" className="py-3 px-6 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <td className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap dark:text-white">{user.name}</td>
                                        <td className="py-4 px-6">{user.email}</td>
                                        <td className="py-4 px-6"><span className="bg-indigo-100 text-indigo-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-indigo-900 dark:text-indigo-300">{user.role}</span></td>
                                        <td className="py-4 px-6 text-center">{user.annualLeave.total}</td>
                                        <td className="py-4 px-6 text-center">{user.annualLeave.used}</td>
                                        <td className="py-4 px-6 text-center font-semibold text-gray-800 dark:text-white">{user.annualLeave.available}</td>
                                        <td className="py-4 px-6 text-right space-x-2">
                                            <button onClick={() => openModalForEdit(user)} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700" title="Editar empleado">
                                                <PencilIcon className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDeleteRequest(user.id)} className="p-2 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50" title="Eliminar empleado">
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
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
            {isDeleteConfirmOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center modal-container">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 w-full max-w-md modal-content">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Confirmar Eliminación</h2>
                        <p className="mb-6 text-gray-500 dark:text-gray-400">¿Estás seguro de que quieres eliminar este empleado? Todas sus solicitudes de vacaciones también serán eliminadas.</p>
                        <div className="flex justify-end space-x-4 mt-8">
                            <button type="button" onClick={() => setIsDeleteConfirmOpen(false)} className="text-gray-600 bg-white border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5">Cancelar</button>
                            <button type="button" onClick={confirmDelete} className="text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5">Eliminar</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default EmployeeManagementView;