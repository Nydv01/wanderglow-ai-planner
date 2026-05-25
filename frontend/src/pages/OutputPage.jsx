// src/pages/OutputPage.jsx

import React, { useEffect, useState, useRef, useCallback, useContext } from 'react';
import { useLocation as useRouterLocation, useNavigate as useRouterNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faShareAlt, faCalendarPlus, faSun, faCloud, faBolt, faSnowflake, faWind, faMapMarkedAlt, faCloudRain, faHeart as faSolidHeart, faCamera, faSearchLocation, faTimes, faGripVertical, faStar as faSolidStar, faRupeeSign, faPlus, faSave, faChevronLeft, faShareSquare, faCopy, faLink, faPlane, faHotel, faCalendarAlt, faBed } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faRegularHeart, faStar as faRegularStar } from '@fortawesome/free-regular-svg-icons';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import DayItineraryCard from '../components/DayItineraryCard';
import InteractiveMap from '../components/InteractiveMap';
import { AuthContext } from '../context/AuthContext';
import AuthModal from '../components/AuthModal';
import axios from 'axios';

const generateMockFlights = (dest) => {
  const code = dest ? dest.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '') : 'JFK';
  const arrivalCode = code.length === 3 ? code : 'LHR';
  return [
    {
      airline: 'Delta Air Lines',
      flightNo: 'DL-' + Math.floor(1000 + Math.random() * 9000),
      price: Math.floor(350 + Math.random() * 600),
      departure: 'JFK',
      arrival: arrivalCode,
      duration: '7h 15m'
    },
    {
      airline: 'Emirates',
      flightNo: 'EK-' + Math.floor(100 + Math.random() * 800),
      price: Math.floor(800 + Math.random() * 1000),
      departure: 'JFK',
      arrival: arrivalCode,
      duration: '12h 45m'
    },
    {
      airline: 'Lufthansa',
      flightNo: 'LH-' + Math.floor(100 + Math.random() * 800),
      price: Math.floor(450 + Math.random() * 700),
      departure: 'JFK',
      arrival: arrivalCode,
      duration: '9h 30m'
    }
  ];
};

const generateMockHotels = (dest, baseLat = 48.8566, baseLng = 2.3522) => {
  return [
    {
      name: `The Grand ${dest} Resort`,
      rating: 4.8,
      pricePerNight: Math.floor(150 + Math.random() * 300),
      description: 'A luxurious retreat in the heart of the city with breathtaking views and top-tier amenities.',
      imageQuery: `${dest} grand hotel luxury resort`,
      lat: baseLat + 0.012,
      lng: baseLng - 0.015
    },
    {
      name: `${dest} Boutique Suites`,
      rating: 4.6,
      pricePerNight: Math.floor(90 + Math.random() * 120),
      description: 'Charming historic boutique hotel with localized decor, free Wi-Fi, and a rooftop bar.',
      imageQuery: `${dest} boutique hotel rooms`,
      lat: baseLat - 0.02,
      lng: baseLng + 0.015
    },
    {
      name: `${dest} Plaza Lodging`,
      rating: 4.3,
      pricePerNight: Math.floor(50 + Math.random() * 60),
      description: 'Affordable modern apartments close to transit hubs and popular local restaurants.',
      imageQuery: `${dest} modern hotel plaza`,
      lat: baseLat + 0.005,
      lng: baseLng - 0.02
    }
  ];
};

