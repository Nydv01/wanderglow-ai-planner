// src/pages/ExplorePage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faStar, faMapMarkerAlt, faFilter, faSearch, faSortAmountDownAlt, 
  faRupeeSign, faWifi, faUtensils, faSpa, faTimes, faDollarSign, 
  faTag, faMoneyBillWave, faCity, faMountain, faUmbrellaBeach, faHeart as faHeartSolid
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';

// Final list of destinations mapped to real-world coordinates
const allDestinations = [
  { id: 1, name: "Kyoto, Japan", location: "Japan", budget: "Mid-range", rating: 4.8, category: "City", price: 15000, amenities: ['Wi-Fi', 'Restaurant'], imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=600&auto=format&fit=crop", lat: 35.0116, lng: 135.7681 },
  { id: 2, name: "Bora Bora, French Polynesia", location: "Polynesia", budget: "Luxury", rating: 4.9, category: "Beach", price: 45000, amenities: ['Wi-Fi', 'Pool', 'Spa'], imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop", lat: -16.5004, lng: -151.7415 },
  { id: 3, name: "Banff National Park", location: "Canada", budget: "High-end", rating: 4.7, category: "Mountain", price: 28000, amenities: ['Wi-Fi', 'Restaurant'], imageUrl: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=600&auto=format&fit=crop", lat: 51.1784, lng: -115.5708 },
  { id: 4, name: "Paris, France", location: "France", budget: "Mid-range", rating: 4.6, category: "City", price: 18000, amenities: ['Wi-Fi', 'Restaurant'], imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=600&auto=format&fit=crop", lat: 48.8566, lng: 2.3522 },
  { id: 5, name: "Santorini, Greece", location: "Greece", budget: "Luxury", rating: 4.9, category: "Beach", price: 32000, amenities: ['Wi-Fi', 'Pool', 'Restaurant'], imageUrl: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=600&auto=format&fit=crop", lat: 36.3932, lng: 25.4615 },
  { id: 6, name: "Swiss Alps, Switzerland", location: "Switzerland", budget: "High-end", rating: 5.0, category: "Mountain", price: 35000, amenities: ['Wi-Fi', 'Restaurant'], imageUrl: "https://images.unsplash.com/photo-1482862549707-f63cb32c5fd9?q=80&w=600&auto=format&fit=crop", lat: 46.5681, lng: 7.9092 },
  { id: 7, name: "New York City, USA", location: "USA", budget: "Mid-range", rating: 4.5, category: "City", price: 22000, amenities: ['Wi-Fi', 'Restaurant'], imageUrl: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=600&auto=format&fit=crop", lat: 40.7128, lng: -74.0060 },
  { id: 8, name: "Maldives", location: "Maldives", budget: "Luxury", rating: 5.0, category: "Beach", price: 50000, amenities: ['Wi-Fi', 'Pool', 'Spa'], imageUrl: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=600&auto=format&fit=crop", lat: 3.2028, lng: 73.2207 },
  { id: 9, name: "Himalayas, Nepal", location: "Nepal", budget: "Budget", rating: 4.9, category: "Mountain", price: 8000, amenities: ['Wi-Fi'], imageUrl: "https://images.unsplash.com/photo-1585016495481-91613a3ab1bc?q=80&w=600&auto=format&fit=crop", lat: 28.5983, lng: 83.9310 },
  { id: 10, name: "Rome, Italy", location: "Italy", budget: "Mid-range", rating: 4.7, category: "City", price: 16000, amenities: ['Wi-Fi', 'Restaurant'], imageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=600&auto=format&fit=crop", lat: 41.9028, lng: 12.4964 },
  { id: 11, name: "Phuket, Thailand", location: "Thailand", budget: "Budget", rating: 4.6, category: "Beach", price: 9500, amenities: ['Wi-Fi', 'Pool'], imageUrl: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?q=80&w=600&auto=format&fit=crop", lat: 7.8804, lng: 98.3923 },
  { id: 12, name: "Patagonia, Argentina", location: "Argentina", budget: "High-end", rating: 4.9, category: "Mountain", price: 25000, amenities: ['Wi-Fi'], imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop", lat: -50.2962, lng: -72.6394 },
  { id: 13, name: "Tokyo, Japan", location: "Japan", budget: "High-end", rating: 4.8, category: "City", price: 29000, amenities: ['Wi-Fi', 'Restaurant'], imageUrl: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=600&auto=format&fit=crop", lat: 35.6762, lng: 139.6503 },
  { id: 14, name: "Maui, Hawaii", location: "USA", budget: "Luxury", rating: 4.7, category: "Beach", price: 42000, amenities: ['Wi-Fi', 'Pool', 'Spa'], imageUrl: "https://images.unsplash.com/photo-1505852673536-a8e8ae43d543?q=80&w=600&auto=format&fit=crop", lat: 20.7984, lng: -156.3319 },
  { id: 15, name: "The Dolomites, Italy", location: "Italy", budget: "High-end", rating: 4.9, category: "Mountain", price: 27000, amenities: ['Wi-Fi', 'Restaurant'], imageUrl: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=600&auto=format&fit=crop", lat: 46.4313, lng: 11.7587 },
  { id: 16, name: "Cairo, Egypt", location: "Egypt", budget: "Budget", rating: 4.4, category: "City", price: 8500, amenities: ['Wi-Fi'], imageUrl: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?q=80&w=600&auto=format&fit=crop", lat: 30.0444, lng: 31.2357 },
  { id: 17, name: "Fiji", location: "Fiji", budget: "Luxury", rating: 5.0, category: "Beach", price: 48000, amenities: ['Wi-Fi', 'Pool', 'Spa'], imageUrl: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?q=80&w=600&auto=format&fit=crop", lat: -17.7134, lng: 178.0650 },
  { id: 18, name: "Grand Canyon, USA", location: "USA", budget: "High-end", rating: 4.8, category: "Mountain", price: 21000, amenities: ['Wi-Fi', 'Restaurant'], imageUrl: "https://images.unsplash.com/photo-1615551043360-33de8b5f410c?q=80&w=600&auto=format&fit=crop", lat: 36.0544, lng: -112.1401 },
  { id: 19, name: "Dubrovnik, Croatia", location: "Croatia", budget: "Mid-range", rating: 4.7, category: "City", price: 17500, amenities: ['Wi-Fi', 'Restaurant'], imageUrl: "https://images.unsplash.com/photo-1555992336-03a23c7b20eb?q=80&w=600&auto=format&fit=crop", lat: 42.6507, lng: 18.0944 },
  { id: 20, name: "Amalfi Coast, Italy", location: "Italy", budget: "Luxury", rating: 4.9, category: "Beach", price: 39000, amenities: ['Wi-Fi', 'Pool'], imageUrl: "https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=600&auto=format&fit=crop", lat: 40.6331, lng: 14.6028 },
  { id: 21, name: "Mount Kilimanjaro", location: "Tanzania", budget: "High-end", rating: 4.8, category: "Mountain", price: 30000, amenities: ['Wi-Fi'], imageUrl: "https://images.unsplash.com/photo-1520116468816-95b69f847357?q=80&w=600&auto=format&fit=crop", lat: -3.0674, lng: 37.3556 },
  { id: 22, name: "Barcelona, Spain", location: "Spain", budget: "Mid-range", rating: 4.6, category: "City", price: 14000, amenities: ['Wi-Fi', 'Restaurant'], imageUrl: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=600&auto=format&fit=crop", lat: 41.3851, lng: 2.1734 },
  { id: 23, name: "Cancun, Mexico", location: "Mexico", budget: "Mid-range", rating: 4.5, category: "Beach", price: 13000, amenities: ['Wi-Fi', 'Pool', 'Restaurant'], imageUrl: "https://images.unsplash.com/photo-1552074284-5e88ef1aef18?q=80&w=600&auto=format&fit=crop", lat: 21.1619, lng: -86.8515 },
  { id: 24, name: "Machu Picchu, Peru", location: "Peru", budget: "Budget", rating: 4.9, category: "Mountain", price: 9000, amenities: ['Wi-Fi'], imageUrl: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=600&auto=format&fit=crop", lat: -13.1631, lng: -72.5450 },
  { id: 25, name: "Lisbon, Portugal", location: "Portugal", budget: "Mid-range", rating: 4.7, category: "City", price: 12500, amenities: ['Wi-Fi', 'Restaurant'], imageUrl: "https://images.unsplash.com/photo-1509840144299-db90d85025f3?q=80&w=600&auto=format&fit=crop", lat: 38.7223, lng: -9.1393 },
  { id: 26, name: "Bali, Indonesia", location: "Indonesia", budget: "Budget", rating: 4.6, category: "Beach", price: 7500, amenities: ['Wi-Fi', 'Pool', 'Spa'], imageUrl: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=600&auto=format&fit=crop", lat: -8.4095, lng: 115.1889 },
  { id: 27, name: "Reykjavik, Iceland", location: "Iceland", budget: "High-end", rating: 4.8, category: "Mountain", price: 31000, amenities: ['Wi-Fi', 'Restaurant'], imageUrl: "https://images.unsplash.com/photo-1504829857797-ddff28127792?q=80&w=600&auto=format&fit=crop", lat: 64.1466, lng: -21.9426 },
  { id: 28, name: "Prague, Czech Republic", location: "Czech Republic", budget: "Budget", rating: 4.5, category: "City", price: 11000, amenities: ['Wi-Fi', 'Restaurant'], imageUrl: "https://images.unsplash.com/photo-1541849546-21650904f645?q=80&w=600&auto=format&fit=crop", lat: 50.0755, lng: 14.4378 },
  { id: 29, name: "Rio de Janeiro, Brazil", location: "Brazil", budget: "Mid-range", rating: 4.6, category: "Beach", price: 16000, amenities: ['Wi-Fi', 'Pool'], imageUrl: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?q=80&w=600&auto=format&fit=crop", lat: -22.9068, lng: -43.1729 },
  { id: 30, name: "Interlaken, Switzerland", location: "Switzerland", budget: "High-end", rating: 4.9, category: "Mountain", price: 33000, amenities: ['Wi-Fi'], imageUrl: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=600&auto=format&fit=crop", lat: 46.6863, lng: 7.8632 },
  { id: 31, name: "Dubai, UAE", location: "UAE", budget: "Luxury", rating: 4.8, category: "City", price: 38000, amenities: ['Wi-Fi', 'Pool', 'Restaurant', 'Spa'], imageUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=600&auto=format&fit=crop", lat: 25.2048, lng: 55.2708 },
  { id: 32, name: "Kathmandu, Nepal", location: "Nepal", budget: "Budget", rating: 4.5, category: "City", price: 6500, amenities: ['Wi-Fi'], imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=600&auto=format&fit=crop", lat: 27.7172, lng: 85.3240 },
  { id: 33, name: "Cape Town, South Africa", location: "South Africa", budget: "Mid-range", rating: 4.7, category: "City", price: 19000, amenities: ['Wi-Fi', 'Restaurant'], imageUrl: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?q=80&w=600&auto=format&fit=crop", lat: -33.9249, lng: 18.4241 },
  { id: 34, name: "Koh Samui, Thailand", location: "Thailand", budget: "Mid-range", rating: 4.8, category: "Beach", price: 14000, amenities: ['Wi-Fi', 'Pool'], imageUrl: "https://images.unsplash.com/photo-1542259005453-df57d7b2253a?q=80&w=600&auto=format&fit=crop", lat: 9.5120, lng: 100.0136 },
  { id: 35, name: "Yosemite National Park", location: "USA", budget: "High-end", rating: 4.9, category: "Mountain", price: 26000, amenities: ['Wi-Fi'], imageUrl: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?q=80&w=600&auto=format&fit=crop", lat: 37.8651, lng: -119.5383 },
  { id: 36, name: "Amsterdam, Netherlands", location: "Netherlands", budget: "Mid-range", rating: 4.6, category: "City", price: 17000, amenities: ['Wi-Fi', 'Restaurant'], imageUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=600&auto=format&fit=crop", lat: 52.3676, lng: 4.9041 },
  { id: 37, name: "Hoi An, Vietnam", location: "Vietnam", budget: "Budget", rating: 4.7, category: "City", price: 7000, amenities: ['Wi-Fi'], imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=600&auto=format&fit=crop", lat: 15.8801, lng: 108.3380 },
  { id: 38, name: "Sydney, Australia", location: "Australia", budget: "High-end", rating: 4.7, category: "City", price: 25000, amenities: ['Wi-Fi', 'Restaurant'], imageUrl: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=600&auto=format&fit=crop", lat: -33.8688, lng: 151.2093 },
  { id: 39, name: "Mount Everest Base Camp", location: "Nepal", budget: "High-end", rating: 5.0, category: "Mountain", price: 38000, amenities: ['Wi-Fi'], imageUrl: "https://images.unsplash.com/photo-1533130061792-64b345e4a833?q=80&w=600&auto=format&fit=crop", lat: 28.0044, lng: 86.8559 }
];

const categoryIcons = {
  'All': faFilter,
  'City': faCity,
  'Mountain': faMountain,
  'Beach': faUmbrellaBeach
};

// Side-by-side sticky map subcomponent using global Leaflet
const ExploreMap = ({ destinations, hoveredCoords, theme }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const tileLayerRef = useRef(null);

  useEffect(() => {
    const L = window.L;
    if (!L || !mapContainerRef.current) return;

    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
      }).setView([20, 0], 2);
    }

    const tileUrl = theme === 'light'
      ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
    }
    tileLayerRef.current = L.tileLayer(tileUrl, {
      attribution: '© OpenStreetMap © CARTO'
    }).addTo(mapInstanceRef.current);
  }, [theme]);

  useEffect(() => {
    const L = window.L;
    if (!L || !mapInstanceRef.current) return;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const coordinates = [];

    destinations.forEach(dest => {
      if (dest.lat && dest.lng) {
        coordinates.push([dest.lat, dest.lng]);

        const glowColor = theme === 'light' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(96, 165, 250, 0.6)';
        const pinColor = theme === 'light' ? 'bg-blue-650' : 'bg-blue-500';

        const markerIcon = L.divIcon({
          className: 'explore-custom-icon',
          html: `
            <div class="relative flex items-center justify-center w-8 h-8 rounded-full ${pinColor} text-white border border-white shadow-md text-[10px]" style="box-shadow: 0 0 8px ${glowColor}">
              📍
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const marker = L.marker([dest.lat, dest.lng], { icon: markerIcon })
          .addTo(mapInstanceRef.current)
          .bindPopup(`
            <div class="p-1 font-sans text-gray-800 dark:text-gray-100 max-w-[160px] flex flex-col">
              <img src="${dest.imageUrl}" class="w-full h-16 object-cover rounded-md mb-1" />
              <h5 class="font-bold text-xs m-0 leading-tight">${dest.name}</h5>
              <p class="text-[9px] text-gray-500 dark:text-gray-400 m-0">${dest.location}</p>
              <div class="text-[10px] font-black text-green-600 dark:text-green-400 mt-1">₹${dest.price.toLocaleString('en-IN')}</div>
            </div>
          `);

        markersRef.current.push(marker);
      }
    });

    if (coordinates.length > 0) {
      const bounds = L.latLngBounds(coordinates);
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 6 });
    }
  }, [destinations, theme]);

  useEffect(() => {
    if (mapInstanceRef.current && hoveredCoords) {
      mapInstanceRef.current.setView([hoveredCoords.lat, hoveredCoords.lng], 6, {
        animate: true,
        duration: 0.6
      });
    }
  }, [hoveredCoords]);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="w-full h-full rounded-3xl overflow-hidden shadow-xl border border-gray-200/20 dark:border-slate-800/20 bg-gray-100 dark:bg-slate-800">
      <div ref={mapContainerRef} className="w-full h-full min-h-[400px]" />
    </div>
  );
};

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
  
  // Interactive split Map and Favorites states
  const [showMap, setShowMap] = useState(false);
  const [hoveredCoords, setHoveredCoords] = useState(null);
  const [favoritesList, setFavoritesList] = useState(() => {
    return JSON.parse(localStorage.getItem('favoritesList')) || [];
  });

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

  const toggleFavorite = (destId, e) => {
    e.stopPropagation();
    let updated;
    if (favoritesList.includes(destId)) {
      updated = favoritesList.filter(id => id !== destId);
    } else {
      updated = [...favoritesList, destId];
    }
    setFavoritesList(updated);
    localStorage.setItem('favoritesList', JSON.stringify(updated));
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
    if (destination.lat && destination.lng) {
      setHoveredCoords({ lat: destination.lat, lng: destination.lng });
    }
  };

  const handleMouseLeave = () => {
    setHoveredDestination(null);
    setHoveredCoords(null);
  };

  const handleViewDetails = (destination) => {
    setSelectedDestination(destination);
  };

  const closeModal = () => {
    setSelectedDestination(null);
  };

  const mainColor = theme === 'light' ? 'rgb(59, 130, 246)' : 'rgb(96, 165, 250)';

  return (
    <div className="bg-transparent text-gray-800 dark:text-gray-100 min-h-screen transition-colors duration-500 pt-24 relative overflow-hidden">
      {/* --- Animated Background Elements --- */}
      <svg className="absolute w-full h-full inset-0 z-0 opacity-20" viewBox="0 0 1000 1000" preserveAspectRatio="none">
        <motion.g>
          <motion.path
            d="M0,0 Q250,250 500,500"
            fill="none" stroke={mainColor} strokeWidth="2.5" strokeDasharray="20 20"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: 'easeInOut' }}
          />
          <motion.path
            d="M1000,0 Q750,250 500,500"
            fill="none" stroke={mainColor} strokeWidth="2.5" strokeDasharray="20 20"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.5 }}
          />
          <motion.path
            d="M0,1000 Q250,750 500,500"
            fill="none" stroke={mainColor} strokeWidth="2.5" strokeDasharray="20 20"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: 'easeInOut', delay: 1 }}
          />
          <motion.path
            d="M1000,1000 Q750,750 500,500"
            fill="none" stroke={mainColor} strokeWidth="2.5" strokeDasharray="20 20"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: 'easeInOut', delay: 1.5 }}
          />
        </motion.g>
      </svg>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-12 space-y-6 md:space-y-0"
        >
          <div className="text-left max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-extrabold text-ocean-blue-deep dark:text-ocean-blue-light mb-4">
              Popular Destinations
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Embark on a journey to the world's most captivating places, where every adventure awaits.
            </p>
          </div>

          <motion.button
            onClick={() => setShowMap(!showMap)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full font-bold shadow-lg hover:shadow-indigo-500/30 flex items-center justify-center space-x-2 transition-all self-start md:self-auto"
          >
            <FontAwesomeIcon icon={showMap ? faCity : faMapMarkerAlt} />
            <span>{showMap ? 'Show Full Grid' : 'Split Map View'}</span>
          </motion.button>
        </motion.div>

        {/* Filters Panel */}
        <div className="mb-8 p-6 bg-white dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-155/10 dark:border-slate-700/10">
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
            {/* Search & Sort */}
            <div className="flex flex-col md:flex-row items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
              <div className="relative w-full md:w-1/2">
                <input
                  type="text"
                  id="search"
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border rounded-full pl-10 focus:outline-none focus:ring-2 focus:ring-ocean-blue-deep dark:bg-gray-850 dark:border-gray-600"
                />
                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <div className="relative w-full md:w-1/2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 border rounded-full appearance-none bg-gray-200 dark:bg-gray-850 dark:border-gray-600 cursor-pointer text-sm font-semibold"
                >
                  <option value="rating">Highest Rating</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="name">Name (A-Z)</option>
                </select>
                <FontAwesomeIcon icon={faSortAmountDownAlt} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold whitespace-nowrap">Categories:</span>
                <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hidden">
                  {categories.map(cat => (
                    <motion.button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors flex items-center whitespace-nowrap ${
                        activeCategory === cat
                          ? 'bg-ocean-blue-deep text-white shadow-md'
                          : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FontAwesomeIcon icon={categoryIcons[cat]} className="mr-1.5 text-xs" />
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
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${
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
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors flex items-center whitespace-nowrap ${
                        selectedAmenities.includes(amenity)
                          ? 'bg-ocean-blue-deep text-white shadow-md'
                          : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {amenity === 'Wi-Fi' && <FontAwesomeIcon icon={faWifi} className="mr-1.5 text-xs" />}
                      {amenity === 'Restaurant' && <FontAwesomeIcon icon={faUtensils} className="mr-1.5 text-xs" />}
                      {amenity === 'Spa' && <FontAwesomeIcon icon={faSpa} className="mr-1.5 text-xs" />}
                      {amenity === 'Pool' && <FontAwesomeIcon icon={faSpa} className="mr-1.5 text-xs" />}
                      {t(amenity)}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Layout Split Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Grid Panel */}
          <div className={`${showMap ? 'lg:col-span-7 xl:col-span-8' : 'lg:col-span-12'} w-full transition-all duration-300`}>
            <motion.div
              layout
              className={`grid grid-cols-1 ${showMap ? 'sm:grid-cols-1 md:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'} gap-8`}
            >
              {destinations.length > 0 ? (
                destinations.map((dest, index) => (
                  <motion.div
                    key={dest.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.02 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden relative group cursor-pointer border border-gray-100 dark:border-slate-800 hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                    onMouseEnter={() => handleMouseEnter(dest)}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => handleViewDetails(dest)}
                  >
                    <div className="relative h-48 w-full overflow-hidden">
                      <img
                        src={dest.imageUrl}
                        alt={dest.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-35 transition-all duration-300" />
                      
                      {/* Interactive Heart Button */}
                      <button 
                        onClick={(e) => toggleFavorite(dest.id, e)} 
                        className="absolute top-4 right-4 z-20 w-9 h-9 bg-white/80 dark:bg-gray-850/80 backdrop-blur-md hover:bg-white dark:hover:bg-gray-800 rounded-full flex items-center justify-center shadow-md transition-all active:scale-90"
                      >
                        <FontAwesomeIcon 
                          icon={favoritesList.includes(dest.id) ? faHeartSolid : faHeartRegular} 
                          className={favoritesList.includes(dest.id) ? 'text-red-500 scale-110 transition-transform' : 'text-gray-500 dark:text-gray-300'} 
                        />
                      </button>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1 leading-tight">{dest.name}</h3>
                      <p className="text-gray-600 dark:text-gray-400 flex items-center mb-2 text-sm font-semibold">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-blue-500" />
                        {dest.location}
                      </p>
                      
                      <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700/50 pt-4 mt-4">
                        <div className="flex flex-col">
                          <div className="flex items-center text-yellow-500 text-xs font-bold mb-0.5">
                            <FontAwesomeIcon icon={faStar} className="mr-1" />
                            <span className="text-gray-800 dark:text-gray-100">{dest.rating}</span>
                          </div>
                          <div className="text-sm font-black text-green-600 dark:text-green-400">
                            <FontAwesomeIcon icon={faRupeeSign} className="mr-0.5" />
                            {dest.price.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Hover Pop-up Inside Card */}
                    <AnimatePresence>
                      {hoveredDestination && hoveredDestination.id === dest.id && (
                        <motion.div
                          initial={{ y: '100%', opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: '100%', opacity: 0 }}
                          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                          className="absolute bottom-0 inset-x-0 p-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-750/50 shadow-xl z-20 pointer-events-none"
                        >
                          <p className="text-[10px] font-extrabold text-gray-450 dark:text-gray-500 uppercase tracking-wider mb-2">Quick Info</p>
                          <ul className="space-y-1 text-xs text-gray-800 dark:text-gray-200">
                            <li className="flex items-center">
                              <FontAwesomeIcon icon={faMoneyBillWave} className="text-green-500 mr-2 w-3.5" />
                              <span className="font-bold mr-1">Budget:</span> {t(dest.budget)}
                            </li>
                            <li className="flex items-center">
                              <FontAwesomeIcon icon={faTag} className="text-purple-500 mr-2 w-3.5" />
                              <span className="font-bold mr-1">Category:</span> {t(dest.category)}
                            </li>
                            <li className="flex items-start">
                              <FontAwesomeIcon icon={faWifi} className="text-blue-500 mr-2 mt-0.5 w-3.5" />
                              <span className="font-bold mr-1">Amenities:</span> {dest.amenities.map(amenity => t(amenity)).join(', ')}
                            </li>
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-md">
                  <h2 className="text-2xl font-bold text-gray-500">No destinations found.</h2>
                  <p className="text-gray-400">Try adjusting your filters or search query.</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sticky Split Map View */}
          {showMap && (
            <div className="lg:col-span-5 xl:col-span-4 h-[calc(100vh-140px)] sticky top-28 hidden lg:block z-10 pb-6">
              <ExploreMap destinations={destinations} hoveredCoords={hoveredCoords} theme={theme} />
            </div>
          )}
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
                className="absolute top-4 right-4 text-gray-550 dark:text-gray-400 hover:text-red-500 transition-colors w-8 h-8 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center"
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
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-blue-500" />
                  {selectedDestination.location}
                </p>
                
                <div className="flex items-center text-yellow-500 mt-4">
                  <FontAwesomeIcon icon={faStar} className="mr-2 text-2xl" />
                  <span className="text-xl font-semibold">{selectedDestination.rating}</span>
                </div>
                
                <hr className="my-6 border-gray-200 dark:border-gray-700" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-slate-200">Pricing & Category</h3>
                    <p className="mb-2"><span className="font-semibold">Budget:</span> {t(selectedDestination.budget)}</p>
                    <p><span className="font-semibold">Category:</span> {t(selectedDestination.category)}</p>
                    <div className="mt-4 text-3xl font-bold text-ocean-blue-deep dark:text-ocean-blue-light">
                      <FontAwesomeIcon icon={faRupeeSign} />{selectedDestination.price.toLocaleString('en-IN')}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-slate-200">Amenities</h3>
                    <ul className="space-y-2 text-gray-750 dark:text-gray-300">
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
