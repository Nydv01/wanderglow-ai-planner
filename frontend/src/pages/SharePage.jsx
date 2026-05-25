// src/pages/SharePage.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faMapMarkerAlt, faDollarSign, faRupeeSign, faClock, faGlobe, faDownload, faCompass, faPlane, faBed } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';
import InteractiveMap from '../components/InteractiveMap';

const SharePage = ({ theme }) => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('itinerary');

  const contentRef = useRef(null);

  useEffect(() => {
    const fetchSharedTrip = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/trips/share/${tripId}`);
        setTrip(response.data);
      } catch (err) {
        console.error('Error fetching shared trip:', err);
        setError('This trip is private or does not exist.');
      } finally {
        setLoading(false);
      }
    };

    if (tripId) {
      fetchSharedTrip();
    }
  }, [tripId]);

  const downloadPDF = async () => {
    toast.promise(
      (async () => {
        const content = contentRef.current;
        if (content) {
          const canvas = await html2canvas(content, {
            scale: 2,
            useCORS: true,
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
          pdf.save(`shared-itinerary-${trip.destination.toLowerCase().replace(/ /g, '-')}.pdf`);
        }
      })(),
      {
        loading: 'Generating PDF...',
        success: 'PDF downloaded!',
        error: 'Failed to export PDF.'
      }
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-t-4 border-gray-200 dark:border-gray-700 rounded-full border-t-blue-500"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-transparent text-gray-800 dark:text-gray-100 flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full p-8 bg-white/70 dark:bg-gray-800/40 backdrop-blur-md rounded-3xl shadow-xl text-center space-y-6 border border-gray-200/50 dark:border-gray-700/50"
        >
          <div className="text-5xl text-red-500">
            <FontAwesomeIcon icon={faCompass} />
          </div>
          <h1 className="text-2xl font-extrabold">Trip Not Available</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 bg-blue-500 text-white rounded-xl font-bold shadow-md hover:bg-blue-600 transition-colors"
          >
            Go Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-gray-800 dark:text-gray-100 transition-colors duration-500 pt-28 pb-16 px-4 md:px-8 max-w-7xl mx-auto">
      
      {/* Shared Itinerary Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <span className="px-3 py-1 bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 rounded-full text-xs font-bold uppercase tracking-wider">
            Shared Travel Itinerary
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-glow text-gray-900 dark:text-white mt-1">
            {trip.destination}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            A custom {trip.duration}-day travel plan created on WanderGlow.
          </p>
        </div>

        <button
          onClick={downloadPDF}
          className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-sm font-bold shadow-md flex items-center space-x-2 transition-all"
        >
          <FontAwesomeIcon icon={faDownload} />
          <span>Download PDF Copy</span>
        </button>
      </header>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Days list (read-only) */}
        <div ref={contentRef} className="lg:col-span-7 space-y-6">
          
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
              <span>Flight Selected</span>
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
              <span>Hotel Selected</span>
            </button>
          </div>

          {activeTab === 'itinerary' && (
            <div className="space-y-6">
              {trip.itinerary.map((day) => (
                <motion.div
                  key={day.day}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-150 dark:border-gray-700/50"
                >
                  <h2 className="text-2xl font-bold mb-3 flex items-center">
                    <span className="px-3.5 py-1.5 bg-blue-500 text-white rounded-full mr-3 text-sm">Day {day.day}</span>
                    {day.title}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{day.summary}</p>
                  
                  <div className="space-y-4">
                    {day.activities.map((activity, idx) => (
                      <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700/30 flex items-start space-x-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-xs">
                          {idx + 1}
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-center space-x-3 text-xs font-semibold text-gray-400 mb-1">
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
                          <h4 className="font-bold text-lg text-blue-600 dark:text-blue-400 mb-1">{activity.name}</h4>
                          <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{activity.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'flights' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold leading-relaxed">
                  ✈️ Selected Flight booked by trip organizer:
                </p>
              </div>

              {trip.selectedFlight ? (
                <div className="relative bg-white dark:bg-gray-850 border border-blue-500/35 rounded-3xl p-6 shadow-md overflow-hidden flex flex-col sm:flex-row justify-between items-center gap-6">
                  {/* Notch cutouts on the sides for a real ticket look */}
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-3 w-6 h-6 rounded-full bg-gray-50 dark:bg-gray-900 border border-gray-205 dark:border-gray-800" />
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-3 w-6 h-6 rounded-full bg-gray-50 dark:bg-gray-900 border border-gray-205 dark:border-gray-800" />

                  {/* Ticket Left Section */}
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center text-xl flex-shrink-0">
                      <FontAwesomeIcon icon={faPlane} className="rotate-45" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base text-gray-900 dark:text-white leading-tight">
                        {trip.selectedFlight.airline}
                      </h4>
                      <p className="text-xs text-gray-400 dark:text-gray-500 font-mono mt-0.5">
                        {trip.selectedFlight.flightNo}
                      </p>
                    </div>
                  </div>

                  {/* Ticket Middle Section: Route Info */}
                  <div className="flex items-center space-x-8 text-center">
                    <div>
                      <span className="block text-2xl font-black text-gray-800 dark:text-gray-200 tracking-wider">
                        {trip.selectedFlight.departure}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase">DEP</span>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center min-w-[96px] relative">
                      <span className="text-[10px] text-gray-500 font-bold mb-1">
                        {trip.selectedFlight.duration}
                      </span>
                      <div className="w-full h-0.5 bg-gray-200 dark:bg-gray-700 relative flex items-center justify-center">
                        <FontAwesomeIcon icon={faPlane} className="text-xs text-gray-450 absolute dark:text-gray-655" />
                      </div>
                      <span className="text-[9px] text-green-550 font-extrabold mt-1 tracking-wider uppercase">
                        Non-Stop
                      </span>
                    </div>

                    <div>
                      <span className="block text-2xl font-black text-gray-800 dark:text-gray-200 tracking-wider">
                        {trip.selectedFlight.arrival}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase">ARR</span>
                    </div>
                  </div>

                  {/* Ticket Right Section */}
                  <div className="flex flex-col items-center sm:items-end gap-1 flex-shrink-0 z-10">
                    <span className="text-[10px] text-gray-450 dark:text-gray-500 font-bold uppercase">Price</span>
                    <span className="text-2xl font-black text-green-600 dark:text-green-400">
                      ${trip.selectedFlight.price}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-3xl border border-gray-250 dark:border-gray-750/50 shadow-sm text-gray-500 dark:text-gray-450">
                  <FontAwesomeIcon icon={faPlane} className="text-4xl text-gray-300 dark:text-gray-650 mb-3" />
                  <p className="text-sm font-semibold">No flight details have been selected for this trip.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'hotels' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold leading-relaxed">
                  🏨 Selected Lodging booked by trip organizer:
                </p>
              </div>

              {trip.selectedHotel ? (
                <div className="max-w-md mx-auto">
                  <HotelCardReadOnly hotel={trip.selectedHotel} />
                </div>
              ) : (
                <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-3xl border border-gray-250 dark:border-gray-750/50 shadow-sm text-gray-500 dark:text-gray-450">
                  <FontAwesomeIcon icon={faBed} className="text-4xl text-gray-300 dark:text-gray-650 mb-3" />
                  <p className="text-sm font-semibold">No hotel details have been selected for this trip.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Map & Metrics Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          {/* Day selection tabs */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-250 dark:border-gray-700/50">
            <h3 className="font-bold text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Select Day Map Routing</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveDayIndex(-1)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeDayIndex === -1 ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-750'
                }`}
              >
                All Days
              </button>
              {trip.itinerary.map((day, idx) => (
                <button
                  key={day.day}
                  onClick={() => setActiveDayIndex(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeDayIndex === idx ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-750'
                  }`}
                >
                  Day {day.day}
                </button>
              ))}
            </div>
          </div>

          <div className="sticky top-24 space-y-6">
            <div className="h-[400px]">
              <InteractiveMap
                activities={
                  activeDayIndex === -1
                    ? trip.itinerary.flatMap(d => d.activities)
                    : trip.itinerary[activeDayIndex]?.activities || []
                }
                center={
                  activeDayIndex === -1
                    ? trip.itinerary[0]?.activities[0]
                    : trip.itinerary[activeDayIndex]?.activities[0]
                }
                selectedHotel={trip.selectedHotel}
                theme={theme}
              />
            </div>

            {/* Statistics */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-250 dark:border-gray-700/50 space-y-4">
              <h3 className="text-xl font-bold">Trip Budget Estimate</h3>
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-extrabold text-green-600 dark:text-green-400">
                  <FontAwesomeIcon icon={faRupeeSign} className="text-3xl mr-1" />
                  {trip.totalBudgetEstimate.toLocaleString()}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500 font-semibold">USD</span>
              </div>
              <div className="pt-2 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <p><strong>Interests:</strong> {trip.interests.join(', ')}</p>
                <p><strong>Trip Style:</strong> <span className="capitalize">{trip.mood}</span></p>
                <p><strong>Timeline:</strong> {trip.startDate} to {trip.endDate}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// Read-only HotelCard for shared view
const HotelCardReadOnly = ({ hotel }) => {
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
        const response = await axios.get(`/api/images/search?query=${encodeURIComponent(query)}`);
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
    <div className="bg-white dark:bg-gray-850 rounded-3xl overflow-hidden shadow-md border border-gray-250 dark:border-gray-700/50 flex flex-col">
      <div className="h-48 relative overflow-hidden">
        <img
          src={imageUrl || defaultImg}
          alt={hotel.name}
          className="w-full h-full object-cover"
        />
        {/* Floating Pricing Badge */}
        <div className="absolute top-4 right-4 px-3.5 py-1.5 bg-black/70 backdrop-blur-md text-white rounded-full text-xs font-black">
          ${hotel.pricePerNight} <span className="text-[9px] text-gray-300 font-medium">/ night</span>
        </div>
      </div>

      <div className="p-6 space-y-3">
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
    </div>
  );
};

export default SharePage;
