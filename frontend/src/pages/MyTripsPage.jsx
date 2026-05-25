// src/pages/MyTripsPage.jsx

import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolderOpen, faTrashAlt, faEye, faCalendarAlt, faMapMarkerAlt, faLock, faSearch, faSortAmountDown, faChartLine, faDollarSign, faPlane, faGlobe, faShareAlt, faCopy, faTimes } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import AuthModal from '../components/AuthModal';
import toast from 'react-hot-toast';

const MyTripsPage = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  // Sharing states
  const [selectedShareTrip, setSelectedShareTrip] = useState(null);
  const [activeMenuTripId, setActiveMenuTripId] = useState(null);

  const toggleCardMenu = (tripId, e) => {
    e.stopPropagation();
    setActiveMenuTripId(activeMenuTripId === tripId ? null : tripId);
  };

  // trip cover images cache/state
  const [tripImages, setTripImages] = useState({});

  const fetchTripImage = async (tripId, destination) => {
    try {
      const cached = localStorage.getItem(`trip_img_${tripId}`);
      if (cached) {
        setTripImages(prev => ({ ...prev, [tripId]: cached }));
        return;
      }
      const response = await axios.get(`http://localhost:5001/api/images/search?query=${encodeURIComponent(destination)}`);
      if (response.data && response.data.imageUrl) {
        setTripImages(prev => ({ ...prev, [tripId]: response.data.imageUrl }));
        localStorage.setItem(`trip_img_${tripId}`, response.data.imageUrl);
      }
    } catch (err) {
      console.error('Error fetching image for', destination, err);
    }
  };

  // Fetch saved trips
  const fetchTrips = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5001/api/trips');
      setTrips(response.data);
      // Fetch cover images
      response.data.forEach(trip => {
        fetchTripImage(trip.id, trip.destination);
      });
    } catch (err) {
      console.error('Failed to fetch trips:', err);
      toast.error('Could not load saved trips.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTrips();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Handle Delete Trip
  const handleDeleteTrip = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this trip?')) return;

    try {
      await axios.delete(`http://localhost:5001/api/trips/${id}`);
      setTrips(trips.filter(t => t.id !== id));
      toast.success('Trip deleted successfully.');
    } catch (err) {
      console.error('Failed to delete trip:', err);
      toast.error('Failed to delete trip.');
    }
  };

  // View trip detail (Navigates to OutputPage and passes state)
  const handleViewTrip = (trip) => {
    navigate('/output', { state: { itinerary: trip } });
  };

  // Toggle sharing status
  const handleShareClick = (trip, e) => {
    e.stopPropagation();
    if (!trip.isShared) {
      // Enable sharing
      axios.post(`http://localhost:5001/api/trips/share/${trip.id}`, { isShared: true })
        .then(() => {
          trip.isShared = true;
          setSelectedShareTrip(trip);
          fetchTrips();
          toast.success('Public sharing link enabled!');
        })
        .catch(err => {
          console.error(err);
          toast.error('Failed to enable sharing.');
        });
    } else {
      setSelectedShareTrip(trip);
    }
  };

  const copyShareLink = (id) => {
    const link = `http://localhost:5173/share/${id}`;
    navigator.clipboard.writeText(link);
    toast.success('Shared link copied!', { icon: '📋' });
  };

  // Filter & Sort logic
  const filteredTrips = trips
    .filter(trip => trip.destination.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === 'alphabetical') {
        return a.destination.localeCompare(b.destination);
      } else if (sortBy === 'budget') {
        return b.totalBudgetEstimate - a.totalBudgetEstimate;
      }
      return 0;
    });

  // Analytics Math
  const totalTrips = trips.length;
  const uniqueDestinations = new Set(trips.map(t => t.destination)).size;
  const totalBudgetSum = trips.reduce((sum, t) => sum + (t.totalBudgetEstimate || 0), 0);

  // If user is not logged in, render a gorgeous prompt
  if (!user) {
    return (
      <div className="min-h-screen bg-transparent text-gray-800 dark:text-gray-100 transition-colors duration-500 flex flex-col items-center justify-center pt-24 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-xl text-center border border-gray-100 dark:border-gray-700/50 space-y-6"
        >
          <div className="w-16 h-16 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto text-2xl">
            <FontAwesomeIcon icon={faLock} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Access Your Dashboard</h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Sign in to save, customize, share, and track your personalized AI itineraries in one place.
            </p>
          </div>
          <motion.button
            onClick={() => setIsAuthModalOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-3 bg-blue-500 text-white rounded-xl font-bold shadow-lg hover:bg-blue-600 transition-colors"
          >
            Sign In / Sign Up
          </motion.button>
        </motion.div>
        
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-gray-800 dark:text-gray-100 transition-colors duration-500 pt-28 pb-16 px-4 md:px-8 max-w-7xl mx-auto">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-glow text-gray-900 dark:text-white mb-2">My Travel Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage your saved custom travel itineraries and trip metrics.</p>
        </div>
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <motion.div
          whileHover={{ y: -5 }}
          className="p-6 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-150 dark:border-gray-700/50 flex items-center space-x-5"
        >
          <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center text-xl">
            <FontAwesomeIcon icon={faPlane} />
          </div>
          <div>
            <h4 className="text-2xl font-extrabold">{totalTrips}</h4>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold uppercase">Total Trips Planned</p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          className="p-6 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-150 dark:border-gray-700/50 flex items-center space-x-5"
        >
          <div className="w-12 h-12 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center text-xl">
            <FontAwesomeIcon icon={faGlobe} />
          </div>
          <div>
            <h4 className="text-2xl font-extrabold">{uniqueDestinations}</h4>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold uppercase">Unique Cities Visited</p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          className="p-6 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-150 dark:border-gray-700/50 flex items-center space-x-5"
        >
          <div className="w-12 h-12 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center text-xl">
            <FontAwesomeIcon icon={faChartLine} />
          </div>
          <div>
            <h4 className="text-2xl font-extrabold">${totalBudgetSum.toLocaleString()}</h4>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold uppercase">Accumulated Budget</p>
          </div>
        </motion.div>
      </div>

      {/* Budget Chart Panel */}
      {trips.length > 0 && (
        <div className="mb-10">
          <TripBudgetChart trips={trips} />
        </div>
      )}

      {/* Search & Sort Panel */}
      <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-150 dark:border-gray-700/50 flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search saved trips..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 bg-gray-50 dark:bg-gray-900 focus:outline-none dark:text-white text-sm"
          />
          <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>

        <div className="relative w-full md:w-60">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 focus:outline-none dark:text-white text-xs font-semibold cursor-pointer"
          >
            <option value="recent">Sort by: Recently Saved</option>
            <option value="alphabetical">Sort by: Destination Name</option>
            <option value="budget">Sort by: Total Budget</option>
          </select>
        </div>
      </div>

      {/* Trips list */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-t-4 border-gray-200 dark:border-gray-700 rounded-full border-t-blue-500"
          />
        </div>
      ) : filteredTrips.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-150 dark:border-gray-700/50 space-y-4">
          <div className="text-5xl text-gray-300 dark:text-gray-600">
            <FontAwesomeIcon icon={faFolderOpen} />
          </div>
          <h3 className="text-xl font-bold">No trips saved yet</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Generate a travel itinerary and save it to display it on this dashboard.</p>
          <motion.button
            onClick={() => navigate('/plan')}
            whileHover={{ scale: 1.05 }}
            className="px-6 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition-all shadow-md"
          >
            Plan Your First Trip
          </motion.button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTrips.map((trip) => (
            <motion.div
              key={trip.id}
              whileHover={{ y: -6, scale: 1.01 }}
              onClick={() => handleViewTrip(trip)}
              className="group bg-white/70 dark:bg-gray-800/40 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl border border-gray-250 dark:border-gray-700/40 cursor-pointer flex flex-col justify-between backdrop-blur-md transition-all duration-300"
            >
              {/* Trip visual head with hover image zoom */}
              <div className="h-44 relative overflow-hidden flex flex-col justify-end p-6">
                <img
                  src={tripImages[trip.id] || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop'}
                  alt={trip.destination}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent z-10" />
                
                {/* Floating Glass Badge Tag: Public/Private */}
                <div className="absolute top-4 right-4 z-20 px-3 py-1 bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1">
                  <FontAwesomeIcon icon={trip.isShared ? faGlobe : faLock} className={trip.isShared ? "text-purple-300 animate-pulse-slow" : "text-gray-300"} />
                  <span>{trip.isShared ? 'Public' : 'Private'}</span>
                </div>

                <div className="relative z-20 space-y-1">
                  <h3 className="text-2xl font-black text-white leading-tight drop-shadow-md">{trip.destination}</h3>
                  <div className="flex items-center text-white/90 text-xs font-semibold space-x-4">
                    <span className="flex items-center">
                      <FontAwesomeIcon icon={faCalendarAlt} className="mr-1 text-blue-400" />
                      {trip.duration} days
                    </span>
                    <span className="flex items-center">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1 text-red-400" />
                      {trip.startDate ? trip.startDate.substring(5, 10) : 'Anytime'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Trip stats body */}
              <div className="p-6 space-y-5">
                <div className="flex justify-between items-center text-xs font-bold text-gray-455 dark:text-gray-500 tracking-wider">
                  <span>ESTIMATED BUDGET</span>
                  <span>TRIP STYLE</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-black text-green-600 dark:text-green-400 flex items-center">
                    <FontAwesomeIcon icon={faDollarSign} className="text-sm mr-0.5" />
                    {trip.totalBudgetEstimate.toLocaleString()}
                  </span>
                  <span className="px-3.5 py-1 bg-blue-500/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400 border border-blue-500/15 rounded-full text-xs font-extrabold capitalize tracking-wide">
                    {trip.mood}
                  </span>
                </div>
                <div className="pt-4 border-t border-gray-150 dark:border-gray-700/50 flex items-center gap-2 relative">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleViewTrip(trip); }}
                    className="flex-grow py-2.5 bg-blue-500 hover:bg-blue-650 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-1.5"
                  >
                    <FontAwesomeIcon icon={faEye} />
                    <span>View & Customize</span>
                  </button>

                  {/* Actions Dropdown */}
                  <div className="relative">
                    <button
                      onClick={(e) => toggleCardMenu(trip.id, e)}
                      className="p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-750 text-gray-500 dark:text-gray-400 rounded-xl hover:bg-gray-150 dark:hover:bg-gray-800 transition-colors shadow-sm"
                    >
                      <FontAwesomeIcon icon={faSortAmountDown} className="rotate-90" />
                    </button>

                    <AnimatePresence>
                      {activeMenuTripId === trip.id && (
                        <>
                          <div className="fixed inset-0 z-30" onClick={(e) => { e.stopPropagation(); setActiveMenuTripId(null); }} />
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="absolute right-0 bottom-full mb-2 w-44 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-750 rounded-2xl shadow-xl z-40 p-1.5 space-y-0.5"
                          >
                            <button
                              onClick={(e) => { setActiveMenuTripId(null); handleShareClick(trip, e); }}
                              className="w-full text-left px-3 py-2 text-xs font-bold rounded-lg transition-colors text-purple-600 hover:bg-purple-500/10 flex items-center space-x-2"
                            >
                              <FontAwesomeIcon icon={faShareAlt} />
                              <span>{trip.isShared ? 'Get Link' : 'Share Plan'}</span>
                            </button>
                            <button
                              onClick={(e) => { setActiveMenuTripId(null); handleDeleteTrip(trip.id, e); }}
                              className="w-full text-left px-3 py-2 text-xs font-bold rounded-lg transition-colors text-red-500 hover:bg-red-500/10 flex items-center space-x-2"
                            >
                              <FontAwesomeIcon icon={faTrashAlt} />
                              <span>Delete Plan</span>
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Share Modal Dialog */}
      <AnimatePresence>
        {selectedShareTrip && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-850 p-6 rounded-3xl max-w-md w-full shadow-2xl relative border border-white/20 dark:border-gray-700/30 text-center space-y-4"
            >
              <button
                onClick={() => setSelectedShareTrip(null)}
                className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-red-500 hover:text-white transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
              
              <div className="w-12 h-12 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center mx-auto text-xl">
                <FontAwesomeIcon icon={faShareAlt} />
              </div>
              
              <div>
                <h3 className="font-extrabold text-xl">Share {selectedShareTrip.destination} Itinerary</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Copy the public URL below to share with family and friends.</p>
              </div>

              <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-900 p-2.5 rounded-xl border border-gray-200 dark:border-gray-750">
                <input
                  type="text"
                  readOnly
                  value={`http://localhost:5173/share/${selectedShareTrip.id}`}
                  className="flex-grow bg-transparent text-xs outline-none select-all font-mono"
                />
                <button
                  onClick={() => copyShareLink(selectedShareTrip.id)}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg text-xs font-bold hover:bg-purple-650 transition-colors"
                >
                  Copy
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// TripBudgetChart Component using pure React & Tailwind styled Bars
const TripBudgetChart = ({ trips }) => {
  if (!trips || trips.length === 0) return null;
  const maxBudget = Math.max(...trips.map(t => t.totalBudgetEstimate || 100));
  
  // Render up to 6 trips in chart
  const chartTrips = trips.slice(0, 6);
  
  return (
    <div className="bg-white/70 dark:bg-gray-800/40 backdrop-blur-md p-6 rounded-3xl border border-gray-250 dark:border-gray-700/50 shadow-lg space-y-4">
      <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400">Trip Budget Comparisons</h3>
      <div className="relative h-48 flex items-end justify-between gap-4 pt-6 px-2">
        {chartTrips.map((trip, idx) => {
          const budget = trip.totalBudgetEstimate || 0;
          const percentage = (budget / maxBudget) * 100;
          return (
            <div key={trip.id} className="flex-1 flex flex-col items-center h-full justify-end group/bar">
              {/* Tooltip on hover */}
              <div className="opacity-0 group-hover/bar:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] px-2 py-1 rounded-md absolute top-0 transform -translate-y-2 pointer-events-none font-bold">
                ${budget.toLocaleString()}
              </div>
              
              {/* Dynamic Bar */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${percentage}%` }}
                transition={{ type: 'spring', delay: idx * 0.1 }}
                className="w-full bg-gradient-to-t from-blue-500 to-indigo-500 rounded-t-lg group-hover/bar:from-blue-400 group-hover/bar:to-indigo-400 transition-all shadow-md group-hover/bar:shadow-indigo-500/20"
                style={{ minHeight: '6px' }}
              />
              
              <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-2 truncate w-full text-center font-bold tracking-tight">
                {trip.destination.split(',')[0]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyTripsPage;