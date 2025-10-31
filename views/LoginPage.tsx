
import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CalendarIcon } from '../components/icons';

const LoginPage: React.FC = () => {
    const authContext = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    if (!authContext) return null;
    const { login, isLoading, error } = authContext;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(email && password) {
            login(email, password);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-800 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-lg shadow-md p-8">
                <div className="flex justify-center mb-6">
                     <CalendarIcon className="w-16 h-16 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-200 mb-2">Gestor de Vacaciones</h2>
                <p className="text-center text-gray-600 dark:text-gray-400 mb-8">Inicia sesión para continuar</p>
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email</label>
                        <input 
                            type="email" 
                            id="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" 
                            placeholder="tu.email@ejemplo.com" 
                            required 
                        />
                    </div>
                     <div className="mb-6">
                        <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Contraseña</label>
                        <input 
                            type="password" 
                            id="password" 
                             value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" 
                            placeholder="••••••••" 
                            required 
                        />
                    </div>

                    {isLoading ? (
                         <div className="flex justify-center items-center h-12">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                         </div>
                    ) : (
                        <button
                            type="submit"
                            className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300 ease-in-out"
                        >
                            Iniciar Sesión
                        </button>
                    )}
                    {error && <p className="mt-4 text-center text-red-600 text-sm">{error}</p>}
                </form>
            </div>
             <p className="text-center text-gray-500 text-sm mt-8">
                © 2024 Gestor de Vacaciones. Todos los derechos reservados.
            </p>
        </div>
    );
};

export default LoginPage;