import React from 'react';
import { motion } from 'framer-motion';
import { Logo } from './Logo'; // Reusing your existing SVG component

/**
 * Props for the Loader component.
 */
interface LoaderProps {
    /** The message to display under the loading animation */
    message?: string;
    /** If true, the loader will occupy the full screen with a backdrop */
    fullScreen?: boolean;
}

/**
 * A reusable loading component featuring a stylized animation and the app logo.
 * Supports both full-screen overlay and inline centering.
 * 
 * @component
 * @param {LoaderProps} props - Component props
 * @returns {JSX.Element} The rendered Loader component
 */
export const Loader: React.FC<LoaderProps> = ({ message = 'Loading Data...', fullScreen = false }) => {
    const containerClasses = fullScreen
        ? "fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-50/80 backdrop-blur-md"
        : "flex flex-col items-center justify-center py-12 w-full h-full min-h-[50vh]";

    return (
        <div className={containerClasses}>
            <div className="relative flex items-center justify-center w-24 h-24 mb-6">
                {/* Outer rotating dashed ring */}
                <motion.div
                    className="absolute inset-0 rounded-full border-t-2 border-r-2 border-brand-500/30 border-dashed"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />

                {/* Inner reverse rotating solid ring */}
                <motion.div
                    className="absolute inset-2 rounded-full border-b-2 border-l-2 border-indigo-500/50"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />

                {/* Pulsing Core Box & Logo */}
                <motion.div
                    className="relative flex items-center justify-center z-10 w-12 h-12 bg-white rounded-xl shadow-lg shadow-brand-500/20 border border-brand-100"
                    animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <Logo className="w-8 h-8 text-brand-600" />
                </motion.div>

                {/* Ambient Glow */}
                <motion.div
                    className="absolute inset-0 bg-brand-500/10 rounded-full blur-xl"
                    animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            </div>

            {/* Animated Text */}
            <div className="flex flex-col items-center">
                <motion.h3
                    className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-indigo-600"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                    {message}
                </motion.h3>

                {/* Loading dots */}
                <div className="flex gap-1 mt-2">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className="w-1.5 h-1.5 bg-brand-400 rounded-full"
                            animate={{ y: [0, -5, 0] }}
                            transition={{
                                duration: 0.6,
                                repeat: Infinity,
                                repeatType: "loop",
                                delay: i * 0.15
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
