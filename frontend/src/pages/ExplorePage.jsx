// src/pages/ExplorePage.jsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faMapMarkerAlt, faFilter, faSearch, faSortAmountDownAlt, faRupeeSign, faWifi, faUtensils, faSpa, faTimes, faDollarSign, faTag, faMoneyBillWave, faCity, faMountain, faUmbrellaBeach } from '@fortawesome/free-solid-svg-icons'; // Removed faPlaneDeparture

// Image URL from "Patagonia's Glaciers & Mountains"
const patagoniaImageUrl = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070&auto=format&fit=crop";


// Final list of destinations using the specified image URL
const allDestinations = [
    { id: 1, name: "Kyoto, Japan", location: "Japan", budget: "Mid-range", rating: 4.8, category: "City", price: 15000, amenities: ['Wi-Fi', 'Restaurant'], imageUrl: patagoniaImageUrl },
    { id: 2, name: "Bora Bora, French Polynesia", location: "Polynesia", budget: "Luxury", rating: 4.9, category: "Beach", price: 45000, amenities: ['Wi-Fi', 'Pool', 'Spa'], imageUrl: patagoniaImageUrl },
    { id: 3, name: "Banff National Park", location: "Canada", budget: "High-end", rating: 4.7, category: "Mountain", price: 28000, amenities: ['Wi-Fi', 'Restaurant'], imageUrl: patagoniaImageUrl },
    { id: 4, name: "Paris, France", location: "France", budget: "Mid-range", rating: 4.6, category: "City", price: 18000, amenities: ['Wi-Fi', 'Restaurant'], imageUrl: patagoniaImageUrl },
    { id: 5, name: "Santorini, Greece", location: "Greece", budget: "Luxury", rating: 4.9, category: "Beach", price: 32000, amenities: ['Wi-Wi', 'Pool', 'Restaurant'], imageUrl: patagoniaImageUrl },
    { id: 6, name: "Swiss Alps, Switzerland", location: "Switzerland", budget: "High-end", rating: 5.0, category: "Mountain", price: 35000, amenities: ['Wi-Fi', 'Restaurant'], imageUrl: patagoniaImageUrl },
    { id: 7, name: "New York City, USA", location: "USA", budget: "Mid-range", rating: 4.5, category: "City", price: 22000, amenities: ['Wi-Fi', 'Restaurant'], imageUrl: patagoniaImageUrl },
    { id: 8, name: "Maldives", location: "Maldives", budget: "Luxury", rating: 5.0, category: "Beach", price: 50000, amenities: ['Wi-Fi', 'Pool', 'Spa'], imageUrl: patagoniaImageUrl },
    { id: 9, name: "Himalayas, Nepal", location: "Nepal", budget: "Budget", rating: 4.9, category: "Mountain", price: 8000, amenities: ['Wi-Fi'], imageUrl: patagoniaImageUrl },
    { id: 10, name: "Rome, Italy", location: "Italy", budget: "Mid-range", rating: 4.7, category: "City", price: 16000, amenities: ['Wi-Fi', 'Restaurant'], imageUrl: patagoniaImageUrl },
    { id: 11, name: "Phuket, Thailand", location: "Thailand", budget: "Budget", rating: 4.6, category: "Beach", price: 9500, amenities: ['Wi-Fi', 'Pool'], imageUrl: patagoniaImageUrl },
    { id: 12, name: "Patagonia, Argentina", location: "Argentina", budget: "High-end", rating: 4.9, category: "Mountain", price: 25000, amenities: ['Wi-Fi'], imageUrl: patagoniaImageUrl },
    { id: 13, name: "Tokyo, Japan", location: "Japan", budget: "High-end", rating: 4.8, category: "City", price: 29000, amenities: ['Wi-Fi', 'Restaurant'], imageUrl: patagoniaImageUrl },
    { id: 14, name: "Maui, Hawaii", location: "USA", budget: "Luxury", rating: 4.7, category: "Beach", price: 42000, amenities: ['Wi-Fi', 'Pool', 'Spa'], imageUrl: patagoniaImageUrl },
    { id: 15, name: "The Dolomites, Italy", location: "Italy", budget: "High-end", rating: 4.9, category: "Mountain", price: 27000, amenities: ['Wi-Fi', 'Restaurant'], imageUrl: patagoniaImageUrl },
    { id: 16, name: "Cairo, Egypt", location: "Egypt", budget: "Budget", rating: 4.4, category: "City", price: 8500, amenities: ['Wi-Fi'], imageUrl: patagoniaImageUrl },
    { id: 17, name: "Fiji", location: "Fiji", budget: "Luxury", rating: 5.0, category: "Beach", price: 48000, amenities: ['Wi-Fi', 'Pool', 'Spa'], imageUrl: patagoniaImageUrl },
    { id: 18, name: "Grand Canyon, USA", location: "USA", budget: "High-end", rating: 4.8, category: "Mountain", price: 21000, amenities: ['Wi-Fi', 'Restaurant'], imageUrl: patagoniaImageUrl },
    { id: 19, name: "Dubrovnik, Croatia", location: "Croatia", budget: "Mid-range", rating: 4.7, category: "City", price: 17500, amenities: ['Wi-Fi', 'Restaurant'], imageUrl: patagoniaImageUrl },
    { id: 20, name: "Amalfi Coast, Italy", location: "Italy", budget: "Luxury", rating: 4.9, category: "Beach", price: 39000, amenities: ['Wi-Fi', 'Pool'], imageUrl: patagoniaImageUrl },
    { id: 21, name: "Mount Kilimanjaro", location: "Tanzania", budget: "High-end", rating: 4.8, category: "Mountain", price: 30000, amenities: ['Wi-Fi'], imageUrl: patagoniaImageUrl },
    { id: 22, name: "Barcelona, Spain", location: "Spain", budget: "Mid-range", rating: 4.6, category: "City", price: 14000, amenities: ['Wi-Fi', 'Restaurant'], imageUrl: patagoniaImageUrl },
    { id: 23, name: "Cancun, Mexico", location: "Mexico", budget: "Mid-range", rating: 4.5, category: "Beach", price: 13000, amenities: ['Wi-Fi', 'Pool', 'Restaurant'], imageUrl: patagoniaImageUrl },
    { id: 24, name: "Machu Picchu, Peru", location: "Peru", budget: "Budget", rating: 4.9, category: "Mountain", price: 9000, amenities: ['Wi-Fi'], imageUrl: patagoniaImageUrl },
    { id: 25, name: "Lisbon, Portugal", location: "Portugal", budget: "Mid-range", rating: 4.7, category: "City", price: 12500, amenities: ['Wi-Fi', 'Restaurant'], imageUrl: patagoniaImageUrl },
    { id: 26, name: "Bali, Indonesia", location: "Indonesia", budget: "Budget", rating: 4.6, category: "Beach", price: 7500, amenities: ['Wi-Fi', 'Pool', 'Spa'], imageUrl: patagoniaImageUrl },
    { id: 27, name: "Reykjavik, Iceland", location: "Iceland", budget: "High-end", rating: 4.8, category: "Mountain", price: 31000, amenities: ['Wi-Fi', 'Restaurant'], imageUrl: patagoniaImageUrl },
    { id: 28, name: "Prague, Czech Republic", location: "Czech Republic", budget: "Budget", rating: 4.5, category: "City", price: 11000, amenities: ['Wi-Fi', 'Restaurant'], imageUrl: patagoniaImageUrl },
    { id: 29, name: "Rio de Janeiro, Brazil", location: "Brazil", budget: "Mid-range", rating: 4.6, category: "Beach", price: 16000, amenities: ['Wi-Fi', 'Pool'], imageUrl: patagoniaImageUrl },
    { id: 30, name: "Interlaken, Switzerland", location: "Switzerland", budget: "High-end", rating: 4.9, category: "Mountain", price: 33000, amenities: ['Wi-Fi'], imageUrl: patagoniaImageUrl },
    { id: 31, name: "Dubai, UAE", location: "UAE", budget: "Luxury", rating: 4.8, category: "City", price: 38000, amenities: ['Wi-Fi', 'Pool', 'Restaurant', 'Spa'], imageUrl: patagoniaImageUrl },
    { id: 32, name: "Kathmandu, Nepal", location: "Nepal", budget: "Budget", rating: 4.5, category: "City", price: 6500, amenities: ['Wi-Fi'], imageUrl: patagoniaImageUrl },
    { id: 33, name: "Cape Town, South Africa", location: "South Africa", budget: "Mid-range", rating: 4.7, category: "City", price: 19000, amenities: ['Wi-Fi', 'Restaurant'], imageUrl: patagoniaImageUrl },
    { id: 34, name: "Koh Samui, Thailand", location: "Thailand", budget: "Mid-range", rating: 4.8, category: "Beach", price: 14000, amenities: ['Wi-Fi', 'Pool'], imageUrl: patagoniaImageUrl },
    { id: 35, name: "Yosemite National Park", location: "USA", budget: "High-end", rating: 4.9, category: "Mountain", price: 26000, amenities: ['Wi-Fi'], imageUrl: patagoniaImageUrl },
    { id: 36, name: "Amsterdam, Netherlands", location: "Netherlands", budget: "Mid-range", rating: 4.6, category: "City", price: 17000, amenities: ['Wi-Fi', 'Restaurant'], imageUrl: patagoniaImageUrl },
    { id: 37, name: "Hoi An, Vietnam", location: "Vietnam", budget: "Budget", rating: 4.7, category: "City", price: 7000, amenities: ['Wi-Fi'], imageUrl: patagoniaImageUrl },
    { id: 38, name: "Sydney, Australia", location: "Australia", budget: "High-end", rating: 4.7, category: "City", price: 25000, amenities: ['Wi-Fi', 'Restaurant'], imageUrl: patagoniaImageUrl },
    { id: 39, name: "Mount Everest Base Camp", location: "Nepal", budget: "High-end", rating: 5.0, category: "Mountain", price: 38000, amenities: ['Wi-Fi'], imageUrl: patagoniaImageUrl },
];


