import React, { useState, useContext } from 'react';
import Calendar from '../components/Calendar';
import { RequestContext } from '../context/RequestContext';
import { REQUEST_STATUSES } from '../constants';
import { parseSpanishDate } from '../utils/dateUtils';

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
            title: r.userName
        }))
        .filter((e): e is { start: Date; end: Date; title: string } => !!e.start && !!e.end);

    return (
        <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Calendario de Equipo</h2>
            <Calendar 
                date={currentDate} 
                setDate={setCurrentDate}
                events={events}
            />
        </div>
    );
};

export default TeamCalendarView;