import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { User } from '../types';
import { callApi } from '../utils/api';

interface AuthContextType {
    user: User | null;
    users: User[];
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    addUser: (user: Omit<User, 'id' | 'annualLeave'> & { totalLeave: number; password?: string; }) => Promise<void>;
    updateUser: (user: User) => Promise<void>;
    deleteUser: (userId: number) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            const savedUser = sessionStorage.getItem('vacationManagerUser');
            const savedUsers = sessionStorage.getItem('vacationManagerUsers');

            if (savedUser && savedUsers) {
                setUser(JSON.parse(savedUser));
                setUsers(JSON.parse(savedUsers));
                setIsAuthenticated(true);
            }
        } catch (e) {
            console.error("Failed to load session:", e);
            sessionStorage.clear();
        } finally {
            setIsLoading(false);
        }
    }, []);

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await callApi('login', { email, password });
            
            if (data && data.user && data.users) {
                // Parse nested JSON strings from Apps Script response
                if (data.user.annualLeave && typeof data.user.annualLeave === 'string') {
                    try { data.user.annualLeave = JSON.parse(data.user.annualLeave); } catch (e) { console.error("Failed to parse user annualLeave:", e); }
                }
                data.users.forEach((u: User) => {
                    if (u.annualLeave && typeof (u.annualLeave as any) === 'string') {
                        try { u.annualLeave = JSON.parse(u.annualLeave as any); } catch (e) { console.error("Failed to parse user annualLeave in list:", e); }
                    }
                });

                setUser(data.user);
                setUsers(data.users);
                setIsAuthenticated(true);
                sessionStorage.setItem('vacationManagerUser', JSON.stringify(data.user));
                sessionStorage.setItem('vacationManagerUsers', JSON.stringify(data.users));
            } else {
                throw new Error("Respuesta de login inválida del servidor.");
            }
        } catch (e: any) {
            console.error(e);
            setError(e.message || "Fallo en el inicio de sesión.");
            logout(); // Clear session on login failure
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        setUsers([]);
        setIsAuthenticated(false);
        sessionStorage.clear();
    };

    const addUser = async (userData: Omit<User, 'id' | 'annualLeave'> & { totalLeave: number; password?: string }) => {
        try {
            const { totalLeave, ...userPayload } = userData;
            const newUser = await callApi('addUser', { user: userPayload, totalLeave: totalLeave });
            const updatedUsers = [...users, newUser];
            setUsers(updatedUsers);
            sessionStorage.setItem('vacationManagerUsers', JSON.stringify(updatedUsers));
        } catch (error) {
            console.error("Failed to add user:", error);
            throw error;
        }
    };

    const updateUser = async (updatedUser: User) => {
        try {
            const returnedUser = await callApi('updateUser', { user: updatedUser });
            const newUsers = users.map(u => (u.id === returnedUser.id ? returnedUser : u));
            setUsers(newUsers);
            sessionStorage.setItem('vacationManagerUsers', JSON.stringify(newUsers));

            if (user?.id === returnedUser.id) {
                setUser(returnedUser);
                sessionStorage.setItem('vacationManagerUser', JSON.stringify(returnedUser));
            }
        } catch (error) {
            console.error("Failed to update user:", error);
            // Re-throw to allow the calling function (e.g., in RequestContext) to handle the failure.
            throw error;
        }
    };

    const deleteUser = async (userId: number) => {
        try {
            await callApi('deleteUser', { userId });
            const newUsers = users.filter(u => u.id !== userId);
            setUsers(newUsers);
            sessionStorage.setItem('vacationManagerUsers', JSON.stringify(newUsers));
        } catch (error) {
            console.error("Failed to delete user:", error);
            // Re-throw error to be caught by the calling function
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, users, isAuthenticated, isLoading, error, login, logout, addUser, updateUser, deleteUser }}>
            {children}
        </AuthContext.Provider>
    );
};