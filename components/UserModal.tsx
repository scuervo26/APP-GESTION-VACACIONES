import React, { useState, useEffect } from 'react';
import { User, Role } from '../types';
import { ROLES } from '../constants';

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (user: Omit<User, 'id' | 'annualLeave'> & { password?: string }, totalLeave: number) => void;
    userToEdit: User | null;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSave, userToEdit }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<Role>(ROLES.EMPLOYEE);
    const [totalLeave, setTotalLeave] = useState(22);

    useEffect(() => {
        if (userToEdit) {
            setName(userToEdit.name);
            setEmail(userToEdit.email);
            setRole(userToEdit.role);
            setTotalLeave(userToEdit.annualLeave.total);
            setPassword(''); // Ensure password is not displayed for existing users
        } else {
            // Reset form for new user
            setName('');
            setEmail('');
            setPassword('');
            setRole(ROLES.EMPLOYEE);
            setTotalLeave(22);
        }
    }, [userToEdit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!userToEdit && !password.trim()) {
            alert("La contraseña es obligatoria para los nuevos empleados.");
            return;
        }
        onSave({ name, email, role, password }, totalLeave);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center modal-container">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-lg modal-content">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
                    {userToEdit ? 'Editar Empleado' : 'Añadir Empleado'}
                </h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nombre Completo</label>
                        <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5" />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email</label>
                        <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5" />
                    </div>
                    {!userToEdit && (
                        <div className="mb-4">
                            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Contraseña</label>
                            <input 
                                type="password" 
                                id="password" 
                                value={password} 
                                onChange={e => setPassword(e.target.value)} 
                                required 
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5" 
                                placeholder="••••••••"
                            />
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label htmlFor="role" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Rol</label>
                            <select id="role" value={role} onChange={e => setRole(e.target.value as Role)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5">
                                {Object.values(ROLES).map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                         <div>
                            <label htmlFor="totalLeave" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Días Totales</label>
                            <input type="number" id="totalLeave" value={totalLeave} onChange={e => setTotalLeave(parseInt(e.target.value, 10))} required min="0" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5" />
                        </div>
                    </div>
                    <div className="flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="text-gray-600 bg-white border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5">Cancelar</button>
                        <button type="submit" className="text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 font-medium rounded-lg text-sm px-5 py-2.5">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserModal;