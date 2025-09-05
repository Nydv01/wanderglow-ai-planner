// src/pages/FavoritesPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import DarkModeToggle from '../components/DarkModeToggle';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faEye, faHeart, faCalendarAlt, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';

const FavoritesPage = ({ theme, toggleTheme }) => {
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setFavorites(savedFavorites);
  }, []);

  const handleRemoveFavorite = (id) => {
    const updatedFavorites = favorites.filter(fav => fav.id !== id);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    setFavorites(updatedFavorites);
    toast.success('Itinerary removed from favorites.');
  };

  const handleViewItinerary = (itinerary) => {
    navigate('/output', { state: { itinerary } });
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-500">
      <header className="flex justify-end items-center mb-8">
        <DarkModeToggle toggleTheme={toggleTheme} theme={theme} />
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-600 dark:text-blue-400 mb-2">
            Your Saved Itineraries
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Access your favorite trips here.
          </p>
        </div>

        {favorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
          >
            <FontAwesomeIcon icon={faHeart} className="text-5xl text-gray-400 mb-4" />
            <p className="text-xl text-gray-500 dark:text-gray-400">
              You haven't saved any itineraries yet.
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((fav) => (
              <motion.div
                key={fav.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">{fav.destination}</h3>
                  <div className="text-gray-600 dark:text-gray-400 space-y-1">
                    <p className="flex items-center">
                      <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" /> {fav.duration}-day trip
                    </p>
                    <p className="flex items-center">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" /> {fav.startDate} - {fav.endDate}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  <motion.button
                    onClick={() => handleViewItinerary(fav)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                  >
                    <FontAwesomeIcon icon={faEye} className="mr-2" /> View
                  </motion.button>
                  <motion.button
                    onClick={() => handleRemoveFavorite(fav.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="py-2 px-4 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <FontAwesomeIcon icon={faTrashAlt} />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default FavoritesPage;