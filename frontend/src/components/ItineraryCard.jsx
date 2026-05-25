// src/components/ItineraryCard.jsx

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearchLocation, faGripVertical, faEdit, faTrashAlt, faCheck, faTimes, faClock, faDollarSign } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const ItineraryCard = ({ day, activity, provided, snapshot, fetchNearbyPlaces, onUpdateActivity, onDeleteActivity }) => {
  const { t } = useTranslation();
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  // Editing states
  const [editName, setEditName] = useState(activity.name);
  const [editDescription, setEditDescription] = useState(activity.description);
  const [editTime, setEditTime] = useState(activity.time || '10:00 AM');
  const [editCost, setEditCost] = useState(activity.cost || 0);

  // Fetch live photo from backend scraper
  useEffect(() => {
    let active = true;
    const fetchPhoto = async () => {
      setIsImageLoading(true);
      try {
        const query = activity.imageQuery || `${activity.name} travel`;
        const response = await axios.get(`/api/images/search?query=${encodeURIComponent(query)}`);
        if (active) {
          setImageUrl(response.data.imageUrl);
        }
      } catch (err) {
        console.error('Failed to load activity image:', err);
      } finally {
        if (active) {
          setIsImageLoading(false);
        }
      }
    };

    fetchPhoto();
    return () => { active = false; };
  }, [activity.name, activity.imageQuery]);

  const handleSaveEdit = () => {
    if (onUpdateActivity) {
      onUpdateActivity({
        ...activity,
        name: editName,
        description: editDescription,
        time: editTime,
        cost: parseFloat(editCost) || 0
      });
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(activity.name);
    setEditDescription(activity.description);
    setEditTime(activity.time || '10:00 AM');
    setEditCost(activity.cost || 0);
    setIsEditing(false);
  };

  return (
    <motion.div
      ref={provided.innerRef}
      {...provided.draggableProps}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative p-5 rounded-2xl shadow-md border flex items-start space-x-4 transition-all duration-200 ${
        snapshot?.isDragging
          ? 'border-blue-500/80 bg-blue-50/10 dark:bg-blue-950/20 shadow-2xl scale-[1.02] ring-2 ring-blue-500/10'
          : 'border-gray-150 dark:border-gray-700/50 bg-white dark:bg-gray-800 hover:shadow-lg'
      }`}
    >
      {/* Timeline Node Circle */}
      <div className={`absolute -left-[32px] top-[calc(50%-12px)] w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-650 border-[3.5px] border-white dark:border-gray-800 shadow-md flex items-center justify-center z-20 pointer-events-none pulse-glow ${
        snapshot?.isDragging ? 'scale-110 shadow-blue-500/60 border-blue-550' : 'shadow-blue-500/30'
      }`} />
      {/* Drag handle */}
      <div 
        {...provided.dragHandleProps}
        className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1 cursor-grab active:cursor-grabbing self-center"
      >
        <FontAwesomeIcon icon={faGripVertical} size="lg" />
      </div>

      {/* Main card contents */}
      <div className="flex-grow">
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3 p-3 bg-gray-50 dark:bg-gray-750 rounded-xl border border-gray-200/50 dark:border-gray-700/50"
            >
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Activity Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Description</label>
                <textarea
                  rows="2"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full p-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Time</label>
                  <input
                    type="text"
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    placeholder="e.g. 10:00 AM"
                    className="w-full p-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Cost (USD)</label>
                  <input
                    type="number"
                    value={editCost}
                    onChange={(e) => setEditCost(e.target.value)}
                    className="w-full p-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} className="mr-1" /> Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="px-3 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-bold hover:bg-blue-600 transition-colors"
                >
                  <FontAwesomeIcon icon={faCheck} className="mr-1" /> Save
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Header metadata (Time, Cost) */}
              <div className="flex items-center space-x-4 text-xs font-semibold text-gray-400 dark:text-gray-500 mb-1.5">
                <span className="flex items-center">
                  <FontAwesomeIcon icon={faClock} className="mr-1" />
                  {activity.time || '10:00 AM'}
                </span>
                {activity.cost > 0 && (
                  <span className="flex items-center text-green-600 dark:text-green-400">
                    <FontAwesomeIcon icon={faDollarSign} className="mr-0.5" />
                    {activity.cost} USD
                  </span>
                )}
              </div>

              <h4 className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-1.5">{activity.name}</h4>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{activity.description}</p>
              
              {/* Dynamic Cover Image */}
              <div className="mt-4 relative w-full h-44 bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden shadow-inner group">
                {isImageLoading ? (
                  <div className="flex flex-col items-center justify-center w-full h-full text-gray-400">
                    <svg className="animate-spin h-6 w-6 mb-2 text-current" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : (
                  <motion.img
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    src={imageUrl}
                    alt={activity.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action buttons panel */}
      <div className="flex flex-col space-y-2 self-start pt-1">
        <motion.button
          onClick={() => fetchNearbyPlaces(activity.name)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Explore Nearby Places"
          className="flex items-center justify-center w-8 h-8 bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400 rounded-full hover:bg-green-500 hover:text-white dark:hover:bg-green-500 transition-all"
        >
          <FontAwesomeIcon icon={faSearchLocation} size="sm" />
        </motion.button>
        
        {!isEditing && (
          <>
            <motion.button
              onClick={() => setIsEditing(true)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Edit Activity"
              className="flex items-center justify-center w-8 h-8 bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 rounded-full hover:bg-blue-500 hover:text-white dark:hover:bg-blue-500 transition-all"
            >
              <FontAwesomeIcon icon={faEdit} size="sm" />
            </motion.button>

            <motion.button
              onClick={onDeleteActivity}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Delete Activity"
              className="flex items-center justify-center w-8 h-8 bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400 rounded-full hover:bg-red-50 hover:text-white dark:hover:bg-red-500 transition-all"
            >
              <FontAwesomeIcon icon={faTrashAlt} size="sm" />
            </motion.button>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default ItineraryCard;