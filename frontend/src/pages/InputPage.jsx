// src/pages/InputPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingOverlay from '../components/LoadingOverlay';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faHeart, faDollarSign, faPlaneDeparture, faTimesCircle, faGlassMartini, faHandsHelping, faMountain, faSpa, faMicrophone, faArrowRight, faCalendarAlt, faRupeeSign, faStar, faSun } from '@fortawesome/free-solid-svg-icons'; // Changed faEuroSign to faRupeeSign
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const InputPage = ({ theme, toggleTheme }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [interests, setInterests] = useState([]);
  const [budget, setBudget] = useState('moderate');
  const [mood, setMood] = useState('relax');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isListening, setIsListening] = useState(false);
  
  const handleInterestChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setInterests([...interests, value]);
    } else {
      setInterests(interests.filter((i) => i !== value));
    }
  };

  const calculateDuration = (start, end) => {
    if (!start || !end) return 0;
    const startObj = new Date(start);
    const endObj = new Date(end);
    const timeDiff = endObj.getTime() - startObj.getTime();
    const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return dayDiff >= 0 ? dayDiff + 1 : 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const duration = calculateDuration(startDate, endDate);
    
    if (duration <= 0) {
      setError(t('EndDateError')); // Capitalized
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5001/api/generate-itinerary', {
        destination,
        duration,
        interests,
        budget,
        mood,
      });
      navigate('/output', { state: { itinerary: { ...response.data, startDate, endDate, mood } } });
    } catch (err) {
      setError(t('GenerationError')); // Capitalized
      console.error(err);
      setLoading(false);
    }
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error(t('VoiceNotSupported')); // Capitalized
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      toast.loading(t('ListeningPrompt'), { id: 'voice-toast' }); // Capitalized
    };

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      setDestination(speechToText);
      toast.success(t('DestinationSet', { destination: speechToText }), { id: 'voice-toast' }); // Capitalized
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      toast.dismiss('voice-toast');
      console.error("Speech recognition error:", event.error);
      if (event.error === 'not-allowed') {
        toast.error(t('MicrophoneDenied')); // Capitalized
      } else if (event.error === 'no-speech') {
        toast.error(t('NoSpeechDetected')); // Capitalized
      } else {
        toast.error(t('VoiceInputError')); // Capitalized
      }
    };
    
    recognition.onend = () => {
      setIsListening(false);
      toast.dismiss('voice-toast');
    };

    recognition.start();
  };
  
  const mainColor = 'rgb(59, 130, 246)';

  const interestOptions = [
    'history', 'art', 'food', 'nature', 'adventure', 'relaxation', 'shopping', 'nightlife'
  ];

  const budgetOptions = [
    { value: 'budget-friendly', label: t('BudgetFriendly'), icon: faDollarSign }, // Capitalized
    { value: 'moderate', label: t('BudgetModerate'), icon: faRupeeSign }, // Capitalized, changed icon to Rupee
    { value: 'luxury', label: t('BudgetLuxury'), icon: faStar } // Capitalized
  ];

  const moodOptions = [
    { value: 'adventure', label: t('MoodAdventure'), icon: faMountain }, // Capitalized
    { value: 'relax', label: t('MoodRelax'), icon: faSpa }, // Capitalized
    { value: 'wellness', label: t('MoodWellness'), icon: faHandsHelping }, // Capitalized
    { value: 'nightlife', label: t('MoodNightlife'), icon: faGlassMartini }, // Capitalized
  ];

  return (
    <div className="min-h-screen pt-32 pb-8 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-500 flex flex-col items-center relative overflow-hidden"> {/* Increased pt-24 to pt-32 */}
      <AnimatePresence>
        {loading && <LoadingOverlay theme={theme} />}
      </AnimatePresence>
      
      {/* --- Restored and Improved Animated Background --- */}
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
            d="M1000,0 Q500,100 250,500"
            fill="none" stroke={mainColor} strokeWidth="1.5" strokeDasharray="15 15"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.9 }}
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
      
      {/* Plane is synchronized to the main path from the top-left corner */}
      <motion.div
        className="absolute z-10 text-ocean-blue-deep dark:text-ocean-blue-light text-5xl"
        initial={{
          x: '0vw',
          y: '0vh',
          rotate: 0,
          opacity: 0,
        }}
        animate={{
          x: ['0vw', '50vw', '95vw'],
          y: ['0vh', '50vh', '95vh'],
          rotate: [0, 45, 90],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 2.5,
          ease: 'easeInOut',
          repeat: Infinity,
          repeatType: 'reverse'
        }}
      >
        <FontAwesomeIcon icon={faPlaneDeparture} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl w-full p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl space-y-8 z-10"
      >
        <div className="text-center">
          <motion.h1
            className="text-4xl font-extrabold text-ocean-blue-deep dark:text-ocean-blue-light mb-2"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 100 }}
          >
            {t('title')}
          </motion.h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {t('subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
            <label htmlFor="destination" className="block text-sm font-medium mb-2 flex items-center">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-ocean-blue-deep dark:text-ocean-blue-light" />
              {t('DestinationPrompt')}
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                id="destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="flex-1 p-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-ocean-blue-deep focus:border-transparent transition-colors"
                placeholder={t('DestinationPlaceholder')}
                required
              />
              <motion.button
                type="button"
                onClick={handleVoiceInput}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`w-12 h-12 flex items-center justify-center rounded-full text-white transition-all duration-200 shadow-md ${
                  isListening
                    ? 'bg-red-500'
                    : 'bg-ocean-blue-deep hover:bg-ocean-blue-light'
                }`}
              >
                <FontAwesomeIcon 
                  icon={faMicrophone} 
                  className={isListening ? 'animate-pulse' : ''}
                />
              </motion.button>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
              <label htmlFor="startDate" className="block text-sm font-medium mb-2 flex items-center">
                <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-ocean-blue-deep dark:text-ocean-blue-light" />
                {t('From')}
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-ocean-blue-deep focus:border-transparent transition-colors"
                required
              />
            </motion.div>
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
              <label htmlFor="endDate" className="block text-sm font-medium mb-2 flex items-center">
                <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-ocean-blue-deep dark:text-ocean-blue-light" />
                {t('To')}
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-ocean-blue-deep focus:border-transparent transition-colors"
                required
              />
            </motion.div>
          </div>

          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
            <label className="block text-sm font-medium mb-2 flex items-center">
              <FontAwesomeIcon icon={faHeart} className="mr-2 text-ocean-blue-deep dark:text-ocean-blue-light" />
              {t('InterestsPrompt')}
            </label>
            <div className="flex flex-wrap gap-3">
              {interestOptions.map((interest) => (
                <div key={interest}>
                  <input
                    type="checkbox"
                    id={interest}
                    value={interest}
                    onChange={handleInterestChange}
                    className="hidden peer"
                  />
                  <label htmlFor={interest} className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer border
                    ${interests.includes(interest)
                      ? 'bg-ocean-blue-deep text-white shadow-md border-ocean-blue-deep'
                      : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {t(interest)}
                  </label>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
            <label className="block text-sm font-medium mb-2 flex items-center">
              <FontAwesomeIcon icon={faDollarSign} className="mr-2 text-ocean-blue-deep dark:text-ocean-blue-light" />
              {t('BudgetPrompt')}
            </label>
            <div className="flex flex-col sm:flex-row gap-4">
              {budgetOptions.map((option) => (
                <motion.div
                  key={option.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex-1 p-4 rounded-xl cursor-pointer transition-all border shadow-sm
                    ${budget === option.value
                      ? 'bg-ocean-blue-deep text-white border-ocean-blue-deep shadow-lg'
                      : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  onClick={() => setBudget(option.value)}
                >
                  <input
                    type="radio"
                    id={option.value}
                    name="budget"
                    value={option.value}
                    checked={budget === option.value}
                    onChange={() => setBudget(option.value)}
                    className="hidden"
                  />
                  <div className="flex items-center justify-center flex-col">
                    <FontAwesomeIcon icon={option.icon} className="mb-2 text-xl" />
                    <label htmlFor={option.value} className="text-sm font-medium">
                      {option.label}
                    </label>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
            <label className="block text-sm font-medium mb-2 flex items-center">
              <FontAwesomeIcon icon={faSun} className="mr-2 text-ocean-blue-deep dark:text-ocean-blue-light" />
              {t('TripMood')}
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {moodOptions.map((option) => (
                <motion.div
                  key={option.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex-1 p-4 rounded-xl cursor-pointer text-center transition-all border shadow-sm
                    ${mood === option.value
                      ? 'bg-ocean-blue-deep text-white border-ocean-blue-deep shadow-lg'
                      : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  onClick={() => setMood(option.value)}
                >
                  <FontAwesomeIcon icon={option.icon} className="mb-2 text-xl" />
                  <p className="text-sm font-medium">{option.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg"
            >
              <FontAwesomeIcon icon={faTimesCircle} className="mr-2" />
              <p>{error}</p>
            </motion.div>
          )}

          <motion.button
            type="submit"
            whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)" }}
            whileTap={{ scale: 0.95 }}
            className="w-full p-4 text-lg font-bold text-white bg-ocean-blue-deep rounded-xl shadow-lg hover:bg-ocean-blue-light transition-all duration-300 flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="inline-block mr-2"
              >
                <FontAwesomeIcon icon={faPlaneDeparture} />
              </motion.span>
            ) : (
              t('GenerateItinerary')
            )}
            {!loading && <FontAwesomeIcon icon={faArrowRight} className="ml-2" />}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default InputPage;
