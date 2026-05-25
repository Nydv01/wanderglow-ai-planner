// src/pages/InputPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingOverlay from '../components/LoadingOverlay';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faHeart, faDollarSign, faPlaneDeparture, faTimesCircle, faGlassMartini, faHandsHelping, faMountain, faSpa, faMicrophone, faArrowRight, faArrowLeft, faCalendarAlt, faRupeeSign, faStar, faSun, faSuitcase, faSmile } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const InputPage = ({ theme, toggleTheme }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // Wizard Step
  const [step, setStep] = useState(1);
  
  // Inputs
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [interests, setInterests] = useState([]);
  const [budget, setBudget] = useState('moderate');
  const [mood, setMood] = useState('relax');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isListening, setIsListening] = useState(false);

  // Elite extensions state
  const [dateRange, setDateRange] = useState([null, null]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Prefill hook
  useEffect(() => {
    const preDest = localStorage.getItem('prefilledDest');
    const preBudget = localStorage.getItem('prefilledBudget');
    const preDays = localStorage.getItem('prefilledDays');

    if (preDest) {
      setDestination(preDest);
      localStorage.removeItem('prefilledDest');
    }
    if (preBudget) {
      setBudget(preBudget);
      localStorage.removeItem('prefilledBudget');
    }
    if (preDays) {
      const today = new Date();
      const end = new Date();
      end.setDate(today.getDate() + parseInt(preDays));
      setDateRange([today, end]);
      
      const format = (d) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const date = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${date}`;
      };
      setStartDate(format(today));
      setEndDate(format(end));
      
      localStorage.removeItem('prefilledDays');
    }
  }, []);

  const popularDestinations = [
    { name: 'Paris', country: 'France', flag: '🇫🇷', query: 'Paris, France' },
    { name: 'Tokyo', country: 'Japan', flag: '🇯🇵', query: 'Tokyo, Japan' },
    { name: 'New York', country: 'United States', flag: '🇺🇸', query: 'New York City, USA' },
    { name: 'London', country: 'United Kingdom', flag: '🇬🇧', query: 'London, UK' },
    { name: 'Rome', country: 'Italy', flag: '🇮🇹', query: 'Rome, Italy' },
    { name: 'Sydney', country: 'Australia', flag: '🇦🇺', query: 'Sydney, Australia' },
    { name: 'Cairo', country: 'Egypt', flag: '🇪🇬', query: 'Cairo, Egypt' },
    { name: 'Rio de Janeiro', country: 'Brazil', flag: '🇧🇷', query: 'Rio de Janeiro, Brazil' },
    { name: 'Bangkok', country: 'Thailand', flag: '🇹🇭', query: 'Bangkok, Thailand' },
    { name: 'Cape Town', country: 'South Africa', flag: '🇿🇦', query: 'Cape Town, South Africa' },
    { name: 'Reykjavik', country: 'Iceland', flag: '🇮🇸', query: 'Reykjavik, Iceland' },
    { name: 'Bali', country: 'Indonesia', flag: '🇮🇩', query: 'Bali, Indonesia' }
  ];

  const handleCalendarChange = (value) => {
    setDateRange(value);
    if (value && value[0] && value[1]) {
      const format = (d) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const date = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${date}`;
      };
      setStartDate(format(value[0]));
      setEndDate(format(value[1]));
    } else {
      setStartDate('');
      setEndDate('');
    }
  };

  const handleInterestChange = (interest) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter((i) => i !== interest));
    } else {
      setInterests([...interests, interest]);
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

  const nextStep = () => {
    if (step === 1) {
      if (!destination.trim()) {
        toast.error('Please enter a destination.');
        return;
      }
      if (!startDate || !endDate) {
        toast.error('Please select both dates.');
        return;
      }
      const duration = calculateDuration(startDate, endDate);
      if (duration <= 0) {
        toast.error(t('EndDateError'));
        return;
      }
    }
    if (step === 2) {
      if (interests.length === 0) {
        toast.error('Please select at least one interest.');
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    const duration = calculateDuration(startDate, endDate);
    
    try {
      const response = await axios.post('/api/generate-itinerary', {
        destination,
        duration,
        interests,
        budget,
        mood,
      });
      navigate('/output', { state: { itinerary: { ...response.data, startDate, endDate, mood } } });
    } catch (err) {
      setError(t('GenerationError'));
      console.error(err);
      setLoading(false);
    }
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error(t('VoiceNotSupported'));
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      toast.loading(t('ListeningPrompt'), { id: 'voice-toast' });
    };

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      setDestination(speechToText);
      toast.success(t('DestinationSet', { destination: speechToText }), { id: 'voice-toast' });
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      toast.dismiss('voice-toast');
      console.error("Speech recognition error:", event.error);
      if (event.error === 'not-allowed') {
        toast.error(t('MicrophoneDenied'));
      } else {
        toast.error(t('VoiceInputError'));
      }
    };
    
    recognition.onend = () => {
      setIsListening(false);
      toast.dismiss('voice-toast');
    };

    recognition.start();
  };

  const interestOptions = [
    { value: 'history', label: t('history'), desc: 'Ancient sites, museums & ruins' },
    { value: 'art', label: t('art'), desc: 'Galleries, designs & architecture' },
    { value: 'food', label: t('food'), desc: 'Local delicacies & street food' },
    { value: 'nature', label: t('nature'), desc: 'Parks, hiking & wildlife' },
    { value: 'adventure', label: t('adventure'), desc: 'Extreme sports & active trails' },
    { value: 'relaxation', label: t('relaxation'), desc: 'Spa, beaches & retreats' },
    { value: 'shopping', label: t('shopping'), desc: 'Boutiques, malls & markets' },
    { value: 'nightlife', label: t('nightlife'), desc: 'Pubs, concerts & clubs' }
  ];

  const budgetOptions = [
    { value: 'budget-friendly', label: t('BudgetFriendly'), desc: 'Affordable hostels, street food & free sites', icon: faDollarSign },
    { value: 'moderate', label: t('BudgetModerate'), desc: 'Standard hotels, boutique dining & paid entries', icon: faRupeeSign },
    { value: 'luxury', label: t('BudgetLuxury'), desc: 'Five-star suites, fine dining & private guides', icon: faStar }
  ];

  const moodOptions = [
    { value: 'adventure', label: t('MoodAdventure'), icon: faMountain },
    { value: 'relax', label: t('MoodRelax'), icon: faSpa },
    { value: 'wellness', label: t('MoodWellness'), icon: faHandsHelping },
    { value: 'nightlife', label: t('MoodNightlife'), icon: faGlassMartini },
  ];

  // Animation variants
  const stepVariants = {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0, transition: { type: 'spring', damping: 20, stiffness: 120 } },
    exit: { opacity: 0, x: -40, transition: { ease: 'easeInOut', duration: 0.2 } }
  };

  return (
    <div className="min-h-screen pt-36 pb-16 bg-transparent text-gray-800 dark:text-gray-100 transition-colors duration-500 flex flex-col items-center relative overflow-hidden px-4">
      <AnimatePresence>
        {loading && <LoadingOverlay theme={theme} />}
      </AnimatePresence>
      
      {/* Cinematic Glowing Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-80 h-80 rounded-full bg-blue-500/10 dark:bg-blue-600/5 blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full bg-indigo-500/10 dark:bg-indigo-600/5 blur-3xl" />

      <div className="max-w-2xl w-full z-10 space-y-8">
        
        {/* Step Indicator */}
        <div className="flex items-center justify-between max-w-sm mx-auto mb-4">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div className="flex items-center">
                <div className={`w-9 h-9 rounded-full font-black text-sm flex items-center justify-center transition-all duration-300 shadow-md ${
                  step === s
                    ? 'bg-blue-500 text-white ring-4 ring-blue-500/20'
                    : step > s
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                }`}>
                  {s}
                </div>
                <span className="hidden sm:inline text-xs font-bold ml-2 text-gray-400 dark:text-gray-500">
                  {s === 1 ? 'Destination' : s === 2 ? 'Interests' : 'Budget'}
                </span>
              </div>
              {s < 3 && (
                <div className={`flex-grow h-[2px] mx-2 rounded-full transition-colors duration-300 ${
                  step > s ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-850'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Wizard Panel */}
        <div className="bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200/50 dark:border-gray-800/40 p-8 rounded-3xl shadow-xl">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: DESTINATION & DATES */}
            {step === 1 && (
              <motion.div
                key="step-1"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6"
              >
                <div className="text-center md:text-left mb-6">
                  <h2 className="text-3xl font-black tracking-tight flex items-center gap-2">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-blue-500" />
                    <span>Where & When?</span>
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Select your travel destination and dates to build the itinerary.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="destination" className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                      Destination
                    </label>
                    <div className="relative">
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          id="destination"
                          value={destination}
                          onChange={(e) => {
                            setDestination(e.target.value);
                            setShowSuggestions(true);
                          }}
                          onFocus={() => setShowSuggestions(true)}
                          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                          className="flex-1 p-3.5 border border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-gray-950/50 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-950 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                          placeholder="Enter City or Country (e.g. Paris, Tokyo)"
                          required
                          autoComplete="off"
                        />
                        <motion.button
                          type="button"
                          onClick={handleVoiceInput}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`w-12 h-12 flex items-center justify-center rounded-2xl text-white transition-all shadow-md ${
                            isListening ? 'bg-red-500 animate-pulse' : 'bg-gradient-to-br from-blue-500 to-indigo-650'
                          }`}
                        >
                          <FontAwesomeIcon icon={faMicrophone} />
                        </motion.button>
                      </div>

                      {/* Autocomplete suggestions */}
                      <AnimatePresence>
                        {showSuggestions && destination.trim().length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute z-[100] left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl max-h-56 overflow-y-auto overflow-x-hidden backdrop-blur-md bg-white/95 dark:bg-gray-900/95"
                          >
                            {popularDestinations
                              .filter(d => d.name.toLowerCase().includes(destination.toLowerCase()) || d.country.toLowerCase().includes(destination.toLowerCase()))
                              .map(d => (
                                <button
                                  key={d.name}
                                  type="button"
                                  onClick={() => {
                                    setDestination(d.query);
                                    setShowSuggestions(false);
                                  }}
                                  className="w-full px-4 py-3 text-left hover:bg-blue-500 hover:text-white dark:hover:bg-blue-650 transition-colors flex items-center space-x-3 text-sm font-semibold dark:text-gray-200"
                                >
                                  <span className="text-lg">{d.flag}</span>
                                  <span>{d.name}, {d.country}</span>
                                </button>
                              ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Pulsing Audio waveform indicator for voice listening */}
                  <AnimatePresence>
                    {isListening && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center justify-center space-x-1.5 py-3"
                      >
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <div
                            key={i}
                            className="w-1 bg-red-500 rounded-full animate-bounce"
                            style={{
                              height: `${12 + Math.random() * 24}px`,
                              animationDuration: `${0.4 + Math.random() * 0.4}s`,
                              animationDelay: `${i * 100}ms`
                            }}
                          />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Calendar Range Picker */}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                      Select Date Range
                    </label>
                    <div className="bg-gray-50/50 dark:bg-gray-950/30 p-4 border border-gray-200 dark:border-gray-850 rounded-3xl flex flex-col items-center gap-4">
                      <Calendar
                        onChange={handleCalendarChange}
                        value={dateRange[0] ? dateRange : null}
                        selectRange={true}
                        minDate={new Date()}
                        view="month"
                        minDetail="month"
                        className="react-calendar-range-picker"
                      />
                      
                      {startDate && endDate ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="w-full text-center px-4 py-2.5 bg-blue-500/10 border border-blue-500/25 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold uppercase tracking-wider"
                        >
                          <FontAwesomeIcon icon={faCalendarAlt} className="mr-1.5" />
                          {new Date(startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          {' — '}
                          {new Date(endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          {' '}
                          ({calculateDuration(startDate, endDate)} Days)
                        </motion.div>
                      ) : (
                        <div className="w-full text-center px-4 py-2.5 bg-gray-150 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-500 rounded-xl text-xs font-bold uppercase tracking-wider">
                          Choose Start and End Dates on Calendar above
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-6 flex justify-end">
                  <button
                    onClick={nextStep}
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-650 text-white font-bold rounded-2xl shadow-md transition-colors flex items-center space-x-2"
                  >
                    <span>Choose Interests</span>
                    <FontAwesomeIcon icon={faArrowRight} size="sm" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: INTERESTS */}
            {step === 2 && (
              <motion.div
                key="step-2"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6"
              >
                <div className="text-center md:text-left mb-6">
                  <h2 className="text-3xl font-black tracking-tight flex items-center gap-2">
                    <FontAwesomeIcon icon={faHeart} className="text-red-500" />
                    <span>Choose Activities</span>
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Select what interests you. We will focus daily itineraries on these tags.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {interestOptions.map((opt) => {
                    const isSelected = interests.includes(opt.value);
                    return (
                      <motion.div
                        key={opt.value}
                        onClick={() => handleInterestChange(opt.value)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-4 rounded-2xl border cursor-pointer flex flex-col justify-between h-24 transition-all shadow-sm ${
                          isSelected
                            ? 'bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/10'
                            : 'bg-gray-50/50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-extrabold text-sm capitalize">{opt.label}</span>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // handled by div click
                            className="rounded text-blue-500 focus:ring-0 border-gray-300 pointer-events-none"
                          />
                        </div>
                        <p className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-gray-400 dark:text-gray-500'}`}>{opt.desc}</p>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="pt-6 flex justify-between">
                  <button
                    onClick={prevStep}
                    className="px-6 py-3 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold rounded-2xl transition-colors flex items-center space-x-2"
                  >
                    <FontAwesomeIcon icon={faArrowLeft} size="sm" />
                    <span>Back</span>
                  </button>
                  <button
                    onClick={nextStep}
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-650 text-white font-bold rounded-2xl shadow-md transition-colors flex items-center space-x-2"
                  >
                    <span>Final Style</span>
                    <FontAwesomeIcon icon={faArrowRight} size="sm" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: BUDGET & STYLE */}
            {step === 3 && (
              <motion.div
                key="step-3"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6"
              >
                <div className="text-center md:text-left mb-6">
                  <h2 className="text-3xl font-black tracking-tight flex items-center gap-2">
                    <FontAwesomeIcon icon={faSuitcase} className="text-indigo-500" />
                    <span>Budget & Vibe</span>
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Tailor your trip budget scale and focus style to complete parameters.</p>
                </div>

                <div className="space-y-6">
                  {/* Budget Options */}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                      Select Budget Level
                    </label>
                    <div className="flex flex-col gap-3">
                      {budgetOptions.map((opt) => {
                        const isSelected = budget === opt.value;
                        return (
                          <motion.div
                            key={opt.value}
                            onClick={() => setBudget(opt.value)}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                              isSelected
                                ? 'bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/10'
                                : 'bg-gray-50/50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60'
                            }`}
                          >
                            <div className="flex items-center space-x-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm ${
                                isSelected ? 'bg-white/20 text-white' : 'bg-blue-500/10 text-blue-500'
                              }`}>
                                <FontAwesomeIcon icon={opt.icon} />
                              </div>
                              <div>
                                <h4 className="font-extrabold text-sm">{opt.label}</h4>
                                <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-white/80' : 'text-gray-400 dark:text-gray-500'}`}>{opt.desc}</p>
                              </div>
                            </div>
                            <input
                              type="radio"
                              checked={isSelected}
                              onChange={() => {}}
                              className="text-blue-500 focus:ring-0 pointer-events-none"
                            />
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mood/Vibe Options */}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                      Trip Vibe
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {moodOptions.map((opt) => {
                        const isSelected = mood === opt.value;
                        return (
                          <motion.div
                            key={opt.value}
                            onClick={() => setMood(opt.value)}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className={`p-4 rounded-2xl border cursor-pointer text-center transition-all flex flex-col items-center justify-center gap-2 h-20 ${
                              isSelected
                                ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                                : 'bg-gray-50/50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60'
                            }`}
                          >
                            <FontAwesomeIcon icon={opt.icon} className="text-lg" />
                            <p className="text-xs font-extrabold capitalize">{opt.label}</p>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="pt-6 flex justify-between border-t border-gray-100 dark:border-gray-800/60">
                  <button
                    onClick={prevStep}
                    className="px-6 py-3 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold rounded-2xl transition-colors flex items-center space-x-2"
                  >
                    <FontAwesomeIcon icon={faArrowLeft} size="sm" />
                    <span>Back</span>
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-650 hover:shadow-lg hover:shadow-blue-500/20 text-white font-bold rounded-2xl shadow-md transition-all flex items-center space-x-2"
                  >
                    <span>Generate Itinerary</span>
                    <FontAwesomeIcon icon={faPlaneDeparture} size="sm" />
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default InputPage;
