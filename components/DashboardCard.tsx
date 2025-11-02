import React from 'react';

interface DashboardCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    iconBgClass: string;
    iconColorClass: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, iconBgClass, iconColorClass }) => {
    return (
        <div className="bg-white dark:bg-gray-900 shadow-sm rounded-xl p-6 flex items-center space-x-6 transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
            <div className={`flex-shrink-0 w-16 h-16 flex items-center justify-center rounded-full ${iconBgClass}`}>
                <div className={`w-8 h-8 ${iconColorClass}`}>
                    {icon}
                </div>
            </div>
            <div>
                <h4 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">{title}</h4>
                <p className="text-4xl font-bold text-gray-800 dark:text-gray-200">{value}</p>
            </div>
        </div>
    );
};

export default DashboardCard;