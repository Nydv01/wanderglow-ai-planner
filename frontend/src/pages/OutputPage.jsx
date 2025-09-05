// src/pages/OutputPage.jsx

import React, { useEffect, useState, useRef, useCallback } from 'react'; // Added useCallback
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faShareAlt, faCalendarPlus, faSun, faCloud, faBolt, faSnowflake, faWind, faMapMarkedAlt, faCloudRain, faHeart as faSolidHeart, faCamera, faSearchLocation, faTimes, faGripVertical, faStar as faSolidStar, faRupeeSign } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faRegularHeart, faStar as faRegularStar } from '@fortawesome/free-regular-svg-icons';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import DayItineraryCard from '../components/DayItineraryCard';
import { useInView } from 'react-intersection-observer'; // Keep useInView for DayItineraryCard

// Framer Motion Variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
};

const OutputPage = ({ theme }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [itinerary, setItinerary] = useState(location.state?.itinerary);
  const contentRef = useRef(null);
  const calendarRef = useRef(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const storyContentRef = useRef(null);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loadingNearby, setLoadingNearby] = useState(false);
  
  const [draggableItinerary, setDraggableItinerary] = useState([]);
  const [starRating, setStarRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  // Canvas background animation state and refs
  const canvasRef = useRef(null);
  const animationFrameId = useRef(null);
  const particlesRef = useRef([]);
  const mouse = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  // Particle animation constants
  const PARTICLE_COUNT = 100; // Fewer particles for a cleaner look
  const PARTICLE_RADIUS = 0.8; // Smaller particles
  const PARTICLE_SPEED = 0.1; // Slower movement
  const LINE_DISTANCE = 100; // Max distance for lines to form
  const INTERACTION_RADIUS = 150; // Mouse interaction radius
  const INTERACTION_STRENGTH = 0.05; // Mouse interaction strength

  // Particle class for the background animation
  class Particle {
    constructor(x, y, color) {
      this.x = x;
      this.y = y;
      this.vx = (Math.random() - 0.5) * PARTICLE_SPEED;
      this.vy = (Math.random() - 0.5) * PARTICLE_SPEED;
      this.radius = PARTICLE_RADIUS;
      this.color = color;
    }

    update(canvasWidth, canvasHeight) {
      this.x += this.vx;
      this.y += this.vy;

      // Wrap around edges
      if (this.x < 0 || this.x > canvasWidth) this.vx *= -1;
      if (this.y < 0 || this.y > canvasHeight) this.vy *= -1;

      // Mouse repulsion
      const dx = this.x - mouse.current.x;
      const dy = this.y - mouse.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < INTERACTION_RADIUS) {
        const force = (INTERACTION_RADIUS - distance) / INTERACTION_RADIUS * INTERACTION_STRENGTH;
        this.x += dx * force;
        this.y += dy * force;
      }
    }

    draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }

  // Animation loop for the background
  const animateBackground = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const particles = particlesRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const particleColor = theme === 'light' ? 'rgba(100, 149, 237, 0.8)' : 'rgba(173, 216, 230, 0.8)'; // CornflowerBlue / LightBlue
    const lineColor = theme === 'light' ? 'rgba(70, 130, 180, 0.3)' : 'rgba(135, 206, 250, 0.3)'; // SteelBlue / LightSkyBlue

    for (let i = 0; i < particles.length; i++) {
      particles[i].color = particleColor; // Update particle color based on theme
      particles[i].update(canvas.width, canvas.height);
      particles[i].draw(ctx);

      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i];
        const p2 = particles[j];
        const distance = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

        if (distance < LINE_DISTANCE) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = lineColor;
          ctx.lineWidth = 0.5; // Thinner lines
          ctx.stroke();
        }
      }
    }

    animationFrameId.current = requestAnimationFrame(animateBackground);
  }, [theme]); // Re-run if theme changes

  // Initialize and clean up canvas background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasDimensions();
    window.addEventListener('resize', setCanvasDimensions);

    // Initialize particles
    particlesRef.current = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particlesRef.current.push(
        new Particle(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          theme === 'light' ? 'rgba(100, 149, 237, 0.8)' : 'rgba(173, 216, 230, 0.8)'
        )
      );
    }

    // Mouse move listener for interaction
    const handleMouseMove = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    animateBackground();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId.current);
      window.removeEventListener('resize', setCanvasDimensions);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [animateBackground, theme]); // Dependencies for this useEffect

  useEffect(() => {
    if (!itinerary) {
      navigate('/input', { replace: true });
    } else {
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      const isFav = favorites.some(fav => 
        fav.destination === itinerary.destination && 
        fav.startDate === itinerary.startDate
      );
      setIsFavorite(isFav);

      setDraggableItinerary(itinerary.itinerary);
    }
  }, [itinerary, navigate]);

  if (!itinerary) {
    return null;
  }

  const getDayIcon = (condition) => {
    switch (condition?.toLowerCase()) {
      case 'sunny':
      case 'clear':
        return faSun;
      case 'cloudy':
        return faCloud;
      case 'rainy':
        return faCloudRain;
      case 'thunderstorm':
        return faBolt;
      case 'snowy':
        return faSnowflake;
      case 'windy':
        return faWind;
      default:
        return faSun;
    }
  };
  
  const handleToggleFavorite = () => {
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const itineraryData = { ...itinerary, id: `${itinerary.destination}-${itinerary.startDate}` };

    if (isFavorite) {
      favorites = favorites.filter(fav => fav.id !== itineraryData.id);
      toast.success(t('removedFromFavorites'));
    } else {
      favorites.push(itineraryData);
      toast.success(t('savedToFavorites'));
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
    setIsFavorite(!isFavorite);
  };
  
  const downloadPDF = async () => {
    toast.promise(
      (async () => {
        const content = contentRef.current;
        if (content) {
          const canvas = await html2canvas(content, {
            scale: 2,
            useCORS: true,
            logging: true,
            width: content.scrollWidth,
            height: content.scrollHeight,
          });
          const imgData = canvas.toDataURL('image/jpeg', 1.0);
          const pdf = new jsPDF('p', 'mm', 'a4');
          const imgProps= pdf.getImageProperties(imgData);
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
        loading: t('downloadingPdfLoading'),
        success: t('downloadingPdfSuccess'),
        error: t('downloadingPdfError'),
      }
    );
  };
  
  const downloadCalendarPDF = async () => {
    toast.promise(
      (async () => {
        const calendarElement = calendarRef.current;
        if (calendarElement) {
          const canvas = await html2canvas(calendarElement, {
            scale: 2,
            useCORS: true,
            logging: true,
          });
          const imgData = canvas.toDataURL('image/jpeg', 1.0);
          const pdf = new jsPDF('p', 'mm', 'a4');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          
          pdf.text(t('itineraryFor', { destination: itinerary.destination }), pdfWidth / 2, 15, { align: 'center' });
          pdf.addImage(imgData, 'JPEG', 15, 25, pdfWidth - 30, (pdfWidth - 30) * (canvas.height / canvas.width));
          pdf.save(`itinerary-calendar-${itinerary.destination.toLowerCase().replace(/ /g, '-')}.pdf`);
        }
      })(),
      {
        loading: t('downloadingCalendarLoading'),
        success: t('downloadingCalendarSuccess'),
        error: t('downloadingCalendarError'),
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

  const shareItinerary = () => {
    if (navigator.share) {
      navigator.share({
        title: t('shareTitle', { destination: itinerary.destination }),
        text: t('shareText', { duration: itinerary.duration, destination: itinerary.destination }),
        url: window.location.href,
      }).then(() => {
        console.log('Successfully shared');
        toast.success(t('shareSuccess'));
      }).catch((error) => {
        console.error('Error sharing:', error);
        toast.error(t('shareError'));
      });
    } else {
      toast(t('shareNotSupported'));
    }
  };

  const exportAsStory = async () => {
    toast.promise(
      (async () => {
        const content = storyContentRef.current;
        if (content) {
          content.style.transform = 'scale(2)';
          content.style.transformOrigin = 'top left';

          const canvas = await html2canvas(content, {
            scale: 1,
            useCORS: true,
            logging: true,
          });

          content.style.transform = 'none';

          const imgData = canvas.toDataURL('image/jpeg', 1.0);
          
          const link = document.createElement('a');
          link.href = imgData;
          link.download = `itinerary-${itinerary.destination.toLowerCase().replace(/ /g, '-')}-story.jpeg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      })(),
      {
        loading: t('exportStoryLoading'),
        success: t('exportStorySuccess'),
        error: t('exportStoryError'),
      }
    );
  };

  const fetchNearbyPlaces = (activityName) => {
    setLoadingNearby(true);
    setShowModal(true);
    toast(t('demoFeature'), { icon: '💡' });
    
    setTimeout(() => {
      const mockPlaces = [
        { place_id: '1', name: `${activityName} Cafe`, formatted_address: '123 Main Street', rating: 4.5, user_ratings_total: 120 },
        { place_id: '2', name: `Historic ${activityName} Museum`, formatted_address: '456 Elm Street', rating: 4.8, user_ratings_total: 250 },
        { place_id: '3', name: `City Park near ${activityName}`, formatted_address: '789 Oak Avenue', rating: 4.2, user_ratings_total: 80 },
      ];
      setNearbyPlaces(mockPlaces);
      setLoadingNearby(false);
    }, 1500);
  };

  const closeNearbyModal = () => {
    setShowModal(false);
    setNearbyPlaces([]);
  };

  const addToCalendar = () => {
    toast.promise(
      (async () => {
        const events = itinerary.itinerary.flatMap((day) =>
          day.activities.map((activity) => ({
            title: `${activity.name} - ${itinerary.destination}`,
            description: activity.description,
            location: activity.name,
            date: new Date(new Date(itinerary.startDate).setDate(new Date(itinerary.startDate).getDate() + (day.day - 1))),
          }))
        );
      
        let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//AI Travel Planner//EN\n";
        
        events.forEach(event => {
          const start = event.date.toISOString().replace(/[-:]/g, '').replace(/\..*/, '');
          const end = new Date(event.date.getTime() + 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').replace(/\..*/, '');
          
          icsContent += "BEGIN:VEVENT\n";
          icsContent += `DTSTART:${start}\n`;
          icsContent += `DTEND:${end}\n`;
          icsContent += `SUMMARY:${event.title}\n`;
          icsContent += `DESCRIPTION:${event.description}\n`;
          icsContent += `LOCATION:${event.location}\n`;
          icsContent += "END:VEVENT\n";
        });
        
        icsContent += "END:VCALENDAR\n";
      
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", url);
        downloadAnchorNode.setAttribute("download", `itinerary-${itinerary.destination.toLowerCase().replace(/ /g, '-')}.ics`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
      })(),
      {
        loading: t('addToCalendarLoading'),
        success: t('addToCalendarSuccess'),
        error: t('addToCalendarError'),
      }
    );
  };
  
  const onDragEnd = (result) => {
    const { destination, source } = result;

    if (!destination) {
      return;
    }

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

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
    }
  };

  const handleViewOnMap = () => {
    const url = `http://googleusercontent.com/maps.google.com/4${encodeURIComponent(itinerary.destination)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 text-gray-800 dark:text-gray-100 transition-colors duration-500 pt-24 relative overflow-hidden">
      {/* Canvas for the animated background */}
      <canvas ref={canvasRef} className="fixed inset-0 z-0"></canvas>
      
      <header className="flex justify-between items-center mb-8 relative z-10">
        {/* The back button has been removed as requested. */}
      </header>

      <motion.div
        initial="hidden"
        animate="show"
        variants={containerVariants}
        className="max-w-6xl mx-auto relative z-10"
      >
        <div className="text-center mb-10">
          <motion.h1
            className="text-4xl md:text-5xl font-extrabold text-ocean-blue-deep dark:text-ocean-blue-light mb-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 10 }}
          >
            {itinerary.destination ? `${itinerary.destination} Trip` : t('itineraryTitle')}
          </motion.h1>
          <motion.p
            className="text-2xl italic font-serif tracking-wide text-ocean-blue-deep dark:text-ocean-blue-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Have a great journey {/* Hardcoded "Have a great journey" with capitalized 'H' */}
          </motion.p>
        </div>

        <motion.div
          initial="hidden"
          animate="show"
          variants={containerVariants}
          className="flex flex-wrap justify-center gap-4 mb-10"
        >
          <motion.button 
            variants={itemVariants}
            onClick={downloadPDF}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center px-6 py-3 bg-ocean-blue-deep text-white rounded-full shadow-lg hover:bg-ocean-blue-light transition-colors"
          >
            <FontAwesomeIcon icon={faDownload} className="mr-2" />
            {t('downloadPdf')}
          </motion.button>
          
          <motion.button 
            variants={itemVariants}
            onClick={shareItinerary}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center px-6 py-3 bg-ocean-blue-deep text-white rounded-full shadow-lg hover:bg-ocean-blue-light transition-colors"
          >
            <FontAwesomeIcon icon={faShareAlt} className="mr-2" />
            {t('shareItinerary')}
          </motion.button>

          <motion.button 
            variants={itemVariants}
            onClick={handleToggleFavorite}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center px-6 py-3 rounded-full shadow-lg transition-colors ${
              isFavorite 
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-white dark:bg-gray-800 text-red-500 hover:text-red-600'
            }`}
          >
            <FontAwesomeIcon icon={isFavorite ? faSolidHeart : faRegularHeart} className="mr-2" />
            {isFavorite ? t('saved') : t('saveToFavorites')}
          </motion.button>

          <motion.button 
            variants={itemVariants}
            onClick={exportAsStory}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center px-6 py-3 bg-purple-500 text-white rounded-full shadow-lg hover:bg-purple-600 transition-colors"
          >
            <FontAwesomeIcon icon={faCamera} className="mr-2" />
            {t('exportAsStory')}
          </motion.button>
        </motion.div>
        
        <div ref={storyContentRef} id="itinerary-story-content" className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
                >
                    <h3 className="text-2xl font-bold mb-4 text-center">{t('tripLocation')}</h3>
                    <div className="relative w-full h-64 bg-gray-300 dark:bg-gray-700 rounded-lg overflow-hidden">
                        {/* Note: Insert your Google Maps API key for this to work */}
                        <img
                            src={`https://maps.googleapis.com/maps/api/staticmap?center=${itinerary.destination}&zoom=11&size=600x300&markers=color:ocean-blue-deep%7C${itinerary.destination}&key=YOUR_Maps_API_KEY`}
                            alt={t('mapAlt', { destination: itinerary.destination })}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex justify-center mt-4">
                        <motion.button
                            onClick={handleViewOnMap}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center px-6 py-3 bg-ocean-blue-deep text-white rounded-full shadow-lg hover:bg-ocean-blue-light transition-colors"
                        >
                            <FontAwesomeIcon icon={faMapMarkedAlt} className="mr-2" />
                            {t('viewOnMap')}
                        </motion.button>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
                >
                    <h3 className="text-2xl font-bold mb-4 text-center">{t('tripDates')}</h3>
                    <div className="flex flex-col items-center">
                        <div ref={calendarRef} className="w-full max-w-sm dark:bg-gray-800">
                            <Calendar
                                value={new Date(itinerary.startDate)}
                                tileClassName={tileClassName}
                                view="month"
                                minDetail="month"
                            />
                        </div>
                        <motion.button 
                            onClick={downloadCalendarPDF}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center mt-4 px-6 py-3 bg-ocean-blue-deep text-white rounded-full shadow-lg hover:bg-ocean-blue-light transition-colors"
                        >
                            <FontAwesomeIcon icon={faCalendarPlus} className="mr-2" />
                            {t('downloadCalendarPdf')}
                        </motion.button>
                        <motion.button 
                          onClick={addToCalendar}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center mt-4 px-6 py-3 bg-ocean-blue-deep text-white rounded-full shadow-lg hover:bg-ocean-blue-light transition-colors"
                        >
                            <FontAwesomeIcon icon={faCalendarPlus} className="mr-2" />
                            {t('addToCalendar')}
                        </motion.button>
                    </div>
                </motion.div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg text-gray-800 dark:text-gray-100"
                >
                    <h3 className="text-xl font-bold mb-2">{t('tripDetails')}</h3>
                    <p><strong>{t('destinationPrompt')}:</strong> {itinerary.destination}</p>
                    <p><strong>{t('duration')}:</strong> {t('durationDays', { count: itinerary.duration })}</p>
                    <p><strong>{t('interestsPrompt')}:</strong> {itinerary.interests.map(i => t(i)).join(', ')}</p>
                    <p><strong>{t('budgetPrompt')}:</strong> <span className="capitalize">{t(itinerary.budget)}</span></p>
                </motion.div>
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg text-gray-800 dark:text-gray-100 col-span-1 md:col-span-1 lg:col-span-2"
                >
                    <h3 className="text-xl font-bold mb-2">{t('estimatedBudget')}</h3>
                    <p className="text-3xl font-extrabold text-green-600 dark:text-green-400 mt-2">
                        <FontAwesomeIcon icon={faRupeeSign} /> {itinerary.totalBudgetEstimate}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{t('budgetDisclaimer')}</p>
                </motion.div>
            </div>

            {/* Day Scroll Section */}
            <div className="flex justify-center mb-8">
                <div ref={contentRef} className="w-full p-4">
                    {draggableItinerary.map((day, index) => (
                        <DayItineraryCard
                            key={day.day} // Ensure a stable key
                            day={day}
                            onDragEnd={onDragEnd}
                            fetchNearbyPlaces={fetchNearbyPlaces}
                            t={t} // Pass the translation function
                        />
                    ))}
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="mt-16 text-center"
            >
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                    Give Ratings {/* Hardcoded "Give Ratings" */}
                </h3>
                <div className="flex justify-center items-center mb-6 text-3xl text-gray-400 dark:text-gray-500">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <motion.span
                            key={star}
                            onClick={() => setStarRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            className={`cursor-pointer transition-colors duration-200 ${
                                star <= (hoverRating || starRating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                            }`}
                        >
                            <FontAwesomeIcon icon={faSolidStar} />
                        </motion.span>
                    ))}
                </div>
                <motion.button
                    onClick={() => navigate('/feedback', { state: { starRating: starRating } })}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={starRating === 0}
                    className={`px-8 py-4 rounded-full shadow-lg transition-colors text-lg font-semibold ${
                        starRating > 0
                            ? 'bg-ocean-blue-deep text-white hover:bg-ocean-blue-light'
                            : 'bg-gray-400 dark:bg-gray-600 text-gray-200 cursor-not-allowed'
                    }`}
                >
                    {t('leaveFeedback')}
                </motion.button>
            </motion.div>
        </div>
      </motion.div>
      
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto relative"
            >
              <button
                onClick={closeNearbyModal}
                className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} size="lg" />
              </button>
              <h2 className="text-2xl font-bold text-ocean-blue-deep dark:text-ocean-blue-light mb-4">{t('nearbyPlaces')}</h2>
              {loadingNearby ? (
                <div className="flex justify-center items-center h-48">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-t-4 border-gray-200 dark:border-gray-700 rounded-full border-t-ocean-blue-deep"
                  />
                </div>
              ) : nearbyPlaces.length > 0 ? (
                <ul className="space-y-4">
                  {nearbyPlaces.map((place) => (
                    <li key={place.place_id} className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                        {place.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {place.formatted_address}
                      </p>
                      {place.rating && (
                        <p className="text-sm text-yellow-500 mt-1">
                          {t('rating')}: {place.rating} ({place.user_ratings_total})
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400">
                  {t('noPlacesFound')}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OutputPage;
