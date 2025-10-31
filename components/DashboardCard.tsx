
import React from 'react';

interface DashboardCardProps {
    title: string;
    value: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value }) => {
    return (
        <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <h4 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{title}</h4>
            <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{value}</p>
        </div>
    );
};

export default DashboardCard;