const ExplorePage = ({ theme, toggleTheme }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [destinations, setDestinations] = useState(allDestinations);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [selectedBudgets, setSelectedBudgets] = useState([]);
    const [selectedAmenities, setSelectedAmenities] = useState([]);
    const [sortBy, setSortBy] = useState('rating');
    const [hoveredDestination, setHoveredDestination] = useState(null);
    const [selectedDestination, setSelectedDestination] = useState(null);

    const categories = ['All', 'City', 'Mountain', 'Beach'];
    const budgets = ['Budget', 'Mid-range', 'High-end', 'Luxury'];
    const amenities = ['Wi-Fi', 'Pool', 'Restaurant', 'Spa'];

    useEffect(() => {
        let filtered = allDestinations.filter(dest =>
            dest.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (activeCategory !== 'All') {
            filtered = filtered.filter(dest => dest.category === activeCategory);
        }
        
        if (selectedBudgets.length > 0) {
            filtered = filtered.filter(dest => selectedBudgets.includes(dest.budget));
        }
        
        if (selectedAmenities.length > 0) {
            filtered = filtered.filter(dest =>
                selectedAmenities.every(amenity => dest.amenities.includes(amenity))
            );
        }

        if (sortBy === 'rating') {
            filtered.sort((a, b) => b.rating - a.rating);
        } else if (sortBy === 'price_asc') {
            filtered.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price_desc') {
            filtered.sort((a, b) => b.price - a.price);
        } else if (sortBy === 'name') {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
        }

        setDestinations(filtered);
    }, [searchQuery, activeCategory, selectedBudgets, selectedAmenities, sortBy]);

    const toggleBudget = (budget) => {
        setSelectedBudgets(prev =>
            prev.includes(budget) ? prev.filter(b => b !== budget) : [...prev, budget]
        );
    };
    
    const toggleAmenity = (amenity) => {
        setSelectedAmenities(prev =>
            prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
        );
    };

    const clearFilters = () => {
        setSearchQuery('');
        setActiveCategory('All');
        setSelectedBudgets([]);
        setSelectedAmenities([]);
        setSortBy('rating');
    };

    const handleMouseEnter = (destination) => {
        setHoveredDestination(destination);
    };

    const handleMouseLeave = () => {
        setHoveredDestination(null);
    };

    const handleViewDetails = (destination) => {
        setSelectedDestination(destination);
    };

    const closeModal = () => {
        setSelectedDestination(null);
    };

    // Define mainColor based on theme
    const mainColor = theme === 'light' ? 'rgb(59, 130, 246)' : 'rgb(96, 165, 250)'; // ocean-blue-deep for light, a lighter blue for dark

    return (
        <div className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 min-h-screen transition-colors duration-500 pt-24 relative overflow-hidden">
            {/* --- Animated Background --- */}
            <svg className="absolute w-full h-full inset-0 z-0 opacity-20" viewBox="0 0 1000 1000" preserveAspectRatio="none">
                {/* Branch 1: From Top-Left */}
                <motion.g>
                <motion.path
                    d="M0,0 Q250,250 500,500"
                    fill="none" stroke={mainColor} strokeWidth="2.5" strokeDasharray="20 20"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: 'easeInOut', delay: 0 }}
                />
                <motion.path
                    d="M0,0 Q100,500 500,750"
                    fill="none" stroke={mainColor} strokeWidth="1.5" strokeDasharray="15 15"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.2 }}
                />
                <motion.path
                    d="M0,0 Q500,100 750,500"
                    fill="none" stroke={mainColor} strokeWidth="1.5" strokeDasharray="15 15"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.4 }}
                />
                </motion.g>

                {/* Branch 2: From Top-Right */}
                <motion.g>
                <motion.path
                    d="M1000,0 Q750,250 500,500"
                    fill="none" stroke={mainColor} strokeWidth="2.5" strokeDasharray="20 20"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.5 }}
                />
                <motion.path
                    d="M1000,0 Q900,500 500,750"
                    fill="none" stroke={mainColor} strokeWidth="1.5" strokeDasharray="15 15"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.7 }}
                />
                <motion.path
                    d="M1000,1000 Q500,900 250,500"
                    fill="none" stroke={mainColor} strokeWidth="1.5" strokeDasharray="15 15"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: 'easeInOut', delay: 1.9 }}
                />
                </motion.g>

                {/* Branch 3: From Bottom-Left */}
                <motion.g>
                <motion.path
                    d="M0,1000 Q250,750 500,500"
                    fill="none" stroke={mainColor} strokeWidth="2.5" strokeDasharray="20 20"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: 'easeInOut', delay: 1 }}
                />
                <motion.path
                    d="M0,1000 Q100,500 500,250"
                    fill="none" stroke={mainColor} strokeWidth="1.5" strokeDasharray="15 15"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: 'easeInOut', delay: 1.2 }}
                />
                <motion.path
                    d="M0,1000 Q500,900 750,500"
                    fill="none" stroke={mainColor} strokeWidth="1.5" strokeDasharray="15 15"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: 'easeInOut', delay: 1.4 }}
                />
                </motion.g>

                {/* Branch 4: From Bottom-Right */}
                <motion.g>
                <motion.path
                    d="M1000,1000 Q750,750 500,500"
                    fill="none" stroke={mainColor} strokeWidth="2.5" strokeDasharray="20 20"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: 'easeInOut', delay: 1.5 }}
                />
                <motion.path
                    d="M1000,1000 Q900,500 500,250"
                    fill="none" stroke={mainColor} strokeWidth="1.5" strokeDasharray="15 15"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: 'easeInOut', delay: 1.7 }}
                />
                <motion.path
                    d="M1000,1000 Q500,900 250,500"
                    fill="none" stroke={mainColor} strokeWidth="1.5" strokeDasharray="15 15"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: 'easeInOut', delay: 1.9 }}
                />
                </motion.g>
            </svg>
            
            {/* Plane animation removed */}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10"> {/* Added relative z-10 */}
                
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-extrabold text-ocean-blue-deep dark:text-ocean-blue-light mb-4">
                        Popular Destinations
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Embark on a journey to the world's most captivating places, where every adventure awaits.
                    </p>
                </motion.div>

                {/* Horizontal Filter Layout */}
                <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg"> {/* Added padding and shadow */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            <FontAwesomeIcon icon={faFilter} className="text-2xl text-ocean-blue-deep dark:text-ocean-blue-light mr-3" />
                            <h2 className="text-xl font-bold">Filters</h2>
                        </div>
                        <motion.button 
                            onClick={clearFilters} 
                            className="text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors px-3 py-1 rounded-full border border-transparent hover:border-red-500"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Clear All
                        </motion.button>
                    </div>

                    <div className="flex flex-col space-y-4">
                        {/* Search & Sort Row */}
                        <div className="flex flex-col md:flex-row items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
                            <div className="relative w-full md:w-1/2">
                                <input
                                    type="text"
                                    id="search"
                                    placeholder="Search by name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-full pl-10 focus:outline-none focus:ring-2 focus:ring-ocean-blue-deep dark:bg-gray-800 dark:border-gray-600"
                                />
                                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            </div>
                            <div className="relative w-full md:w-1/2">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-full appearance-none bg-gray-200 dark:bg-gray-800 dark:border-gray-600 cursor-pointer"
                                >
                                    <option value="rating">Highest Rating</option>
                                    <option value="price_asc">Price: Low to High</option>
                                    <option value="price_desc">Price: High to Low</option>
                                    <option value="name">Name (A-Z)</option>
                                </select>
                                <FontAwesomeIcon icon={faSortAmountDownAlt} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Filter Chips - Horizontal Scrolling */}
                        <div className="flex flex-col space-y-2">
                            <div className="flex items-center space-x-2">
                                <span className="text-sm font-semibold whitespace-nowrap">Categories:</span>
                                <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hidden">
                                    {categories.map(cat => (
                                        <motion.button
                                            key={cat}
                                            onClick={() => setActiveCategory(cat)}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                                                activeCategory === cat
                                                    ? 'bg-ocean-blue-deep text-white shadow-md'
                                                    : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                                            }`}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            {t(cat)}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm font-semibold whitespace-nowrap">Budget:</span>
                                <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hidden">
                                    {budgets.map(budget => (
                                        <motion.button
                                            key={budget}
                                            onClick={() => toggleBudget(budget)}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                                                selectedBudgets.includes(budget)
                                                    ? 'bg-ocean-blue-deep text-white shadow-md'
                                                    : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                                            }`}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            {t(budget)}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm font-semibold whitespace-nowrap">Amenities:</span>
                                <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hidden">
                                    {amenities.map(amenity => (
                                        <motion.button
                                            key={amenity}
                                            onClick={() => toggleAmenity(amenity)}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center whitespace-nowrap ${
                                                selectedAmenities.includes(amenity)
                                                    ? 'bg-ocean-blue-deep text-white shadow-md'
                                                    : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                                            }`}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            {amenity === 'Wi-Fi' && <FontAwesomeIcon icon={faWifi} className="mr-2" />}
                                            {amenity === 'Restaurant' && <FontAwesomeIcon icon={faUtensils} className="mr-2" />}
                                            {amenity === 'Spa' && <FontAwesomeIcon icon={faSpa} className="mr-2" />}
                                            {amenity === 'Pool' && <FontAwesomeIcon icon={faSpa} className="mr-2" />} {/* Using faSpa for pool, adjust if needed */}
                                            {t(amenity)}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Destination Cards Grid */}
                <div className="lg:w-full">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {destinations.length > 0 ? (
                            destinations.map((dest, index) => (
                                <motion.div
                                    key={dest.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.05 }}
                                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden relative group cursor-pointer
                                               hover:scale-103 hover:shadow-xl hover:border-2 hover:border-ocean-blue-light transition-all duration-300 ease-in-out transform-gpu" /* Adjusted scale and added border */
                                    onMouseEnter={() => handleMouseEnter(dest)}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <div className="relative h-48 w-full">
                                        <img
                                            src={dest.imageUrl}
                                            alt={dest.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /* Added image scale on hover */
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-25 group-hover:bg-opacity-40 transition-all duration-300" />
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">{dest.name}</h3>
                                        <p className="text-gray-600 dark:text-gray-400 flex items-center mb-2">
                                            <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
                                            {dest.location}
                                        </p>
                                        <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                                            <div className="flex items-center text-yellow-500">
                                                <FontAwesomeIcon icon={faStar} className="mr-1" />
                                                <span className="font-semibold text-gray-800 dark:text-gray-100">{dest.rating}</span>
                                            </div>
                                            <button
                                                onClick={() => handleViewDetails(dest)}
                                                className="px-4 py-2 bg-ocean-blue-deep text-white rounded-full font-semibold shadow-md
                                                           hover:scale-110 hover:bg-ocean-blue-light transition-all duration-300"
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </div>

                                    {/* Hover Pop-up with Details */}
                                    <AnimatePresence>
                                        {hoveredDestination && hoveredDestination.id === dest.id && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                transition={{ duration: 0.2 }}
                                                // Position the pop-up to the right of the card, adjust ml-4 as needed
                                                className="absolute top-1/2 left-full transform -translate-y-1/2 ml-4 p-4 bg-white dark:bg-gray-700 rounded-lg shadow-xl w-64 z-50 pointer-events-none"
                                            >
                                                <p className="text-sm text-gray-500 dark:text-gray-400 font-bold mb-2">Quick Info:</p>
                                                <ul className="space-y-2 text-sm text-gray-800 dark:text-gray-100 space-y-1">
                                                    <li className="flex items-center">
                                                        <FontAwesomeIcon icon={faMoneyBillWave} className="text-green-500 mr-2" />
                                                        <span className="font-bold">Budget:</span> {t(dest.budget)}
                                                    </li>
                                                    <li className="flex items-center">
                                                        <FontAwesomeIcon icon={faTag} className="text-purple-500 mr-2" />
                                                        <span className="font-bold">Category:</span> {t(dest.category)}
                                                    </li>
                                                    <li className="flex items-start"> {/* Use items-start for multi-line amenities */}
                                                        <FontAwesomeIcon icon={faWifi} className="text-blue-500 mr-2 mt-1" />
                                                        <span className="font-bold">Amenities:</span> {dest.amenities.map(amenity => t(amenity)).join(', ')}
                                                    </li>
                                                </ul>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-10">
                                <h2 className="text-2xl font-bold text-gray-500">No destinations found.</h2>
                                <p className="text-gray-400">Try adjusting your filters or search query.</p>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>

            {/* Details Modal */}
            <AnimatePresence>
                {selectedDestination && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
                        onClick={closeModal}
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 500 }}
                            className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={closeModal}
                                className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <FontAwesomeIcon icon={faTimes} size="lg" />
                            </button>
                            
                            <img
                                src={selectedDestination.imageUrl}
                                alt={selectedDestination.name}
                                className="w-full h-64 object-cover rounded-t-2xl"
                            />
                            
                            <div className="p-8">
                                <h2 className="text-3xl md:text-4xl font-extrabold text-ocean-blue-deep dark:text-ocean-blue-light mb-2">{selectedDestination.name}</h2>
                                <p className="text-lg text-gray-600 dark:text-gray-400 flex items-center">
                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
                                    {selectedDestination.location}
                                </p>
                                
                                <div className="flex items-center text-yellow-500 mt-4">
                                    <FontAwesomeIcon icon={faStar} className="mr-2 text-2xl" />
                                    <span className="text-xl font-semibold">{selectedDestination.rating}</span>
                                </div>
                                
                                <hr className="my-6 border-gray-200 dark:border-gray-700" />
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-xl font-bold mb-3">Pricing & Category</h3>
                                        <p className="mb-2"><span className="font-semibold">Budget:</span> {t(selectedDestination.budget)}</p>
                                        <p><span className="font-semibold">Category:</span> {t(selectedDestination.category)}</p>
                                        <div className="mt-4 text-3xl font-bold text-ocean-blue-deep dark:text-ocean-blue-light">
                                            <FontAwesomeIcon icon={faRupeeSign} />{selectedDestination.price}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <h3 className="text-xl font-bold mb-3">Amenities</h3>
                                        <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                                            {selectedDestination.amenities.map((amenity) => (
                                                <li key={amenity} className="flex items-center">
                                                    {amenity === 'Wi-Fi' && <FontAwesomeIcon icon={faWifi} className="mr-2 text-ocean-blue-deep dark:text-ocean-blue-light" />}
                                                    {amenity === 'Restaurant' && <FontAwesomeIcon icon={faUtensils} className="mr-2 text-ocean-blue-deep dark:text-ocean-blue-light" />}
                                                    {amenity === 'Spa' && <FontAwesomeIcon icon={faSpa} className="mr-2 text-ocean-blue-deep dark:text-ocean-blue-light" />}
                                                    {amenity === 'Pool' && <FontAwesomeIcon icon={faSpa} className="mr-2 text-ocean-blue-deep dark:text-ocean-blue-light" />}
                                                    {t(amenity)}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ExplorePage;
