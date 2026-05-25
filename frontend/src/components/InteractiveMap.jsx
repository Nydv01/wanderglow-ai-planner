// frontend/src/components/InteractiveMap.jsx
import React, { useEffect, useRef } from 'react';

const InteractiveMap = ({ activities, center, theme, selectedHotel }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);

  // Sync Map Tiles with Theme
  useEffect(() => {
    const L = window.L;
    if (!L || !mapInstanceRef.current) return;

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

  // Sync Markers and Paths
  useEffect(() => {
    const L = window.L;
    if (!L || !mapContainerRef.current) return;

    // Fix default Leaflet icon paths
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    const coordinates = [];
    activities.forEach(act => {
      if (act.lat && act.lng) {
        coordinates.push([act.lat, act.lng]);
      }
    });

    let mapCenter = [48.8566, 2.3522]; // Paris default
    if (center && center.lat && center.lng) {
      mapCenter = [center.lat, center.lng];
    } else if (coordinates.length > 0) {
      mapCenter = coordinates[0];
    } else if (selectedHotel && selectedHotel.lat && selectedHotel.lng) {
      mapCenter = [selectedHotel.lat, selectedHotel.lng];
    }

    // Initialize Map Instance (if not already created)
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
      }).setView(mapCenter, 12);

      const tileUrl = theme === 'light'
        ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

      tileLayerRef.current = L.tileLayer(tileUrl, {
        attribution: '© OpenStreetMap © CARTO'
      }).addTo(mapInstanceRef.current);
    } else {
      mapInstanceRef.current.setView(mapCenter, 12);
    }

    // Clear existing markers and lines
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    // Plot new custom glowing SVG markers
    activities.forEach((act, idx) => {
      if (act.lat && act.lng) {
        const glowColor = theme === 'light' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(96, 165, 250, 0.6)';
        const pinBg = theme === 'light' ? 'bg-blue-600' : 'bg-blue-500';

        const customIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `
            <div class="relative flex items-center justify-center w-8 h-8 rounded-full ${pinBg} text-white font-extrabold text-xs border border-white shadow-lg shadow-blue-500/30" style="box-shadow: 0 0 12px ${glowColor}">
              ${idx + 1}
              <div class="absolute -inset-1 rounded-full animate-ping opacity-30 border border-blue-400 pointer-events-none" style="animation-duration: 3s"></div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const marker = L.marker([act.lat, act.lng], { icon: customIcon })
          .addTo(mapInstanceRef.current)
          .bindPopup(`
            <div class="p-2 font-sans">
              <h4 class="font-extrabold text-sm text-blue-600 dark:text-blue-400 mb-0.5 leading-tight">${act.name}</h4>
              <p class="text-xs text-gray-500 dark:text-gray-300 leading-normal m-0">${act.description || ''}</p>
            </div>
          `);
        markersRef.current.push(marker);
      }
    });

    // Plot Selected Hotel Marker
    if (selectedHotel && selectedHotel.lat && selectedHotel.lng) {
      const hotelGlowColor = 'rgba(245, 158, 11, 0.6)'; // Gold glow
      const customHotelIcon = L.divIcon({
        className: 'custom-hotel-div-icon',
        html: `
          <div class="relative flex items-center justify-center w-9 h-9 rounded-full bg-amber-500 text-white font-extrabold text-xs border-2 border-white shadow-lg shadow-amber-500/40" style="box-shadow: 0 0 16px ${hotelGlowColor}">
            🏨
            <div class="absolute -inset-1 rounded-full animate-ping opacity-45 border border-amber-400 pointer-events-none" style="animation-duration: 2.5s"></div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const hotelMarker = L.marker([selectedHotel.lat, selectedHotel.lng], { icon: customHotelIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup(`
          <div class="p-2 font-sans">
            <span class="px-2 py-0.5 bg-amber-550/10 text-amber-600 dark:text-amber-400 rounded-full text-[10px] font-bold uppercase tracking-wider">Selected Hotel</span>
            <h4 class="font-extrabold text-sm text-amber-600 dark:text-amber-400 mt-1 mb-0.5 leading-tight">${selectedHotel.name}</h4>
            <p class="text-xs text-gray-500 dark:text-gray-300 leading-normal m-0">${selectedHotel.description || ''}</p>
          </div>
        `);
      markersRef.current.push(hotelMarker);
      
      coordinates.push([selectedHotel.lat, selectedHotel.lng]);
    }

    // Connect markers with polyline
    if (coordinates.length > 1) {
      const pathColor = theme === 'light' ? '#2563EB' : '#60A5FA';
      polylineRef.current = L.polyline(coordinates, {
        color: pathColor,
        weight: 3.5,
        opacity: 0.85,
        dashArray: '5, 8',
        lineJoin: 'round'
      }).addTo(mapInstanceRef.current);

      mapInstanceRef.current.fitBounds(L.latLngBounds(coordinates), { padding: [40, 40] });
    }

    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [activities, center, theme, selectedHotel]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-xl border border-gray-200/50 dark:border-gray-800/40">
      <div ref={mapContainerRef} className="w-full h-full min-h-[350px] z-10" />
    </div>
  );
};

export default InteractiveMap;
