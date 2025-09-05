// src/components/ScrollNav.jsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import DarkModeToggle from './DarkModeToggle';
import LanguageSelector from './LanguageSelector';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlaneDeparture, faMapMarkedAlt, faHeart } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next'; // Import useTranslation

const ScrollNav = ({ toggleTheme, theme }) => {
    const { t } = useTranslation(); // Initialize useTranslation
    const [isVisible, setIsVisible] = useState(true);
    const [isAtTop, setIsAtTop] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [hoveredLink, setHoveredLink] = useState(null); // State to track hovered link
    const [isLogoHovered, setIsLogoHovered] = useState(false); // New state for logo hover
    const location = useLocation();

    const handleScroll = () => {
        const currentScrollY = window.scrollY;
        if (currentScrollY > 100) {
            setIsAtTop(false);
            if (currentScrollY > lastScrollY) {
                // Scrolling down
                setIsVisible(false);
            } else {
                // Scrolling up
                setIsVisible(true);
            }
        } else {
            setIsAtTop(true);
            setIsVisible(true);
        }
        setLastScrollY(currentScrollY);
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [lastScrollY]);

    // Helper function to determine if a link is active or hovered
    const isActiveOrHovered = (path) => location.pathname === path || hoveredLink === path;

    return (
        <AnimatePresence>
            <motion.nav
                initial={{ y: 0, opacity: 1 }}
                animate={{ y: isVisible ? 0 : -100, opacity: isVisible ? 1 : 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                    isAtTop
                        ? 'py-6 bg-transparent'
                        : 'py-4 bg-white/50 dark:bg-gray-900/50 backdrop-blur-lg shadow-lg'
                }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    {/* Logo and Brand Name */}
                    <Link
                        to="/"
                        className="flex items-center space-x-2"
                        onMouseEnter={() => setIsLogoHovered(true)} // Set logo hovered state
                        onMouseLeave={() => setIsLogoHovered(false)} // Reset logo hovered state
                    >
                        <motion.svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-8 h-8 text-ocean-blue-deep dark:text-ocean-blue-light"
                            animate={{ rotate: isLogoHovered ? 90 : 0 }} // Rotate on hover
                            transition={{ type: "spring", stiffness: 200, damping: 10 }}
                        >
                            <path d="M12 2l-8 14h6l-2 6 8-14h-6z" />
                        </motion.svg>
                        <motion.span
                            className="text-xl font-bold text-ocean-blue-deep dark:text-ocean-blue-light ml-2"
                            animate={{ scale: isLogoHovered ? 1.05 : 1 }} // Scale text on hover
                            transition={{ type: "spring", stiffness: 200, damping: 10 }}
                        >
                            WanderGlow
                        </motion.span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center space-x-8">
                        {/* Home Link */}
                        <Link
                            to="/"
                            className="relative text-lg font-semibold transition-colors duration-300 px-2 py-1"
                            onMouseEnter={() => setHoveredLink('/')}
                            onMouseLeave={() => setHoveredLink(null)}
                        >
                            <span className={isActiveOrHovered('/') ? 'text-ocean-blue-deep dark:text-ocean-blue-light' : 'text-gray-600 dark:text-gray-300 hover:text-ocean-blue-deep dark:hover:text-ocean-blue-light'}>
                                {t('Home')}
                            </span>
                            {isActiveOrHovered('/') && (
                                <motion.span
                                    layoutId="underline"
                                    className="absolute bottom-[-5px] left-0 h-[3px] bg-ocean-blue-deep dark:bg-ocean-blue-light w-full rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: '100%' }}
                                    exit={{ width: 0 }}
                                    transition={{ duration: 0.3 }}
                                />
                            )}
                        </Link>

                        {/* Explore Link */}
                        <Link
                            to="/explore"
                            className="relative text-lg font-semibold transition-colors duration-300 px-2 py-1 flex items-center"
                            onMouseEnter={() => setHoveredLink('/explore')}
                            onMouseLeave={() => setHoveredLink(null)}
                        >
                            <span className={isActiveOrHovered('/explore') ? 'text-ocean-blue-deep dark:text-ocean-blue-light' : 'text-gray-600 dark:text-gray-300 hover:text-ocean-blue-deep dark:hover:text-ocean-blue-light'}>
                                <FontAwesomeIcon icon={faMapMarkedAlt} className="mr-1" />
                                {t('Explore')}
                            </span>
                            {isActiveOrHovered('/explore') && (
                                <motion.span
                                    layoutId="underline"
                                    className="absolute bottom-[-5px] left-0 h-[3px] bg-ocean-blue-deep dark:bg-ocean-blue-light w-full rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: '100%' }}
                                    exit={{ width: 0 }}
                                    transition={{ duration: 0.3 }}
                                />
                            )}
                        </Link>

                        {/* Plan Trip Link */}
                        <Link
                            to="/plan"
                            className="relative text-lg font-semibold transition-colors duration-300 px-2 py-1 flex items-center"
                            onMouseEnter={() => setHoveredLink('/plan')}
                            onMouseLeave={() => setHoveredLink(null)}
                        >
                            <span className={isActiveOrHovered('/plan') ? 'text-ocean-blue-deep dark:text-ocean-blue-light' : 'text-gray-600 dark:text-gray-300 hover:text-ocean-blue-deep dark:hover:text-ocean-blue-light'}>
                                <FontAwesomeIcon icon={faPlaneDeparture} className="mr-1" />
                                {t('Plan Trip')}
                            </span>
                            {isActiveOrHovered('/plan') && (
                                <motion.span
                                    layoutId="underline"
                                    className="absolute bottom-[-5px] left-0 h-[3px] bg-ocean-blue-deep dark:bg-ocean-blue-light w-full rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: '100%' }}
                                    exit={{ width: 0 }}
                                    transition={{ duration: 0.3 }}
                                />
                            )}
                        </Link>

                        {/* My Trips Link */}
                        <Link
                            to="/favorites"
                            className="relative text-lg font-semibold transition-colors duration-300 px-2 py-1 flex items-center"
                            onMouseEnter={() => setHoveredLink('/favorites')}
                            onMouseLeave={() => setHoveredLink(null)}
                        >
                            <span className={isActiveOrHovered('/favorites') ? 'text-ocean-blue-deep dark:text-ocean-blue-light' : 'text-gray-600 dark:text-gray-300 hover:text-ocean-blue-deep dark:hover:text-ocean-blue-light'}>
                                <FontAwesomeIcon icon={faHeart} className="mr-1" />
                                {t('My Trips')}
                            </span>
                            {isActiveOrHovered('/favorites') && (
                                <motion.span
                                    layoutId="underline"
                                    className="absolute bottom-[-5px] left-0 h-[3px] bg-ocean-blue-deep dark:bg-ocean-blue-light w-full rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: '100%' }}
                                    exit={{ width: 0 }}
                                    transition={{ duration: 0.3 }}
                                />
                            )}
                        </Link>
                    </div>

                    {/* Right-side Toggles and CTA */}
                    <div className="flex items-center space-x-4">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="hidden md:block"
                        >
                            <Link
                                to="/plan"
                                className="px-6 py-2 bg-ocean-blue-deep text-white rounded-full shadow-md hover:bg-ocean-blue-light transition-colors font-semibold"
                            >
                                {t('Start Planning')}
                            </Link>
                        </motion.div>
                        <LanguageSelector />
                        <DarkModeToggle toggleTheme={toggleTheme} theme={theme} />
                    </div>
                </div>
            </motion.nav>
        </AnimatePresence>
    );
};

export default ScrollNav;
