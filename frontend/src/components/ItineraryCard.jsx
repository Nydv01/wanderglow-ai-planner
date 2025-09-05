// src/components/ItineraryCard.jsx (UPDATED FILE)

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearchLocation, faGripVertical } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const ItineraryCard = ({ day, activity, provided, fetchNearbyPlaces }) => {
  const { t } = useTranslation();
  const [isImageLoading, setIsImageLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsImageLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 rounded-xl shadow-md cursor-grab bg-white dark:bg-gray-800 flex items-center space-x-4"
    >
      <div className="text-xl text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 cursor-grab">
        <FontAwesomeIcon icon={faGripVertical} />
      </div>
      <div className="flex-grow">
        <h4 className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-1">{activity.name}</h4>
        <p className="text-gray-700 dark:text-gray-300">{activity.description}</p>
        
        {/* ✅ NEW FEATURE: The simulated image loading box */}
        <div className="mt-4 relative w-full h-40 bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden">
          {isImageLoading ? (
            <div className="flex flex-col items-center justify-center w-full h-full text-gray-500 dark:text-gray-400">
              <svg className="animate-spin h-8 w-8 mb-3 text-current" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-sm font-medium">Loading your image...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center w-full h-full text-gray-500 dark:text-gray-400 bg-gray-300 dark:bg-gray-600">
              <span className="text-center p-4">Image for {activity.name}</span>
            </div>
          )}
        </div>
      </div>
      <motion.button
        onClick={() => fetchNearbyPlaces(activity.name)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-colors"
      >
        <FontAwesomeIcon icon={faSearchLocation} />
      </motion.button>
    </motion.div>
  );
};

export default ItineraryCard;