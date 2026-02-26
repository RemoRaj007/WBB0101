import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string;
    type: 'info' | 'success' | 'warning' | 'danger' | 'primary';
    icon: LucideIcon;
    change?: string;
    subtitle?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
    title, 
    value, 
    type, 
    icon: Icon, 
    change,
    subtitle
}) => {
    const getColorStyles = () => {
        switch (type) {
            case 'info':
                return {
                    iconBg: 'bg-blue-50',
                    iconColor: 'text-blue-600',
                    badgeBg: 'bg-blue-50',
                    badgeText: 'text-blue-600',
                    border: 'border-blue-100'
                };
            case 'success':
                return {
                    iconBg: 'bg-emerald-50',
                    iconColor: 'text-emerald-600',
                    badgeBg: 'bg-emerald-50',
                    badgeText: 'text-emerald-600',
                    border: 'border-emerald-100'
                };
            case 'warning':
                return {
                    iconBg: 'bg-amber-50',
                    iconColor: 'text-amber-600',
                    badgeBg: 'bg-amber-50',
                    badgeText: 'text-amber-600',
                    border: 'border-amber-100'
                };
            case 'danger':
                return {
                    iconBg: 'bg-rose-50',
                    iconColor: 'text-rose-600',
                    badgeBg: 'bg-rose-50',
                    badgeText: 'text-rose-600',
                    border: 'border-rose-100'
                };
            case 'primary':
                return {
                    iconBg: 'bg-indigo-50',
                    iconColor: 'text-indigo-600',
                    badgeBg: 'bg-indigo-50',
                    badgeText: 'text-indigo-600',
                    border: 'border-indigo-100'
                };
            default:
                return {
                    iconBg: 'bg-gray-50',
                    iconColor: 'text-gray-600',
                    badgeBg: 'bg-gray-50',
                    badgeText: 'text-gray-600',
                    border: 'border-gray-100'
                };
        }
    };

    const colors = getColorStyles();

    return (
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-start justify-between">
                {/* Left Section */}
                <div className="flex items-center gap-3">
                    {/* Icon with subtle background */}
                    <div className={`p-2.5 rounded-lg ${colors.iconBg}`}>
                        <Icon className={`w-5 h-5 ${colors.iconColor}`} />
                    </div>
                    
                    {/* Title and Value */}
                    <div>
                        <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                            {title}
                        </p>
                        <h3 className="text-2xl font-semibold text-gray-800 mt-0.5">
                            {value}
                        </h3>
                    </div>
                </div>

                {/* Change Badge - Only if provided */}
                {change && (
                    <div className={`px-2.5 py-1 rounded-md text-[10px] font-medium ${colors.badgeBg} ${colors.badgeText}`}>
                        {change}
                    </div>
                )}
            </div>

            {/* Subtitle - Only if provided */}
            {subtitle && (
                <div className="mt-3 pt-2 border-t border-gray-100">
                    <p className="text-[10px] text-gray-400">
                        {subtitle}
                    </p>
                </div>
            )}
        </div>
    );
};

export default StatsCard;