const OutputPage = ({ theme }) => {
  const { t } = useTranslation();
  const location = useRouterLocation();
  const navigate = useRouterNavigate();
  const { user } = useContext(AuthContext);
  
  // States
  const [itinerary, setItinerary] = useState(location.state?.itinerary);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [draggableItinerary, setDraggableItinerary] = useState([]);
  const [starRating, setStarRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [showNearbyModal, setShowNearbyModal] = useState(false);
  const [loadingNearby, setLoadingNearby] = useState(false);
  
  // Flights & Hotels selection states
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [flights, setFlights] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [activeTab, setActiveTab] = useState('itinerary');
  
  // Auth and Save states
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savedTripId, setSavedTripId] = useState(null);
  const [isShared, setIsShared] = useState(false);
  const [shareLink, setShareLink] = useState('');
  
  // Adding custom activity states
  const [showAddFormDay, setShowAddFormDay] = useState(null); // stores day number
  const [newActName, setNewActName] = useState('');
  const [newActDesc, setNewActDesc] = useState('');
  const [newActTime, setNewActTime] = useState('12:00 PM');
  const [newActCost, setNewActCost] = useState('0');
  const [newActLat, setNewActLat] = useState('');
  const [newActLng, setNewActLng] = useState('');

  const contentRef = useRef(null);
  const calendarRef = useRef(null);

  // Initialize and Sync itinerary
  useEffect(() => {
    if (!itinerary) {
      navigate('/input', { replace: true });
    } else {
      setDraggableItinerary(itinerary.itinerary || []);
      setSavedTripId(itinerary.id || null);
      setIsSaved(!!itinerary.id);
      setIsShared(!!itinerary.isShared);
      if (itinerary.id) {
        setShareLink(`http://localhost:5173/share/${itinerary.id}`);
      }

      // Sync flights and hotels
      const baseLat = itinerary.itinerary?.[0]?.activities?.[0]?.lat || 48.8566;
      const baseLng = itinerary.itinerary?.[0]?.activities?.[0]?.lng || 2.3522;

      const loadedFlights = itinerary.flights && itinerary.flights.length > 0
        ? itinerary.flights
        : generateMockFlights(itinerary.destination);
      const loadedHotels = itinerary.hotels && itinerary.hotels.length > 0
        ? itinerary.hotels
        : generateMockHotels(itinerary.destination, baseLat, baseLng);

      setFlights(loadedFlights);
      setHotels(loadedHotels);
      setSelectedFlight(itinerary.selectedFlight || null);
      setSelectedHotel(itinerary.selectedHotel || null);

      // Check favorites
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      const isFav = favorites.some(fav => 
        fav.destination === itinerary.destination && 
        fav.startDate === itinerary.startDate
      );
      setIsFavorite(isFav);
    }
  }, [itinerary, navigate]);

  if (!itinerary) return null;

  // Toggle Favorite
  const handleToggleFavorite = () => {
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const id = itinerary.id || `${itinerary.destination}-${itinerary.startDate}`;
    const itineraryData = { ...itinerary, id, itinerary: draggableItinerary };

    if (isFavorite) {
      favorites = favorites.filter(fav => fav.id !== id);
      toast.success('Removed from local favorites.');
    } else {
      favorites.push(itineraryData);
      toast.success('Saved to local favorites.');
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
    setIsFavorite(!isFavorite);
  };

  // Drag and Drop reordering
  const onDragEnd = (result) => {
    const { destination, source } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    if (source.droppableId.startsWith('activities-')) {
      const dayIndex = draggableItinerary.findIndex(day => `activities-${day.day}` === source.droppableId);
      const day = { ...draggableItinerary[dayIndex] };
      const newActivities = Array.from(day.activities);
      const [removed] = newActivities.splice(source.index, 1);
      newActivities.splice(destination.index, 0, removed);

      const newDay = { ...day, activities: newActivities };
      const newDraggableItinerary = Array.from(draggableItinerary);
      newDraggableItinerary[dayIndex] = newDay;
      setDraggableItinerary(newDraggableItinerary);

      // Auto-save changes in background if already saved to DB
      if (isSaved && savedTripId) {
        autoSaveTrip(newDraggableItinerary);
      }
    }
  };

  // Recalculates total budget with current selections
  const calculateTotalBudgetWithSelections = (days, flightVal, hotelVal) => {
    let sum = 0;
    days.forEach(day => {
      day.activities.forEach(act => {
        if (act.cost) sum += parseFloat(act.cost);
      });
    });
    if (flightVal && flightVal.price) {
      sum += parseFloat(flightVal.price);
    }
    if (hotelVal && hotelVal.pricePerNight) {
      const durationVal = itinerary.duration || days.length || 1;
      sum += parseFloat(hotelVal.pricePerNight) * durationVal;
    }
    return sum > 0 ? sum : itinerary.totalBudgetEstimate;
  };

  // Auto save helper
  const autoSaveTrip = async (updatedItinerary) => {
    try {
      const budgetSum = calculateTotalBudgetWithSelections(updatedItinerary, selectedFlight, selectedHotel);
      await axios.put(`http://localhost:5001/api/trips/${savedTripId}`, {
        itinerary: updatedItinerary,
        totalBudgetEstimate: budgetSum
      });
      setItinerary(prev => ({
        ...prev,
        itinerary: updatedItinerary,
        totalBudgetEstimate: budgetSum
      }));
    } catch (err) {
      console.error('Auto save failed:', err);
    }
  };

  // Recalculates total budget from all activity costs
  const calculateTotalBudget = (days) => {
    return calculateTotalBudgetWithSelections(days, selectedFlight, selectedHotel);
  };

  // Update specific activity
  const handleUpdateActivity = (dayNum, activityIndex, updatedActivity) => {
    const newItinerary = Array.from(draggableItinerary);
    const dayIndex = newItinerary.findIndex(d => d.day === dayNum);
    
    if (dayIndex !== -1) {
      newItinerary[dayIndex].activities[activityIndex] = updatedActivity;
      setDraggableItinerary(newItinerary);

      const newBudget = calculateTotalBudget(newItinerary);
      setItinerary(prev => ({
        ...prev,
        totalBudgetEstimate: newBudget
      }));

      toast.success('Activity updated!');
      if (isSaved && savedTripId) {
        autoSaveTrip(newItinerary);
      }
    }
  };

  // Delete activity
  const handleDeleteActivity = (dayNum, activityIndex) => {
    const newItinerary = Array.from(draggableItinerary);
    const dayIndex = newItinerary.findIndex(d => d.day === dayNum);
    
    if (dayIndex !== -1) {
      newItinerary[dayIndex].activities.splice(activityIndex, 1);
      setDraggableItinerary(newItinerary);

      const newBudget = calculateTotalBudget(newItinerary);
      setItinerary(prev => ({
        ...prev,
        totalBudgetEstimate: newBudget
      }));

      toast.success('Activity removed!');
      if (isSaved && savedTripId) {
        autoSaveTrip(newItinerary);
      }
    }
  };

  // Add custom activity
  const handleAddActivity = (dayNum) => {
    if (!newActName.trim()) {
      toast.error('Activity name is required.');
      return;
    }

    const lat = parseFloat(newActLat) || (itinerary.itinerary[0]?.activities[0]?.lat || 48.8566) + (Math.random() - 0.5) * 0.05;
    const lng = parseFloat(newActLng) || (itinerary.itinerary[0]?.activities[0]?.lng || 2.3522) + (Math.random() - 0.5) * 0.05;

    const newActivity = {
      name: newActName,
      description: newActDesc,
      time: newActTime,
      cost: parseFloat(newActCost) || 0,
      lat,
      lng,
      imageQuery: `${newActName} ${itinerary.destination}`
    };

    const newItinerary = Array.from(draggableItinerary);
    const dayIndex = newItinerary.findIndex(d => d.day === dayNum);
    
    if (dayIndex !== -1) {
      newItinerary[dayIndex].activities.push(newActivity);
      setDraggableItinerary(newItinerary);

      const newBudget = calculateTotalBudget(newItinerary);
      setItinerary(prev => ({
        ...prev,
        totalBudgetEstimate: newBudget
      }));

      toast.success('Custom activity added!');
      
      // Reset form
      setShowAddFormDay(null);
      setNewActName('');
      setNewActDesc('');
      setNewActTime('12:00 PM');
      setNewActCost('0');
      setNewActLat('');
      setNewActLng('');

      if (isSaved && savedTripId) {
        autoSaveTrip(newItinerary);
      }
    }
  };

  // Save to DB Dashboard
  const handleSaveToDashboard = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      toast('Please log in to save trips to your profile!', { icon: '🔐' });
      return;
    }

    try {
      const payload = {
        ...itinerary,
        itinerary: draggableItinerary,
        flights: flights || [],
        hotels: hotels || [],
        selectedFlight,
        selectedHotel,
        totalBudgetEstimate: calculateTotalBudget(draggableItinerary)
      };

      let response;
      if (isSaved && savedTripId) {
        response = await axios.put(`http://localhost:5001/api/trips/${savedTripId}`, payload);
        toast.success('Trip updates saved to dashboard!');
      } else {
        response = await axios.post('http://localhost:5001/api/trips', payload);
        setSavedTripId(response.data.id);
        setIsSaved(true);
        setShareLink(`http://localhost:5173/share/${response.data.id}`);
        toast.success('Trip saved to your Dashboard!');
      }
    } catch (error) {
      console.error('Error saving trip to database:', error);
      toast.error('Failed to save trip to profile.');
    }
  };

  // Toggle Sharing Link
  const handleToggleShare = async () => {
    if (!isSaved || !savedTripId) {
      toast.error('Please save this trip to your dashboard first.');
      return;
    }

    try {
      const response = await axios.post(`http://localhost:5001/api/trips/share/${savedTripId}`, {
        isShared: !isShared
      });
      setIsShared(response.data.isShared);
      if (response.data.isShared) {
        toast.success('Public sharing link enabled!');
      } else {
        toast.success('Public sharing link disabled.');
      }
    } catch (err) {
      console.error('Sharing failed:', err);
      toast.error('Failed to toggle public sharing.');
    }
  };

  // Copy share link
  const copyShareLink = () => {
    if (!shareLink) return;
    navigator.clipboard.writeText(shareLink);
    toast.success('Share link copied to clipboard!', { icon: '📋' });
  };

  // Fetch nearby places
  const fetchNearbyPlaces = (activityName) => {
    setLoadingNearby(true);
    setShowNearbyModal(true);
    
    setTimeout(() => {
      const mockPlaces = [
        { place_id: '1', name: `${activityName} Cafe`, formatted_address: '123 Main Street', rating: 4.5, user_ratings_total: 120 },
        { place_id: '2', name: `Historic ${activityName} Museum`, formatted_address: '456 Elm Street', rating: 4.8, user_ratings_total: 250 },
        { place_id: '3', name: `City Park near ${activityName}`, formatted_address: '789 Oak Avenue', rating: 4.2, user_ratings_total: 80 },
      ];
      setNearbyPlaces(mockPlaces);
      setLoadingNearby(false);
    }, 1200);
  };

  // PDF Export
  const downloadPDF = async () => {
    toast.promise(
      (async () => {
        const content = contentRef.current;
        if (content) {
          const canvas = await html2canvas(content, {
            scale: 2,
            useCORS: true,
            logging: false,
            width: content.scrollWidth,
            height: content.scrollHeight,
          });
          const imgData = canvas.toDataURL('image/jpeg', 1.0);
          const pdf = new jsPDF('p', 'mm', 'a4');
          const imgProps = pdf.getImageProperties(imgData);
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
          let position = 0;
          pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
          if (pdfHeight > pdf.internal.pageSize.getHeight()) {
            const pageHeight = pdf.internal.pageSize.getHeight();
            let heightLeft = pdfHeight - pageHeight;
            position = -pageHeight;
            while (heightLeft > 0) {
              pdf.addPage();
              pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
              heightLeft -= pageHeight;
              position -= pageHeight;
            }
          }
          pdf.save(`itinerary-${itinerary.destination.toLowerCase().replace(/ /g, '-')}.pdf`);
        }
      })(),
      {
        loading: 'Compiling PDF document...',
        success: 'PDF downloaded!',
        error: 'Failed to export PDF.'
      }
    );
  };

  // Calendar Export
  const downloadCalendarPDF = async () => {
    toast.promise(
      (async () => {
        const calendarElement = calendarRef.current;
        if (calendarElement) {
          const canvas = await html2canvas(calendarElement, {
            scale: 2,
            useCORS: true,
          });
          const imgData = canvas.toDataURL('image/jpeg', 1.0);
          const pdf = new jsPDF('p', 'mm', 'a4');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          
          pdf.text(`Trip Calendar: ${itinerary.destination}`, pdfWidth / 2, 15, { align: 'center' });
          pdf.addImage(imgData, 'JPEG', 15, 25, pdfWidth - 30, (pdfWidth - 30) * (canvas.height / canvas.width));
          pdf.save(`itinerary-calendar-${itinerary.destination.toLowerCase().replace(/ /g, '-')}.pdf`);
        }
      })(),
      {
        loading: 'Exporting calendar...',
        success: 'Calendar PDF downloaded!',
        error: 'Failed to export calendar.'
      }
    );
  };

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const tripDates = itinerary.itinerary.map(day => {
        const d = new Date(itinerary.startDate);
        d.setDate(d.getDate() + day.day - 1);
        return d.toDateString();
      });
      if (tripDates.includes(date.toDateString())) {
        return 'highlighted-date';
      }
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-gray-800 dark:text-gray-100 transition-colors duration-500 pt-28 pb-12 px-4 md:px-8 relative">
      <header className="max-w-7xl mx-auto flex items-center justify-between mb-8">
        <button
          onClick={() => navigate('/plan')}
          className="flex items-center space-x-2 text-xs font-black text-gray-500 hover:text-blue-500 uppercase tracking-widest transition-colors"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
          <span>New Itinerary</span>
        </button>
      </header>

      {/* Share Link Drawer */}
      <AnimatePresence>
        {isShared && shareLink && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="max-w-7xl mx-auto mb-8 overflow-hidden"
          >
            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <FontAwesomeIcon icon={faLink} className="text-purple-500 text-lg" />
                <div>
                  <h4 className="font-bold text-sm text-purple-700 dark:text-purple-400">Your Itinerary is Publicly Accessible!</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Anyone with this link can view your itinerary and interactive map.</p>
                </div>
              </div>
              <div className="flex w-full sm:w-auto items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={shareLink}
                  className="flex-1 sm:w-80 p-2 text-xs border border-purple-200 dark:border-purple-800 rounded-lg bg-white dark:bg-gray-800 outline-none select-all"
                />
                <button
                  onClick={copyShareLink}
                  className="px-4 py-2 bg-purple-500 text-white text-xs font-bold rounded-lg hover:bg-purple-600 transition-colors flex items-center space-x-1"
                >
                  <FontAwesomeIcon icon={faCopy} />
                  <span>Copy</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Days & Itinerary List (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="text-center md:text-left mb-6">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-glow text-gray-900 dark:text-white mb-2">
              {itinerary.destination} Trip
            </h1>
            <p className="text-sm md:text-base font-medium text-gray-500 dark:text-gray-400">
              A {itinerary.duration}-day custom adventure
            </p>
          </div>

          {/* Tab Selector Bar */}
          <div className="flex bg-white dark:bg-gray-800 p-1.5 rounded-2xl border border-gray-250 dark:border-gray-700/50 shadow-sm gap-2">
            <button
              onClick={() => setActiveTab('itinerary')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-black tracking-wider uppercase transition-all flex items-center justify-center space-x-2 ${
                activeTab === 'itinerary'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-850 dark:hover:text-white'
              }`}
            >
              <FontAwesomeIcon icon={faCalendarAlt} />
              <span>Itinerary</span>
            </button>
            <button
              onClick={() => setActiveTab('flights')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-black tracking-wider uppercase transition-all flex items-center justify-center space-x-2 ${
                activeTab === 'flights'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-850 dark:hover:text-white'
              }`}
            >
              <FontAwesomeIcon icon={faPlane} />
              <span>Flights</span>
              {selectedFlight && (
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('hotels')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-black tracking-wider uppercase transition-all flex items-center justify-center space-x-2 ${
                activeTab === 'hotels'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-850 dark:hover:text-white'
              }`}
            >
              <FontAwesomeIcon icon={faBed} />
              <span>Hotels</span>
              {selectedHotel && (
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              )}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'itinerary' && (
              <motion.div
                key="itinerary-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Action buttons (Print, Download PDF, etc.) */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={downloadPDF}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-gray-800 shadow-sm border border-gray-250 dark:border-gray-700 flex items-center space-x-1.5 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
                  >
                    <FontAwesomeIcon icon={faDownload} />
                    <span>Download PDF</span>
                  </button>
                  <button
                    onClick={downloadCalendarPDF}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-gray-800 shadow-sm border border-gray-250 dark:border-gray-700 flex items-center space-x-1.5 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
                  >
                    <FontAwesomeIcon icon={faCalendarPlus} />
                    <span>Download Calendar PDF</span>
                  </button>
                </div>

                {/* Draggable days wrapper */}
                <div ref={contentRef} className="space-y-8">
                  {draggableItinerary.map((day, index) => (
                    <div key={day.day}>
                      <DayItineraryCard
                        day={day}
                        onDragEnd={onDragEnd}
                        fetchNearbyPlaces={fetchNearbyPlaces}
                        t={t}
                        onUpdateActivity={handleUpdateActivity}
                        onDeleteActivity={handleDeleteActivity}
                      />
                      
                      {/* Inline Add Activity Button */}
                      <div className="mt-[-20px] mb-8 flex justify-end">
                        {showAddFormDay === day.day ? (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full bg-white dark:bg-gray-800 p-6 rounded-2xl border border-blue-500/20 dark:border-blue-400/20 shadow-lg space-y-4"
                          >
                            <h4 className="font-bold text-lg text-blue-600 dark:text-blue-400">Add New Activity to Day {day.day}</h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Activity Name</label>
                                <input
                                  type="text"
                                  value={newActName}
                                  onChange={(e) => setNewActName(e.target.value)}
                                  placeholder="e.g. Louvre Private Tour"
                                  className="w-full p-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-900 outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Time</label>
                                <input
                                  type="text"
                                  value={newActTime}
                                  onChange={(e) => setNewActTime(e.target.value)}
                                  placeholder="e.g. 10:00 AM"
                                  className="w-full p-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-900 outline-none"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Description</label>
                              <textarea
                                rows="2"
                                value={newActDesc}
                                onChange={(e) => setNewActDesc(e.target.value)}
                                placeholder="e.g. Skip the lines and discover masterworks..."
                                className="w-full p-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-900 outline-none"
                              />
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                              <div>
                                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Cost (USD)</label>
                                <input
                                  type="number"
                                  value={newActCost}
                                  onChange={(e) => setNewActCost(e.target.value)}
                                  className="w-full p-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-900 outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Latitude (Optional)</label>
                                <input
                                  type="text"
                                  value={newActLat}
                                  onChange={(e) => setNewActLat(e.target.value)}
                                  placeholder="e.g. 48.8606"
                                  className="w-full p-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-900 outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Longitude (Optional)</label>
                                <input
                                  type="text"
                                  value={newActLng}
                                  onChange={(e) => setNewActLng(e.target.value)}
                                  placeholder="e.g. 2.3376"
                                  className="w-full p-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-900 outline-none"
                                />
                              </div>
                            </div>

                            <div className="flex justify-end space-x-2 pt-2">
                              <button
                                onClick={() => setShowAddFormDay(null)}
                                className="px-4 py-2 border border-gray-250 dark:border-gray-700 rounded-lg text-xs font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleAddActivity(day.day)}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-xs font-bold hover:bg-blue-600 transition-colors"
                              >
                                Add Activity
                              </button>
                            </div>
                          </motion.div>
                        ) : (
                          <motion.button
                            onClick={() => {
                              setShowAddFormDay(day.day);
                              setActiveDayIndex(index);
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-500/10 text-blue-600 hover:bg-blue-500 hover:text-white transition-all flex items-center space-x-1 border border-blue-500/20"
                          >
                            <FontAwesomeIcon icon={faPlus} />
                            <span>Add Activity</span>
                          </motion.button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'flights' && (
              <motion.div
                key="flights-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold leading-relaxed">
                    ✈️ Select a flight option to customize your travel package. Your total estimated budget will update in real time.
                  </p>
                </div>

                <div className="space-y-4">
                  {flights.map((flight, idx) => {
                    const isSelected = selectedFlight?.flightNo === flight.flightNo;
                    return (
                      <motion.div
                        key={idx}
                        whileHover={{ scale: 1.01 }}
                        className={`relative bg-white dark:bg-gray-850 border rounded-3xl p-6 shadow-md transition-all duration-350 flex flex-col sm:flex-row justify-between items-center gap-6 overflow-hidden ${
                          isSelected
                            ? 'border-blue-500 dark:border-blue-400 shadow-blue-500/10 ring-1 ring-blue-500/30'
                            : 'border-gray-250 dark:border-gray-700/50 hover:border-gray-300'
                        }`}
                      >
                        {/* Notch cutouts on the sides for a real ticket look */}
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-3 w-6 h-6 rounded-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800" />
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-3 w-6 h-6 rounded-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800" />

                        {/* Ticket Left Section */}
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center text-xl flex-shrink-0">
                            <FontAwesomeIcon icon={faPlane} className="rotate-45" />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-base text-gray-900 dark:text-white leading-tight">
                              {flight.airline}
                            </h4>
                            <p className="text-xs text-gray-400 dark:text-gray-500 font-mono mt-0.5">
                              {flight.flightNo}
                            </p>
                          </div>
                        </div>

                        {/* Ticket Middle Section: Route Info */}
                        <div className="flex items-center space-x-8 text-center">
                          <div>
                            <span className="block text-2xl font-black text-gray-800 dark:text-gray-200 tracking-wider">
                              {flight.departure}
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase">DEP</span>
                          </div>
                          
                          <div className="flex flex-col items-center justify-center min-w-[96px] relative">
                            <span className="text-[10px] text-gray-500 font-bold mb-1">
                              {flight.duration}
                            </span>
                            <div className="w-full h-0.5 bg-gray-200 dark:bg-gray-700 relative flex items-center justify-center">
                              <FontAwesomeIcon icon={faPlane} className="text-xs text-gray-400 absolute dark:text-gray-600" />
                            </div>
                            <span className="text-[9px] text-green-500 font-extrabold mt-1 tracking-wider uppercase">
                              Non-Stop
                            </span>
                          </div>

                          <div>
                            <span className="block text-2xl font-black text-gray-800 dark:text-gray-200 tracking-wider">
                              {flight.arrival}
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase">ARR</span>
                          </div>
                        </div>

                        {/* Ticket Right Section: Price & Select */}
                        <div className="flex flex-col items-center sm:items-end gap-2 flex-shrink-0 z-10">
                          <span className="text-2xl font-black text-green-600 dark:text-green-400">
                            ${flight.price}
                          </span>
                          
                          <button
                            onClick={() => {
                              const newFlight = isSelected ? null : flight;
                              setSelectedFlight(newFlight);
                              toast.success(newFlight ? `${flight.airline} selected!` : 'Flight deselected.');
                              
                              setItinerary(prev => ({
                                ...prev,
                                selectedFlight: newFlight,
                                totalBudgetEstimate: calculateTotalBudgetWithSelections(draggableItinerary, newFlight, selectedHotel)
                              }));

                              if (isSaved && savedTripId) {
                                axios.put(`http://localhost:5001/api/trips/${savedTripId}`, {
                                  selectedFlight: newFlight,
                                  totalBudgetEstimate: calculateTotalBudgetWithSelections(draggableItinerary, newFlight, selectedHotel)
                                }).catch(err => console.error('Save flight failed:', err));
                              }
                            }}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                              isSelected
                                ? 'bg-green-500 hover:bg-green-600 text-white'
                                : 'bg-blue-500 hover:bg-blue-600 text-white'
                            }`}
                          >
                            {isSelected ? '✓ Selected' : 'Select Flight'}
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {activeTab === 'hotels' && (
              <motion.div
                key="hotels-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                  <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold leading-relaxed">
                    🏨 Choose a lodging option below. Selecting a hotel automatically updates the estimated package budget and displays its marker on the map.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {hotels.map((hotel, idx) => {
                    const isSelected = selectedHotel?.name === hotel.name;
                    return (
                      <HotelCard
                        key={idx}
                        hotel={hotel}
                        isSelected={isSelected}
                        onSelect={() => {
                          const newHotel = isSelected ? null : hotel;
                          setSelectedHotel(newHotel);
                          toast.success(newHotel ? `${hotel.name} selected!` : 'Hotel deselected.');

                          setItinerary(prev => ({
                            ...prev,
                            selectedHotel: newHotel,
                            totalBudgetEstimate: calculateTotalBudgetWithSelections(draggableItinerary, selectedFlight, newHotel)
                          }));

                          if (isSaved && savedTripId) {
                            axios.put(`http://localhost:5001/api/trips/${savedTripId}`, {
                              selectedHotel: newHotel,
                              totalBudgetEstimate: calculateTotalBudgetWithSelections(draggableItinerary, selectedFlight, newHotel)
                            }).catch(err => console.error('Save hotel failed:', err));
                          }
                        }}
                      />
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT COLUMN: Interactive Maps & Calendar Sidebar (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Navigation tabs for days to select what shows on map */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50">
            <h3 className="font-bold text-sm text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Map Routing Filter</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveDayIndex(-1)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeDayIndex === -1
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                All Days
              </button>
              {draggableItinerary.map((day, idx) => (
                <button
                  key={day.day}
                  onClick={() => setActiveDayIndex(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeDayIndex === idx
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                  }`}
                >
                  Day {day.day}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Leaflet Map box */}
          <div className="sticky top-24 space-y-6">
            <div className="h-[400px] w-full">
              <InteractiveMap
                activities={
                  activeDayIndex === -1
                    ? draggableItinerary.flatMap(d => d.activities)
                    : draggableItinerary[activeDayIndex]?.activities || []
                }
                center={
                  activeDayIndex === -1
                    ? draggableItinerary[0]?.activities[0]
                    : draggableItinerary[activeDayIndex]?.activities[0]
                }
                theme={theme}
              />
            </div>

            {/* Travel Command Widgets */}
            <TravelWidgets destination={itinerary.destination} />

            {/* Travel Analytics card */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 space-y-4">
              <h3 className="text-xl font-bold">Estimated Cost Summary</h3>
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-extrabold text-green-600 dark:text-green-400">
                  <FontAwesomeIcon icon={faRupeeSign} className="text-3xl mr-1" />
                  {calculateTotalBudget(draggableItinerary).toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500 font-semibold">USD</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">This budget estimate is auto-recalculated based on the sum of costs for all your trip activities.</p>
            </div>

            {/* Calendar display card */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50">
              <h3 className="text-xl font-bold mb-4">Trip Schedule</h3>
              <div ref={calendarRef} className="w-full">
                <Calendar
                  value={new Date(itinerary.startDate)}
                  tileClassName={tileClassName}
                  view="month"
                  minDetail="month"
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Auth Modal Trigger */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Nearby Places Modal */}
      <AnimatePresence>
        {showNearbyModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white dark:bg-gray-850 p-8 rounded-3xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto relative border border-white/20 dark:border-gray-700/30"
            >
              <button
                onClick={() => setShowNearbyModal(false)}
                className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-red-500 hover:text-white transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
              <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4">Local Recommendations</h2>
              
              {loadingNearby ? (
                <div className="flex justify-center items-center h-48">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-10 h-10 border-4 border-t-4 border-gray-200 dark:border-gray-750 rounded-full border-t-blue-500"
                  />
                </div>
              ) : nearbyPlaces.length > 0 ? (
                <ul className="space-y-4">
                  {nearbyPlaces.map((place) => (
                    <li key={place.place_id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{place.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{place.formatted_address}</p>
                      {place.rating && (
                        <p className="text-xs text-yellow-500 font-semibold mt-2">
                          <FontAwesomeIcon icon={faSolidStar} className="mr-1" />
                          Rating: {place.rating} ({place.user_ratings_total} reviews)
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400">No recommended places found nearby.</p>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Translucent Floating Command Bar Dock */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[80] w-[90%] max-w-4xl bg-white/75 dark:bg-gray-950/70 backdrop-blur-xl border border-white/20 dark:border-gray-805/40 px-6 py-3.5 rounded-full shadow-2xl flex flex-wrap items-center justify-between gap-3 text-sm">
        <button
          onClick={() => navigate('/plan')}
          className="flex items-center space-x-1.5 text-xs font-extrabold text-gray-500 hover:text-blue-500 transition-colors uppercase tracking-wider"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
          <span>New Plan</span>
        </button>

        <div className="flex items-center gap-3">
          <motion.button
            onClick={handleSaveToDashboard}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-full text-xs font-black shadow-md flex items-center space-x-1.5 transition-all ${
              isSaved
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-gradient-to-r from-blue-500 to-indigo-650 text-white'
            }`}
          >
            <FontAwesomeIcon icon={faSave} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </motion.button>

          <motion.button
            onClick={handleToggleFavorite}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-full text-xs font-black shadow-md flex items-center space-x-1.5 transition-all ${
              isFavorite
                ? 'bg-red-500 text-white'
                : 'bg-white dark:bg-gray-800 text-red-500 border border-red-500/20'
            }`}
          >
            <FontAwesomeIcon icon={isFavorite ? faSolidHeart : faRegularHeart} />
            <span>{isFavorite ? 'Liked' : 'Like'}</span>
          </motion.button>

          {isSaved && (
            <motion.button
              onClick={handleToggleShare}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-full text-xs font-black shadow-md flex items-center space-x-1.5 transition-all ${
                isShared
                  ? 'bg-purple-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-purple-500 border border-purple-500/20'
              }`}
            >
              <FontAwesomeIcon icon={faShareSquare} />
              <span>{isShared ? 'Shared' : 'Share'}</span>
            </motion.button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={downloadPDF}
            className="p-2 rounded-full bg-gray-50/50 dark:bg-gray-900/50 border border-gray-250 dark:border-gray-800 text-gray-655 dark:text-gray-300 hover:bg-gray-150 dark:hover:bg-gray-800 hover:text-blue-500 dark:hover:text-blue-400 transition-all text-xs"
            title="Download PDF"
          >
            <FontAwesomeIcon icon={faDownload} />
          </button>
          <button
            onClick={downloadCalendarPDF}
            className="p-2 rounded-full bg-gray-50/50 dark:bg-gray-900/50 border border-gray-250 dark:border-gray-800 text-gray-655 dark:text-gray-300 hover:bg-gray-150 dark:hover:bg-gray-800 hover:text-blue-500 dark:hover:text-blue-400 transition-all text-xs"
            title="Download Calendar"
          >
            <FontAwesomeIcon icon={faCalendarPlus} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Travel Command Widgets Component
const TravelWidgets = ({ destination }) => {
  const [activeTab, setActiveTab] = useState('weather');
  
  // Weather Mock Data
  const getWeatherForecast = () => {
    const dest = destination.toLowerCase();
    if (dest.includes('london') || dest.includes('uk') || dest.includes('paris')) {
      return [
        { day: 'Day 1', temp: '16°C', desc: 'Light Rain', icon: faCloudRain },
        { day: 'Day 2', temp: '15°C', desc: 'Overcast', icon: faCloud },
        { day: 'Day 3', temp: '18°C', desc: 'Partly Cloudy', icon: faSun }
      ];
    } else if (dest.includes('cairo') || dest.includes('dubai') || dest.includes('egypt')) {
      return [
        { day: 'Day 1', temp: '34°C', desc: 'Hot & Sunny', icon: faSun },
        { day: 'Day 2', temp: '35°C', desc: 'Sunny', icon: faSun },
        { day: 'Day 3', temp: '33°C', desc: 'Clear Sky', icon: faSun }
      ];
    } else {
      return [
        { day: 'Day 1', temp: '22°C', desc: 'Sunny', icon: faSun },
        { day: 'Day 2', temp: '20°C', desc: 'Partly Cloudy', icon: faSun },
        { day: 'Day 3', temp: '19°C', desc: 'Breezy', icon: faWind }
      ];
    }
  };

  // Currency Converter Mock State
  const [amount, setAmount] = useState('100');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  
  const exchangeRates = {
    USD: { EUR: 0.92, INR: 83.3, JPY: 156.4, GBP: 0.79, USD: 1 },
    EUR: { USD: 1.09, INR: 90.5, JPY: 170.0, GBP: 0.86, EUR: 1 },
    INR: { USD: 0.012, EUR: 0.011, JPY: 1.88, GBP: 0.0095, INR: 1 },
    JPY: { USD: 0.0064, EUR: 0.0059, INR: 0.53, GBP: 0.005, JPY: 1 },
    GBP: { USD: 1.27, EUR: 1.16, INR: 105.4, JPY: 198.0, GBP: 1 }
  };

  const getConvertedAmount = () => {
    const rate = exchangeRates[fromCurrency]?.[toCurrency] || 1;
    return (parseFloat(amount || 0) * rate).toFixed(2);
  };

  // Packing List Mock State
  const [packingItems, setPackingItems] = useState([
    { id: 1, name: 'Passport & Visas', checked: true },
    { id: 2, name: 'Universal Adaptor', checked: false },
    { id: 3, name: 'Comfortable Sneakers', checked: false },
    { id: 4, name: 'Toiletries & Medicine', checked: false }
  ]);
  const [newItemName, setNewItemName] = useState('');

  const togglePackingItem = (id) => {
    setPackingItems(packingItems.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const addPackingItem = (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    setPackingItems([...packingItems, { id: Date.now(), name: newItemName, checked: false }]);
    setNewItemName('');
  };

  return (
    <div className="bg-white/70 dark:bg-gray-800/40 backdrop-blur-md p-6 rounded-3xl border border-gray-250 dark:border-gray-700/50 shadow-lg space-y-4 text-xs">
      <div className="flex items-center justify-between border-b border-gray-150 dark:border-gray-700/40 pb-3">
        <h3 className="text-xs font-extrabold tracking-wider uppercase text-gray-500 dark:text-gray-400">Command Console</h3>
        <div className="flex bg-gray-100 dark:bg-gray-900 rounded-lg p-0.5 text-[9px] font-black uppercase">
          {['weather', 'currency', 'packing'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-2 py-1 rounded-md transition-all ${
                activeTab === tab ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* WEATHER TAB */}
        {activeTab === 'weather' && (
          <motion.div
            key="weather"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="grid grid-cols-3 gap-2"
          >
            {getWeatherForecast().map((w, i) => (
              <div key={i} className="p-2.5 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-2xl text-center space-y-1">
                <span className="text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase">{w.day}</span>
                <div className="text-blue-500 text-sm">
                  <FontAwesomeIcon icon={w.icon} />
                </div>
                <div className="text-xs font-black dark:text-white">{w.temp}</div>
                <div className="text-[8px] text-gray-500 leading-none">{w.desc}</div>
              </div>
            ))}
          </motion.div>
        )}

        {/* CURRENCY TAB */}
        {activeTab === 'currency' && (
          <motion.div
            key="currency"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="space-y-3"
          >
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none font-bold text-xs"
              />
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className="p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none font-bold text-xs"
              >
                {Object.keys(exchangeRates).map(cur => <option key={cur} value={cur}>{cur}</option>)}
              </select>
            </div>
            
            <div className="flex items-center justify-between px-2 text-gray-400 font-bold text-[9px]">
              <span>Convert to</span>
              <span>≈</span>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex-1 p-2 bg-gray-100 dark:bg-gray-955 border border-gray-200 dark:border-gray-800 rounded-xl font-black text-blue-500 dark:text-blue-400 text-xs">
                {getConvertedAmount()}
              </div>
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className="p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none font-bold text-xs"
              >
                {Object.keys(exchangeRates).map(cur => <option key={cur} value={cur}>{cur}</option>)}
              </select>
            </div>
          </motion.div>
        )}

        {/* PACKING TAB */}
        {activeTab === 'packing' && (
          <motion.div
            key="packing"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="space-y-3"
          >
            <ul className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
              {packingItems.map(item => (
                <li key={item.id} className="flex items-center space-x-2 cursor-pointer" onClick={() => togglePackingItem(item.id)}>
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => {}}
                    className="rounded text-blue-500 focus:ring-0 border-gray-300 pointer-events-none"
                  />
                  <span className={`font-medium text-xs ${item.checked ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-350'}`}>
                    {item.name}
                  </span>
                </li>
              ))}
            </ul>

            <form onSubmit={addPackingItem} className="flex items-center space-x-1.5 pt-1.5 border-t border-gray-150 dark:border-gray-750">
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Add item..."
                className="flex-1 p-2 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-xl outline-none text-[10px]"
              />
              <button
                type="submit"
                className="px-2.5 py-1.5 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-colors text-[10px]"
              >
                Add
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// HotelCard subcomponent
const HotelCard = ({ hotel, isSelected, onSelect }) => {
  const [imageUrl, setImageUrl] = useState(null);
  
  useEffect(() => {
    let active = true;
    const fetchImage = async () => {
      try {
        const query = hotel.imageQuery || hotel.name;
        const cached = localStorage.getItem(`hotel_img_${encodeURIComponent(query)}`);
        if (cached) {
          if (active) setImageUrl(cached);
          return;
        }
        const response = await axios.get(`http://localhost:5001/api/images/search?query=${encodeURIComponent(query)}`);
        if (response.data && response.data.imageUrl) {
          if (active) {
            setImageUrl(response.data.imageUrl);
            localStorage.setItem(`hotel_img_${encodeURIComponent(query)}`, response.data.imageUrl);
          }
        }
      } catch (err) {
        console.error('Hotel image search error:', err);
      }
    };
    fetchImage();
    return () => { active = false; };
  }, [hotel.imageQuery, hotel.name]);

  const defaultImg = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600&auto=format&fit=crop';

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`bg-white dark:bg-gray-850 rounded-3xl overflow-hidden shadow-md border hover:shadow-xl transition-all duration-300 flex flex-col justify-between ${
        isSelected
          ? 'border-amber-500 dark:border-amber-400 ring-1 ring-amber-500/30'
          : 'border-gray-250 dark:border-gray-700/50'
      }`}
    >
      <div className="h-48 relative overflow-hidden">
        <img
          src={imageUrl || defaultImg}
          alt={hotel.name}
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
        />
        {/* Floating Pricing Badge */}
        <div className="absolute top-4 right-4 px-3.5 py-1.5 bg-black/70 backdrop-blur-md text-white rounded-full text-xs font-black">
          ${hotel.pricePerNight} <span className="text-[9px] text-gray-300 font-medium">/ night</span>
        </div>
        
        {isSelected && (
          <div className="absolute top-4 left-4 px-3 py-1 bg-amber-500 text-white rounded-full text-[10px] font-black uppercase tracking-wider shadow-md">
            🏨 Selected
          </div>
        )}
      </div>

      <div className="p-6 space-y-4 flex-grow flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex justify-between items-start gap-2">
            <h4 className="font-extrabold text-base text-gray-900 dark:text-white leading-tight">
              {hotel.name}
            </h4>
            
            {/* Rating Stars */}
            <div className="flex items-center text-xs text-yellow-500 font-bold shrink-0 mt-1">
              <span className="mr-0.5">{hotel.rating}</span>
              {'★'}
            </div>
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
            {hotel.description}
          </p>
        </div>

        <button
          onClick={onSelect}
          className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
            isSelected
              ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isSelected ? '✓ Selected' : 'Select Hotel'}
        </button>
      </div>
    </motion.div>
  );
};

export default OutputPage;
