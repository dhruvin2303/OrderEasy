import React, { useId } from 'react';

/**
 * Logo component for OrderEazy application.
 * Renders a stylized SVG logo with a dynamic gradient and shadow.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className="w-8 h-8"] - Tailwind CSS classes for styling the SVG container
 * @returns {JSX.Element} The rendered SVG logo
 */
export const Logo = ({ className = "w-8 h-8" }: { className?: string }) => {
    const gradientId = useId();
    const shadowId = useId();

    return (
        <svg
            viewBox="0 0 512 512"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={1} />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={1} />
                </linearGradient>
                <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="4" dy="8" stdDeviation="6" floodOpacity="0.2" />
                </filter>
            </defs>

            <path d="M60 260 L180 380 L300 120 L380 220 L460 60"
                stroke={`url(#${gradientId})`}
                strokeWidth="80"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter={`url(#${shadowId})`} />

            <circle cx="460" cy="60" r="30" fill="#3B82F6" />
        </svg>
    );
};
