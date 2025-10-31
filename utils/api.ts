import { GOOGLE_SCRIPT_URL } from '../constants';

// Centralized API call function with improved error handling
export const callApi = async (action: string, payload?: any) => {
    if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes('YOUR_GOOGLE_APPS_SCRIPT_URL_HERE')) {
        throw new Error("La URL de Google Apps Script no está configurada en `constants.ts`. Por favor, despliega el script y añade la URL para continuar.");
    }

    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8', // Required for Apps Script to avoid CORS preflight
            },
            body: JSON.stringify({ action, payload }),
            redirect: 'follow'
        });

        // Google Apps Script can return 200 OK with an error in the body, so we must parse it.
        const result = await response.json();

        if (result.status === 'error') {
            throw new Error(result.message || 'Ha ocurrido un error desconocido en el servidor.');
        }

        return result.data;

    } catch (error: any) {
        console.error(`API Call failed for action "${action}":`, error);
        // Catch network errors specifically
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
             throw new Error("Error de red: No se pudo conectar al servidor. Verifica tu conexión a internet y asegúrate de que la URL en `constants.ts` es correcta y que el script de Google está desplegado y accesible.");
        }
        // Re-throw other errors (like JSON parsing errors or errors from the server)
        throw error;
    }
};
