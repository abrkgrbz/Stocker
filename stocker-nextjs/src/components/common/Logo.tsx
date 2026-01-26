import React from 'react';

interface LogoProps {
    className?: string;
    width?: number | string;
    height?: number | string;
    showText?: boolean;
}

/**
 * Stoocker Logo component as a scalable SVG.
 * Supports theme coloring via className (e.g., text-white or text-slate-900).
 */
export const Logo: React.FC<LogoProps> = ({
    className = "text-current",
    width = 180,
    height = 40,
    showText = true
}) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 180 40"
            fill="none"
            width={width}
            height={height}
            className={className}
        >
            {/* Stoocker Icon - Abstract S made of stacked layers */}
            <g className="fill-current">
                {/* Top layer */}
                <rect x="4" y="6" width="22" height="4" rx="2" />
                {/* Middle layer 1 */}
                <rect x="8" y="13" width="18" height="4" rx="2" />
                {/* Middle layer 2 */}
                <rect x="4" y="20" width="22" height="4" rx="2" />
                {/* Bottom layer */}
                <rect x="8" y="27" width="18" height="4" rx="2" />
            </g>

            {/* Stoocker Text */}
            {showText && (
                <text
                    x="38"
                    y="28"
                    fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif"
                    fontSize="22"
                    fontWeight="600"
                    className="fill-current"
                >
                    Stoocker
                </text>
            )}
        </svg>
    );
};

export default Logo;
