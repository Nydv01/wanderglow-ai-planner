// src/components/ScrollNav.jsx

import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import DarkModeToggle from './DarkModeToggle';
import LanguageSelector from './LanguageSelector';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlaneDeparture, faMapMarkedAlt, faHeart, faUserCircle, faSignOutAlt, faFolderOpen } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import AuthModal from './AuthModal';

const ScrollNav = ({ toggleTheme, theme }) => {
    const { t } = useTranslation();
    const { user, logout } = useContext(AuthContext);
    const [isVisible, setIsVisible] = useState(true);
    const [isAtTop, setIsAtTop] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [hoveredLink, setHoveredLink] = useState(null);
    const [isLogoHovered, setIsLogoHovered] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

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

    // Close dropdown on click outside
    useEffect(() => {
        const closeDropdown = () => setIsDropdownOpen(false);
        if (isDropdownOpen) {
            window.addEventListener('click', closeDropdown);
        }
        return () => window.removeEventListener('click', closeDropdown);
    }, [isDropdownOpen]);

    const isActiveOrHovered = (path) => location.pathname === path || hoveredLink === path;

    return (
        <>
            <AnimatePresence>
                <motion.nav
                    initial={{ y: 0, opacity: 1 }}
                    animate={{ y: isVisible ? 0 : -100, opacity: isVisible ? 1 : 0 }}
                    transition={{ type: "spring", stiffness: 100, damping: 15 }}
                    className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                        isAtTop
                            ? 'py-6 bg-transparent'
                            : 'py-4 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md shadow-lg border-b border-gray-200/20 dark:border-gray-800/20'
                    }`}
                >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                        {/* Logo and Brand Name */}
                        <div className="flex-shrink-0 flex items-center">
                            <Link
                                to="/"
                                className="flex items-center space-x-2"
                                onMouseEnter={() => setIsLogoHovered(true)}
                                onMouseLeave={() => setIsLogoHovered(false)}
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
                                    animate={{ rotate: isLogoHovered ? 90 : 0 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                                >
                                    <path d="M12 2l-8 14h6l-2 6 8-14h-6z" />
                                </motion.svg>
                                <motion.span
                                    className="text-xl font-bold text-ocean-blue-deep dark:text-ocean-blue-light ml-2"
                                    animate={{ scale: isLogoHovered ? 1.05 : 1 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                                >
                                    WanderGlow
                                </motion.span>
                            </Link>
                        </div>

                        {/* Navigation Links */}
                        <div className="hidden md:flex items-center space-x-4 lg:space-x-6 xl:space-x-8 mx-4">
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
                            {location.pathname !== '/' && (
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
                            )}

                            {/* My Trips Link */}
                            <Link
                                to={user ? "/my-trips" : "/favorites"}
                                className="relative text-lg font-semibold transition-colors duration-300 px-2 py-1 flex items-center"
                                onMouseEnter={() => setHoveredLink('/my-trips')}
                                onMouseLeave={() => setHoveredLink(null)}
                            >
                                <span className={isActiveOrHovered('/my-trips') || isActiveOrHovered('/favorites') ? 'text-ocean-blue-deep dark:text-ocean-blue-light' : 'text-gray-600 dark:text-gray-300 hover:text-ocean-blue-deep dark:hover:text-ocean-blue-light'}>
                                    <FontAwesomeIcon icon={user ? faFolderOpen : faHeart} className="mr-1" />
                                    {user ? t('My Trips') : t('Favorites')}
                                </span>
                                {(isActiveOrHovered('/my-trips') || isActiveOrHovered('/favorites')) && (
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
                        <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                            {location.pathname !== '/' && (
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="hidden xl:block"
                                >
                                    <Link
                                        to="/plan"
                                        className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full shadow-md hover:shadow-lg transition-all font-semibold whitespace-nowrap"
                                    >
                                        {t('Start Planning')}
                                    </Link>
                                </motion.div>
                            )}
                            
                            <LanguageSelector />
                            <DarkModeToggle toggleTheme={toggleTheme} theme={theme} />

                            {/* Auth Controls */}
                            {user ? (
                                <div className="relative">
                                    <motion.button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsDropdownOpen(!isDropdownOpen);
                                        }}
                                        whileHover={{ scale: 1.05 }}
                                        className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
                                            {user.username.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="hidden sm:inline text-sm font-semibold max-w-[80px] truncate">
                                            {user.username}
                                        </span>
                                    </motion.button>
                                    
                                    {/* Dropdown Menu */}
                                    <AnimatePresence>
                                        {isDropdownOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700/50 p-2 z-50 text-gray-700 dark:text-gray-200"
                                            >
                                                <button
                                                    onClick={() => navigate('/my-trips')}
                                                    className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors flex items-center text-sm font-medium"
                                                >
                                                    <FontAwesomeIcon icon={faFolderOpen} className="mr-3 text-blue-500" />
                                                    My Trips
                                                </button>
                                                <button
                                                    onClick={() => navigate('/favorites')}
                                                    className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors flex items-center text-sm font-medium"
                                                >
                                                    <FontAwesomeIcon icon={faHeart} className="mr-3 text-red-500" />
                                                    Favorites
                                                </button>
                                                <hr className="my-1 border-gray-100 dark:border-gray-700" />
                                                <button
                                                    onClick={logout}
                                                    className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 transition-colors flex items-center text-sm font-semibold"
                                                >
                                                    <FontAwesomeIcon icon={faSignOutAlt} className="mr-3" />
                                                    Sign Out
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <motion.button
                                    onClick={() => setIsAuthModalOpen(true)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-5 py-2 text-sm font-bold text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all border border-gray-200 dark:border-gray-700/50"
                                >
                                    Sign In
                                </motion.button>
                            )}
                        </div>
                    </div>
                </motion.nav>
            </AnimatePresence>

            {/* Auth Modal rendering */}
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />
        </>
    );
};

export default ScrollNav;
