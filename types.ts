export enum Role {
    EMPLOYEE = 'Empleado',
    APPROVER = 'Aprobador',
}

export interface User {
    id: number;
    name: string;
    email: string;
    role: Role;
    annualLeave: {
        total: number;
        used: number;
        available: number;
    };
}

export enum RequestStatus {
    PENDING = 'Pendiente',
    APPROVED = 'Aprobada',
    REJECTED = 'Rechazada',
    MODIFIED = 'Modificada',
}

export enum RequestType {
    VACATION = 'Vacaciones',
    PERSONAL = 'Asuntos Propios',
}

export interface VacationRequest {
    id: number;
    userId: number;
    userName: string;
    startDate: string;
    endDate: string;
    days: number;
    type: RequestType;
    status: RequestStatus;
    employeeComment?: string;
    approverComment?: string;
    approvedBy?: {
        id: number;
        name: string;
    };
    createdAt: string;
}