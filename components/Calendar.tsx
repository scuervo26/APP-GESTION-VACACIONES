
import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';
import { RequestType } from '../types';
import { REQUEST_TYPES } from '../constants';

interface CalendarEvent {
    start: Date;
    end: Date;
    title: string;
    type: RequestType;
}

interface CalendarProps {
    date: Date;
    setDate: (date: Date) => void;
    events: CalendarEvent[];
}

const Calendar: React.FC<CalendarProps> = ({ date, setDate, events }) => {
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const daysOfWeek = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

    const year = date.getFullYear();
    const month = date.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay(); // 0 for Sunday

    const changeMonth = (offset: number) => {
        const newDate = new Date(date);
        newDate.setMonth(date.getMonth() + offset);
        setDate(newDate);
    };

    const calendarDays = [];
    // Adjust for Monday start: 0=Mon, 1=Tue, ..., 6=Sun
    const startOffset = (startDayOfWeek === 0) ? 6 : startDayOfWeek - 1;

    // Pad start of month
    for (let i = 0; i < startOffset; i++) {
        calendarDays.push(<div key={`empty-start-${i}`} className="border-r border-b border-gray-200 dark:border-gray-700"></div>);
    }

    // Fill days of month
    for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, month, day);
        const dayOfWeek = currentDate.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        const dayEvents = events.filter(e => 
            currentDate >= new Date(e.start.toDateString()) && currentDate <= new Date(e.end.toDateString())
        );
        
        const weekendClass = isWeekend ? "bg-gray-50 dark:bg-gray-800/50" : "";

        calendarDays.push(
            <div key={day} className={`p-2 border-r border-b border-gray-200 dark:border-gray-700 min-h-[120px] relative ${weekendClass}`}>
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">{day}</div>
                <div className="mt-1 space-y-1">
                    {dayEvents.map((event, index) => {
                         const bgColor = event.type === REQUEST_TYPES.VACATION ? 'bg-green-200' : 'bg-blue-200';
                         const textColor = event.type === REQUEST_TYPES.VACATION ? 'text-green-900' : 'text-blue-900';
                         return (
                            <div key={index} className={`${bgColor} ${textColor} text-xs font-semibold p-1 rounded-md truncate`}>
                               {event.title}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // Pad end of month to fill grid
    const totalCells = startOffset + daysInMonth;
    const remainingCells = (7 - (totalCells % 7)) % 7;
    for (let i = 0; i < remainingCells; i++) {
        calendarDays.push(<div key={`empty-end-${i}`} className="border-r border-b border-gray-200 dark:border-gray-700"></div>);
    }
    
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <ChevronLeftIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </button>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                    {monthNames[month]} {year}
                </h3>
                <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <ChevronRightIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </button>
            </div>
             <div className="flex justify-end items-center space-x-4 mb-4 text-sm">
                <div className="flex items-center">
                    <span className="w-3 h-3 bg-green-200 rounded-full mr-2"></span>
                    <span className="text-gray-600 dark:text-gray-400">Vacaciones</span>
                </div>
                 <div className="flex items-center">
                    <span className="w-3 h-3 bg-blue-200 rounded-full mr-2"></span>
                    <span className="text-gray-600 dark:text-gray-400">Asuntos Propios</span>
                </div>
            </div>
            <div className="grid grid-cols-7 border-t border-l border-gray-200 dark:border-gray-700">
                {daysOfWeek.map(day => (
                    <div key={day} className="text-center font-medium text-gray-500 dark:text-gray-400 p-2 border-r border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">{day}</div>
                ))}
                {calendarDays}
            </div>
        </div>
    );
};

export default Calendar;