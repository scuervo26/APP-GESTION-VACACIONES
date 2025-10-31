
import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

interface CalendarEvent {
    start: Date;
    end: Date;
    title: string;
}

interface CalendarProps {
    date: Date;
    setDate: (date: Date) => void;
    events: CalendarEvent[];
}

const Calendar: React.FC<CalendarProps> = ({ date, setDate, events }) => {
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const daysOfWeek = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

    const year = date.getFullYear();
    const month = date.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const changeMonth = (offset: number) => {
        const newDate = new Date(date);
        newDate.setMonth(date.getMonth() + offset);
        setDate(newDate);
    };

    const calendarDays = [];
    for (let i = 0; i < startDayOfWeek; i++) {
        calendarDays.push(<div key={`empty-${i}`} className="border-r border-b border-gray-200 dark:border-gray-700"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, month, day);
        const dayEvents = events.filter(e => 
            currentDate >= new Date(e.start.toDateString()) && currentDate <= new Date(e.end.toDateString())
        );

        calendarDays.push(
            <div key={day} className="p-2 border-r border-b border-gray-200 dark:border-gray-700 min-h-[120px]">
                <div className="font-semibold text-gray-700 dark:text-gray-300">{day}</div>
                <div className="mt-1 space-y-1">
                    {dayEvents.map((event, index) => (
                        <div key={index} className="bg-indigo-100 text-indigo-800 text-xs p-1 rounded-md truncate dark:bg-indigo-900 dark:text-indigo-300">
                           {event.title}
                        </div>
                    ))}
                </div>
            </div>
        );
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
            <div className="grid grid-cols-7">
                {daysOfWeek.map(day => (
                    <div key={day} className="text-center font-medium text-gray-500 dark:text-gray-400 p-2 border-b-2 border-gray-200 dark:border-gray-700">{day}</div>
                ))}
                {calendarDays}
            </div>
        </div>
    );
};

export default Calendar;
