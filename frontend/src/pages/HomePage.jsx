// src/pages/HomePage.jsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faMapMarkerAlt, faChevronRight, faUsers, faHeart, faTag, faRupeeSign } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

// Utility for scroll-triggered animations
const AnimateOnScroll = ({ children, variants = { hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0 } }, threshold = 0.2, ...rest }) => {
    const [ref, inView] = useInView({ triggerOnce: true, threshold });
    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={variants}
            transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
            {...rest}
        >
            {children}
        </motion.div>
    );
};

// Expanded list of featured destinations with new hover-specific data
const featuredDestinations = [
  { id: 1, name: "Goa", location: "India", price: 15000, imageUrl: "https://images.unsplash.com/photo-1617478096291-b3b44b6795f9", rating: 4.8, happyTravelers: 50000, popularTags: ['Beach', 'Nightlife', 'Party'] },
  { id: 2, name: "Jaipur", location: "India", price: 22000, imageUrl: "https://images.unsplash.com/photo-1579294520336-eab4decd9649?q=80&w=1786&auto=format&fit=crop", rating: 4.7, happyTravelers: 30000, popularTags: ['Historic', 'Culture', 'Palaces'] },
  { id: 3, name: "Kerala", location: "India", price: 28000, imageUrl: "https://images.unsplash.com/photo-1616428782354-9464b58c73c2", rating: 4.9, happyTravelers: 60000, popularTags: ['Backwaters', 'Nature', 'Relaxation'] },
  { id: 4, name: "Manali", location: "India", price: 18000, imageUrl: "https://images.unsplash.com/photo-1601633535974-2795f661005b", rating: 4.6, happyTravelers: 45000, popularTags: ['Mountain', 'Adventure', 'Snow'] },
  { id: 5, name: "Udaipur", location: "India", price: 20000, imageUrl: "https://images.unsplash.com/photo-1570779774618-977218685e13", rating: 4.9, happyTravelers: 35000, popularTags: ['Lakes', 'Romantic', 'Heritage'] },
  { id: 6, name: "Andaman Islands", location: "India", price: 30000, imageUrl: "https://images.unsplash.com/photo-1610411884394-01314d3a0166", rating: 4.8, happyTravelers: 28000, popularTags: ['Scuba Diving', 'Beaches', 'Islands'] },
  { id: 7, name: "Darjeeling", location: "India", price: 14000, imageUrl: "https://images.unsplash.com/photo-1620246736780-8b1b5e5a9b7e", rating: 4.5, happyTravelers: 20000, popularTags: ['Tea Gardens', 'Hills', 'Scenic'] },
  { id: 8, name: "Shimla", location: "India", price: 16000, imageUrl: "https://images.unsplash.com/photo-1596495578065-6f68c346142a?q=80&w=1974&auto=format&fit=crop", rating: 4.7, happyTravelers: 25000, popularTags: ['Hills', 'Colonial', 'Snow'] },
];

const HomePage = ({ runTour, handleTourCallback }) => { // Removed theme, toggleTheme as they are handled by ScrollNav
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [hoveredCardId, setHoveredCardId] = useState(null);

    const heroVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 80,
                damping: 10,
                staggerChildren: 0.2,
            },
        },
    };

    const textItemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100 } },
    };

    return (
        <div className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-500 overflow-x-hidden">
            {/* Hero Section */}
            <AnimatePresence>
                <motion.section
                    variants={heroVariants}
                    initial="hidden"
                    animate="visible"
                    className="relative flex flex-col items-center justify-center pt-32 pb-24 md:pt-48 md:pb-32 text-center"
                >
                    <motion.h1
                        variants={textItemVariants}
                        className="text-5xl md:text-7xl font-extrabold text-ocean-blue-deep dark:text-ocean-blue-light mb-4 max-w-4xl leading-tight"
                    >
                        {t('heroTitle')}
                    </motion.h1>
                    <motion.p
                        variants={textItemVariants}
                        className="text-lg md:text-2xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl"
                    >
                        {t('heroSubtitle')}
                    </motion.p>
                    <motion.div
                        variants={textItemVariants}
                        className="flex flex-wrap justify-center gap-4"
                    >
                        <motion.button
                            onClick={() => navigate('/plan')}
                            className="px-8 py-4 bg-ocean-blue-deep text-white rounded-full shadow-lg hover:bg-ocean-blue-light transition-colors font-semibold"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {t('planYourTrip')}
                        </motion.button>
                        <motion.button
                            onClick={() => navigate('/explore')}
                            className="px-8 py-4 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full shadow-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors font-semibold"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {t('exploreDestinations')}
                        </motion.button>
                    </motion.div>
                </motion.section>
            </AnimatePresence>

            {/* Stats Section - Removed static stats as they are now part of hover pop-up */}
            {/* Featured Adventures Section */}
            <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
                <AnimateOnScroll className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-ocean-blue-deep dark:text-ocean-blue-light mb-4">{t('featuredAdventuresTitle')}</h2>
                    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        {t('featuredAdventuresSubtitle')}
                    </p>
                </AnimateOnScroll>

                <AnimateOnScroll threshold={0.1} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {featuredDestinations.map((dest, index) => (
                        <motion.div
                            key={dest.id}
                            className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden group cursor-pointer"
                            onMouseEnter={() => setHoveredCardId(dest.id)}
                            onMouseLeave={() => setHoveredCardId(null)}
                            whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="relative h-56 overflow-hidden">
                                <img
                                    src={dest.imageUrl}
                                    alt={dest.name}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-25 group-hover:bg-opacity-40 transition-all duration-300" />
                            </div>
                            <div className="p-6">
                                <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">{dest.name}</h4>
                                <p className="text-gray-600 dark:text-gray-400 flex items-center mb-2">
                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
                                    {dest.location}
                                </p>
                                <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                                    <div className="flex items-center text-yellow-500">
                                        <FontAwesomeIcon icon={faStar} className="mr-1" />
                                        <span className="font-semibold text-gray-800 dark:text-gray-100">{dest.rating}</span>
                                    </div>
                                    <div className="flex items-center font-bold text-green-600 dark:text-green-400">
                                        <FontAwesomeIcon icon={faRupeeSign} className="mr-1" />
                                        {dest.price.toLocaleString('en-IN')} {/* Format price for Indian Rupees */}
                                    </div>
                                </div>
                            </div>

                            {/* Pop-up on Hover */}
                            <AnimatePresence>
                                {hoveredCardId === dest.id && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute bottom-4 left-4 right-4 p-4 bg-white dark:bg-gray-700 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600"
                                    >
                                        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
                                            <li className="flex items-center">
                                                <FontAwesomeIcon icon={faUsers} className="text-blue-500 mr-2" />
                                                <span className="font-bold">{dest.happyTravelers.toLocaleString('en-IN')}+</span> {t('happyTravelers')}
                                            </li>
                                            <li className="flex items-center">
                                                <FontAwesomeIcon icon={faHeart} className="text-red-500 mr-2" />
                                                <span className="font-bold">{dest.rating}</span> {t('rating')}
                                            </li>
                                            <li className="flex items-center">
                                                <FontAwesomeIcon icon={faTag} className="text-green-500 mr-2" />
                                                <span className="font-bold">{t('tags')}:</span> {dest.popularTags.map(tag => t(tag)).join(', ')}
                                            </li>
                                        </ul>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </AnimateOnScroll>
            </div>
        </div>
    );
};

export default HomePage;
