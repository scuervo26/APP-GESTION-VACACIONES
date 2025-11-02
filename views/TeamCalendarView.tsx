
import React, { useState, useContext } from 'react';
import Calendar from '../components/Calendar';
import { RequestContext } from '../context/RequestContext';
import { REQUEST_STATUSES, REQUEST_TYPES } from '../constants';
import { parseSpanishDate } from '../utils/dateUtils';
import { RequestType } from '../types';

const TeamCalendarView: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const requestContext = useContext(RequestContext);
    const { requests } = requestContext!;

    const relevantRequests = requests.filter(
        req => req.status === REQUEST_STATUSES.APPROVED || req.status === REQUEST_STATUSES.MODIFIED
    );

    const events = relevantRequests
        .map(r => ({
            start: parseSpanishDate(r.startDate),
            end: parseSpanishDate(r.endDate),
            title: r.userName,
            type: r.type
        }))
        .filter((e): e is { start: Date; end: Date; title: string, type: RequestType } => !!e.start && !!e.end);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Calendario del Equipo</h1>
                <p className="mt-1 text-md text-gray-600 dark:text-gray-400">Consulta todos los calendarios de vacaciones del equipo.</p>
            </div>
            <div className="bg-white dark:bg-gray-900 shadow-sm rounded-lg p-6">
                <Calendar 
                    date={currentDate} 
                    setDate={setCurrentDate}
                    events={events}
                />
            </div>
        </div>
    );
};

export default TeamCalendarView;