
import { Role, RequestStatus, RequestType } from './types';

export const ROLES: { [key: string]: Role } = {
    EMPLOYEE: Role.EMPLOYEE,
    APPROVER: Role.APPROVER,
};

export const REQUEST_STATUSES: { [key: string]: RequestStatus } = {
    PENDING: RequestStatus.PENDING,
    APPROVED: RequestStatus.APPROVED,
    REJECTED: RequestStatus.REJECTED,
    MODIFIED: RequestStatus.MODIFIED,
};

export const REQUEST_TYPES: { [key: string]: RequestType } = {
    VACATION: RequestType.VACATION,
    PERSONAL: RequestType.PERSONAL,
};

// --- Google Apps Script Configuration ---

// IMPORTANT: You must deploy the Google Apps Script and paste the
// resulting Web App URL here. See the instructions for details.
export const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz_kQMUE2IhuRXIAm9gJv__Kmv_isDlG5WkWi9oydoLbYRKi-JNQW4jbV4d0IJCHNyj8g/exec';


// Expected column order in the Google Sheets tables. This is crucial for data mapping.
export const USER_TABLE_COLUMNS = ['id', 'name', 'email', 'role', 'annualLeave'];
export const REQUEST_TABLE_COLUMNS = ['id', 'userId', 'userName', 'startDate', 'endDate', 'days', 'type', 'status', 'employeeComment', 'approverComment', 'approvedBy', 'createdAt'];