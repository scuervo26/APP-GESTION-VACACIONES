/**
 * Parses a date string in "dd/mm/yyyy" format into a Date object.
 * Also handles ISO or "yyyy-mm-dd" strings as a fallback.
 * Returns null if the format is invalid.
 * @param dateString - The date string to parse.
 */
export const parseSpanishDate = (dateString: string): Date | null => {
    if (!dateString) return null;
    
    // Check for Spanish format first
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
        const parts = dateString.split('/');
        // Month is 0-indexed in JS Date constructor
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        const date = new Date(Date.UTC(year, month, day));
        
        // Final check to ensure it's a valid date (e.g., not 32/13/2024)
        if (date.getUTCFullYear() === year && date.getUTCMonth() === month && date.getUTCDate() === day) {
            return date;
        }
    }
    
    // Fallback for ISO or yyyy-mm-dd strings
    const d = new Date(dateString);
    if (!isNaN(d.getTime())) {
        return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    }
    
    return null;
};


/**
 * Formats a Date object or a valid date string into "dd/mm/yyyy" format.
 * @param date - The date to format.
 */
export const formatDateToSpanish = (date: Date | string): string => {
    const d = typeof date === 'string' ? parseSpanishDate(date) : date;
    if (!d || isNaN(d.getTime())) {
        return date as string; // Return original string if parsing fails
    }
     // Use UTC methods to prevent timezone shifts
    const day = String(d.getUTCDate()).padStart(2, '0');
    const month = String(d.getUTCMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const year = d.getUTCFullYear();
    return `${day}/${month}/${year}`;
};


/**
 * Formats a date string from "dd/mm/yyyy" to "yyyy-mm-dd" for date input fields.
 * @param spanishDate - The date string in "dd/mm/yyyy".
 */
export const formatSpanishDateForInput = (spanishDate: string): string => {
    const date = parseSpanishDate(spanishDate);
    if (!date) return '';
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Formats a date string from "yyyy-mm-dd" (from date input) to "dd/mm/yyyy" for API submission.
 * @param inputDate - The date string in "yyyy-mm-dd".
 */
export const formatInputDateForApi = (inputDate: string): string => {
    if (!inputDate) return '';
    const parts = inputDate.split('-');
    if (parts.length !== 3) return '';
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
};
