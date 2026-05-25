// src/pages/Landing.jsx

import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faStar, faMapMarkedAlt, faUsers, faHeart, faTag, faPlane, 
  faCompass, faHeart as faHeartSolid, faMountainSun, faArrowRight, 
  faGlobe, faSearch, faCalendarAlt, faBed, faRoute, faTicketAlt, 
  faTags, faExchangeAlt, faCheckCircle 
} from '@fortawesome/free-solid-svg-icons';
import Joyride from 'react-joyride';
import { useTranslation } from 'react-i18next';

// Utility for scroll-triggered animations
const AnimateOnScroll = ({ children, variants = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } }, threshold = 0.15, ...rest }) => {
    const [ref, inView] = useInView({ triggerOnce: true, threshold });
    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={variants}
            transition={{ duration: 0.8, type: "spring", stiffness: 100, damping: 15 }}
            {...rest}
        >
            {children}
        </motion.div>
    );
};

const featuredDestinations = [
    { id: 1, name: "Dolomites, Italy", location: "Dolomites, Italy", price: 1200, originalPrice: 1500, rating: 4.9, reviews: 420, imageUrl: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=600&auto=format&fit=crop", happyTravelers: 4200, popularTags: ['Mountains', 'Hiking', 'Scenic'], badge: "bestSeller" },
    { id: 2, name: "Banff, Canada", location: "Banff, Canada", price: 1550, originalPrice: 1900, rating: 4.8, reviews: 310, imageUrl: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=600&auto=format&fit=crop", happyTravelers: 3500, popularTags: ['Nature', 'Lakes', 'Wildlife'], badge: "trending" },
    { id: 3, name: "Scottish Highlands", location: "Scottish Highlands, UK", price: 950, originalPrice: 1200, rating: 4.7, reviews: 250, imageUrl: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=600&auto=format&fit=crop", happyTravelers: 2500, popularTags: ['History', 'Castles', 'Wilderness'], badge: null },
    { id: 4, name: "Patagonia, Argentina", location: "Patagonia, Argentina", price: 2800, originalPrice: 3400, rating: 4.9, reviews: 520, imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop", happyTravelers: 3000, popularTags: ['Glaciers', 'Trekking', 'Stunning Views'], badge: "bestSeller" },
    { id: 5, name: "South Island, NZ", location: "South Island, NZ", price: 3200, originalPrice: 3800, rating: 5.0, reviews: 680, imageUrl: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=600&auto=format&fit=crop", happyTravelers: 4500, popularTags: ['Adventure', 'Lakes', 'Fjord'], badge: "trending" },
    { id: 6, name: "Swiss Alps", location: "Swiss Alps, Switzerland", price: 2500, originalPrice: 3000, rating: 4.9, reviews: 450, imageUrl: "https://images.unsplash.com/photo-1482862549707-f63cb32c5fd9?q=80&w=600&auto=format&fit=crop", happyTravelers: 5500, popularTags: ['Skiing', 'Luxury', 'Panoramic'], badge: null },
];

const statsData = [
    { id: 'happyTravelers', value: '50K+', label: 'happyTravelers', popUpText: 'Join our growing community of satisfied adventurers!' },
    { id: 'destinations', value: '200+', label: 'destinations', popUpText: 'Explore a world of possibilities tailored just for you!' },
    { id: 'satisfaction', value: '98%', label: 'satisfaction', popUpText: 'Your happiness is our top priority. Travel with confidence!' },
];

// Major world city coordinates for flight arcs on 3D globe
const cities = [
  { name: 'Paris', lat: 48.8566, lng: 2.3522 },
  { name: 'Tokyo', lat: 35.6762, lng: 139.6503 },
  { name: 'New York', lat: 40.7128, lng: -74.0060 },
  { name: 'Sydney', lat: -33.8688, lng: 151.2093 },
  { name: 'Cairo', lat: 30.0444, lng: 31.2357 },
  { name: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729 },
  { name: 'Reykjavik', lat: 64.1466, lng: -21.9426 }
];

// Simplified coordinates of continents for procedural map generation (lat, lng)
const continentPolygons = [
  // North America
  [[-168, 66], [-120, 71], [-90, 75], [-60, 75], [-50, 60], [-60, 45], [-80, 25], [-100, 15], [-110, 8], [-105, 20], [-120, 35], [-125, 48], [-165, 55]],
  // Greenland
  [[-70, 70], [-60, 83], [-20, 80], [-40, 60], [-50, 60]],
  // South America
  [[-80, 12], [-50, -5], [-35, -5], [-40, -20], [-65, -45], [-75, -55], [-72, -40], [-80, -20], [-82, -5]],
  // Africa
  [[-17, 32], [15, 32], [33, 30], [51, 11], [46, -25], [34, -34], [18, -34], [10, 5], [-17, 15]],
  // Europe & Asia (Eurasia)
  [[-10, 62], [10, 58], [30, 70], [60, 75], [90, 75], [120, 75], [140, 75], [170, 70], [180, 65], [170, 50], [140, 35], [120, 15], [105, 20], [80, 8], [75, 25], [50, 15], [35, 30], [25, 40], [15, 45], [-5, 36], [-10, 40]],
  // India
  [[68, 24], [78, 8], [88, 22]],
  // Indochina
  [[95, 22], [105, 10], [110, 20]],
  // Australia
  [[113, -22], [136, -12], [150, -34], [140, -38], [115, -34]],
  // Madagascar
  [[43, -12], [50, -15], [47, -25], [43, -22]],
  // Japan
  [[130, 32], [140, 38], [142, 43], [135, 35]],
  // United Kingdom & Ireland
  [[-10, 50], [0, 58], [2, 50]],
  // Scandinavia
  [[5, 60], [15, 70], [25, 70], [30, 60], [20, 60]],
  // New Zealand
  [[166, -46], [178, -37], [172, -41]]
];

const LandingPage = ({ runTour, handleTourCallback, theme }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [hoveredCardId, setHoveredCardId] = useState(null);
    const [hoveredStatCardId, setHoveredStatCardId] = useState(null);
    const [hoveredCorner, setHoveredCorner] = useState(null);

    const [searchTab, setSearchTab] = useState('planner'); // 'flights' | 'hotels' | 'planner'
    
    // AI Planner States
    const [plannerDest, setPlannerDest] = useState('');
    const [plannerBudget, setPlannerBudget] = useState('moderate');
    const [plannerDays, setPlannerDays] = useState(5);
    
    // Flight States
    const [flightFrom, setFlightFrom] = useState('New York (JFK)');
    const [flightTo, setFlightTo] = useState('Paris (CDG)');
    const [flightCabin, setFlightCabin] = useState('Economy');
    
    // Hotel States
    const [hotelCity, setHotelCity] = useState('Paris');
    const [hotelGuests, setHotelGuests] = useState('2 Guests');

    // Booking simulator states
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchResults, setSearchResults] = useState(null);

    const handleMockSearch = () => {
        setSearchLoading(true);
        setSearchResults(null);
        setTimeout(() => {
            setSearchLoading(false);
            if (searchTab === 'flights') {
                setSearchResults([
                    { airline: 'Delta Airlines', flightNo: 'DL-104', price: 580, originalPrice: 720, duration: '7h 45m', stops: 'Non-stop', time: '08:30 PM - 09:15 AM (+1)' },
                    { airline: 'Air France', flightNo: 'AF-015', price: 620, originalPrice: 780, duration: '7h 30m', stops: 'Non-stop', time: '11:00 PM - 11:30 AM (+1)' },
                    { airline: 'United Airlines', flightNo: 'UA-982', price: 510, originalPrice: 650, duration: '9h 15m', stops: '1 Stop', time: '05:40 PM - 07:55 AM (+1)' }
                ]);
            } else if (searchTab === 'hotels') {
                setSearchResults([
                    { name: 'Hotel Ritz Paris', rating: 4.9, pricePerNight: 950, originalPrice: 1200, description: 'Ultra-luxury hotel in central Paris with premium suites, a world-class private spa, and garden dining.', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600&auto=format&fit=crop' },
                    { name: 'Le Pavillon de la Reine', rating: 4.7, pricePerNight: 420, originalPrice: 550, description: 'Charming boutique hotel located in the historic Place des Vosges, offering private gardens and historical interiors.', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=600&auto=format&fit=crop' },
                    { name: 'Hotel Regina Louvre', rating: 4.6, pricePerNight: 310, originalPrice: 400, description: 'Elegant hotel opposite the Louvre Museum, showcasing classic French design and beautiful city views.', image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=600&auto=format&fit=crop' }
                ]);
            }
        }, 1500);
    };

    const handlePlannerSubmit = () => {
        // Save parameters to localStorage so InputPage.jsx can load them
        localStorage.setItem('prefilledDest', plannerDest);
        localStorage.setItem('prefilledBudget', plannerBudget);
        localStorage.setItem('prefilledDays', plannerDays);
        navigate('/plan');
    };

    const mountRef = useRef(null);
    const featuredAdventuresRef = useRef(null);

    useEffect(() => {
        let scene, camera, renderer, globeGroup;
        let starField;
        let flightArcs = [];
        let pulsatingRings = [];
        let animationFrameId;
        const clock = new THREE.Clock();

        // Drag interaction states with momentum/inertia
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };
        let rotationVelocityX = 0;
        let rotationVelocityY = 0.003; // Initial slow rotation drift

        if (!mountRef.current) return;

        const init = () => {
            const width = mountRef.current.clientWidth;
            const height = mountRef.current.clientHeight;

            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
            camera.position.z = 4.5;

            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setSize(width, height);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            mountRef.current.appendChild(renderer.domElement);

            globeGroup = new THREE.Group();
            scene.add(globeGroup);

            // Colors based on theme
            const isDark = theme !== 'light';
            const primaryColor = isDark ? 0x60a5fa : 0x2563eb; // blue-400 : blue-600
            const secondaryColor = isDark ? 0x818cf8 : 0x4f46e5; // indigo-400 : indigo-600

            // 1. Globe Base Structure (Dotted Continents & Wireframe)
            const radius = 1.4;
            const sphereGeometry = new THREE.SphereGeometry(radius, 64, 64);
            
            // Create procedural dotted world map canvas texture
            const textureCanvas = document.createElement('canvas');
            textureCanvas.width = 1024;
            textureCanvas.height = 512;
            const tCtx = textureCanvas.getContext('2d');

            // Draw base map background (ocean)
            tCtx.fillStyle = isDark ? '#0f172a' : '#ffffff';
            tCtx.fillRect(0, 0, 1024, 512);

            // Draw landmasses on a small offscreen canvas to scan for pixels
            const offscreen = document.createElement('canvas');
            offscreen.width = 360;
            offscreen.height = 180;
            const oCtx = offscreen.getContext('2d');
            oCtx.fillStyle = '#000000';
            oCtx.fillRect(0, 0, 360, 180);
            oCtx.fillStyle = '#ffffff';

            continentPolygons.forEach(polygon => {
                oCtx.beginPath();
                polygon.forEach((pt, idx) => {
                    const x = pt[0] + 180;
                    const y = 90 - pt[1];
                    if (idx === 0) oCtx.moveTo(x, y);
                    else oCtx.lineTo(x, y);
                });
                oCtx.closePath();
                oCtx.fill();
            });

            // Scan offscreen pixels to draw dotted landmasses on main canvas
            const imgData = oCtx.getImageData(0, 0, 360, 180);
            const pixels = imgData.data;

            // Draw grid dots
            const dotColor = isDark ? '#3b82f6' : '#60a5fa'; // Blue-500 or Blue-400
            tCtx.fillStyle = dotColor;

            const gridCols = 180;
            const gridRows = 90;
            const colWidth = 1024 / gridCols;
            const rowHeight = 512 / gridRows;

            for (let r = 0; r < gridRows; r++) {
                for (let c = 0; c < gridCols; c++) {
                    const ox = Math.floor(c * 360 / gridCols);
                    const oy = Math.floor(r * 180 / gridRows);
                    const idx = (oy * 360 + ox) * 4;
                    const isLand = pixels[idx] > 128; // white pixel = land
                    
                    if (isLand) {
                        const cx = c * colWidth + colWidth / 2;
                        const cy = r * rowHeight + rowHeight / 2;
                        tCtx.beginPath();
                        tCtx.arc(cx, cy, 1.8, 0, Math.PI * 2);
                        tCtx.fill();
                    }
                }
            }

            const globeTexture = new THREE.CanvasTexture(textureCanvas);
            const sphereMaterial = new THREE.MeshBasicMaterial({
                map: globeTexture,
                transparent: true,
                opacity: 0.95,
            });
            const globeBase = new THREE.Mesh(sphereGeometry, sphereMaterial);
            globeGroup.add(globeBase);

            // Glowing Wireframe Outline
            const wireframe = new THREE.WireframeGeometry(sphereGeometry);
            const lineMat = new THREE.LineBasicMaterial({
                color: primaryColor,
                transparent: true,
                opacity: isDark ? 0.18 : 0.1,
            });
            const lineSegments = new THREE.LineSegments(wireframe, lineMat);
            globeGroup.add(lineSegments);

            // Lat/Lng Coordinate Grid Lines (Graticule circles)
            for (let lat = -60; lat <= 60; lat += 30) {
                const latRadius = radius * Math.cos(lat * Math.PI / 180);
                const latY = radius * Math.sin(lat * Math.PI / 180);
                
                const points = [];
                for (let theta = 0; theta <= 360; theta += 10) {
                    const rad = theta * Math.PI / 180;
                    points.push(new THREE.Vector3(latRadius * Math.cos(rad), latY, latRadius * Math.sin(rad)));
                }
                const lineGeom = new THREE.BufferGeometry().setFromPoints(points);
                const graticuleMat = new THREE.LineBasicMaterial({
                    color: primaryColor,
                    transparent: true,
                    opacity: isDark ? 0.12 : 0.05
                });
                const latLine = new THREE.Line(lineGeom, graticuleMat);
                globeGroup.add(latLine);
            }

            // Atmospheric Glow Halo Sphere
            const glowGeom = new THREE.SphereGeometry(radius * 1.07, 32, 32);
            const glowMat = new THREE.MeshBasicMaterial({
                color: primaryColor,
                transparent: true,
                opacity: isDark ? 0.12 : 0.07,
                blending: THREE.AdditiveBlending,
                side: THREE.BackSide
            });
            const glowMesh = new THREE.Mesh(glowGeom, glowMat);
            scene.add(glowMesh);

            // 2. Dynamic Particle Starfield Background
            const starsGeom = new THREE.BufferGeometry();
            const starsCount = isDark ? 600 : 200;
            const starPositions = [];
            const starColors = [];

            for (let i = 0; i < starsCount; i++) {
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(Math.random() * 2 - 1);
                const distance = 4 + Math.random() * 6;

                starPositions.push(
                    distance * Math.sin(phi) * Math.cos(theta),
                    distance * Math.sin(phi) * Math.sin(theta),
                    distance * Math.cos(phi)
                );

                const c = isDark ? (0.6 + Math.random() * 0.4) : (0.2 + Math.random() * 0.3);
                starColors.push(c, c, c);
            }

            starsGeom.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
            starsGeom.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));

            const starsMat = new THREE.PointsMaterial({
                size: 0.03,
                vertexColors: true,
                transparent: true,
                opacity: 0.7,
            });
            starField = new THREE.Points(starsGeom, starsMat);
            scene.add(starField);

            // Helper to generate text sprites for city labels
            const createTextSprite = (text) => {
                const canvas = document.createElement('canvas');
                canvas.width = 256;
                canvas.height = 64;
                const ctx = canvas.getContext('2d');

                // High-quality text style
                ctx.font = 'bold 26px Poppins, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                // Shadow glow
                ctx.shadowColor = isDark ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.9)';
                ctx.shadowBlur = 6;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 1;

                ctx.fillStyle = isDark ? '#93c5fd' : '#1e3a8a'; // light blue for dark mode, navy for light mode
                ctx.fillText(text, 128, 32);

                const texture = new THREE.CanvasTexture(canvas);
                const spriteMaterial = new THREE.SpriteMaterial({
                    map: texture,
                    transparent: true
                });
                const sprite = new THREE.Sprite(spriteMaterial);
                sprite.scale.set(0.65, 0.16, 1.0);
                return sprite;
            };

            // 3. Draw City Pins and Flight Path Arcs
            const convertLatLngToVector3 = (lat, lng, r) => {
                const phi = (90 - lat) * (Math.PI / 180);
                const theta = (lng + 180) * (Math.PI / 180);
                const x = -(r * Math.sin(phi) * Math.sin(theta));
                const y = r * Math.cos(phi);
                const z = r * Math.sin(phi) * Math.cos(theta);
                return new THREE.Vector3(x, y, z);
            };

            // Plot City Pins
            cities.forEach((city, cityIdx) => {
                const pos = convertLatLngToVector3(city.lat, city.lng, radius);
                
                // Pin Sphere
                const pinGeom = new THREE.SphereGeometry(0.025, 16, 16);
                const pinMat = new THREE.MeshBasicMaterial({ color: 0xef4444 }); // red-500
                const pinMesh = new THREE.Mesh(pinGeom, pinMat);
                pinMesh.position.copy(pos);
                globeGroup.add(pinMesh);

                // Small pulsing ring around the pin
                const ringGeom = new THREE.RingGeometry(0.03, 0.05, 16);
                const ringMat = new THREE.MeshBasicMaterial({
                    color: 0xef4444,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0.6
                });
                const ringMesh = new THREE.Mesh(ringGeom, ringMat);
                ringMesh.position.copy(pos);
                ringMesh.lookAt(new THREE.Vector3(0, 0, 0));
                globeGroup.add(ringMesh);
                pulsatingRings.push(ringMesh);

                // Floating text label billboard above the pin
                const label = createTextSprite(city.name);
                const labelPos = pos.clone().multiplyScalar(1.08); // float above pin
                label.position.copy(labelPos);
                globeGroup.add(label);
            });

            // Generate Flight Arcs between random cities
            for (let i = 0; i < cities.length; i++) {
                const startCity = cities[i];
                const endCity = cities[(i + 2) % cities.length];

                const startPos = convertLatLngToVector3(startCity.lat, startCity.lng, radius);
                const endPos = convertLatLngToVector3(endCity.lat, endCity.lng, radius);

                const midPoint = new THREE.Vector3().addVectors(startPos, endPos).multiplyScalar(0.5);
                const distance = startPos.distanceTo(endPos);
                const elevationFactor = 0.35 + distance * 0.15;
                const controlPoint = midPoint.clone().normalize().multiplyScalar(radius + elevationFactor);

                const curve = new THREE.QuadraticBezierCurve3(startPos, controlPoint, endPos);
                const points = curve.getPoints(50);
                const curveGeom = new THREE.BufferGeometry().setFromPoints(points);

                // Render Arc Line
                const curveMat = new THREE.LineBasicMaterial({
                    color: secondaryColor,
                    transparent: true,
                    opacity: 0.25,
                });
                const curveLine = new THREE.Line(curveGeom, curveMat);
                globeGroup.add(curveLine);

                // Floating Flight Particle (Comet Head)
                const particleGeom = new THREE.SphereGeometry(0.015, 8, 8);
                const particleMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
                const particleMesh = new THREE.Mesh(particleGeom, particleMat);
                globeGroup.add(particleMesh);

                // Comet Trail Line
                const trailGeom = new THREE.BufferGeometry();
                const trailMat = new THREE.LineBasicMaterial({
                    color: secondaryColor,
                    transparent: true,
                    opacity: 0.6,
                    linewidth: 1.5
                });
                const trailLine = new THREE.Line(trailGeom, trailMat);
                globeGroup.add(trailLine);

                flightArcs.push({
                    curve,
                    mesh: particleMesh,
                    trailGeom,
                    speed: 0.12 + Math.random() * 0.12,
                    progress: Math.random() 
                });
            }

            // 4. Interactive Drag controls with Inertia
            const onMouseDown = (e) => {
                isDragging = true;
                previousMousePosition = {
                    x: e.clientX,
                    y: e.clientY
                };
            };

            const onMouseMove = (e) => {
                if (isDragging) {
                    const deltaMove = {
                        x: e.clientX - previousMousePosition.x,
                        y: e.clientY - previousMousePosition.y
                    };

                    // Compute velocity from movement
                    rotationVelocityY = deltaMove.x * 0.003;
                    rotationVelocityX = deltaMove.y * 0.003;

                    const deltaRotationQuaternion = new THREE.Quaternion()
                        .setFromEuler(new THREE.Euler(
                            (deltaMove.y * Math.PI) / 180 * 0.25,
                            (deltaMove.x * Math.PI) / 180 * 0.25,
                            0,
                            'XYZ'
                        ));
                    globeGroup.quaternion.multiplyQuaternions(deltaRotationQuaternion, globeGroup.quaternion);
                }

                previousMousePosition = {
                    x: e.clientX,
                    y: e.clientY
                };
            };

            const onMouseUp = () => {
                isDragging = false;
            };

            mountRef.current.addEventListener('mousedown', onMouseDown);
            mountRef.current.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);

            const animate = () => {
                animationFrameId = requestAnimationFrame(animate);
                const delta = clock.getDelta();
                const time = clock.getElapsedTime();

                // Rotate globe automatically (slow drift + inertia physics)
                if (!isDragging) {
                    // Decay velocity
                    rotationVelocityY *= 0.95;
                    rotationVelocityX *= 0.95;

                    // Apply rotation velocities
                    globeGroup.rotation.y += rotationVelocityY;
                    globeGroup.rotation.x += rotationVelocityX;

                    // Maintain a very small background rotation drift if user releases it
                    if (Math.abs(rotationVelocityY) < 0.001) {
                        globeGroup.rotation.y += 0.05 * delta;
                    }
                }

                // Slow starfield rotation
                if (starField) {
                    starField.rotation.y = time * 0.01;
                    starField.rotation.x = time * 0.003;
                }

                // Pulsate city rings
                pulsatingRings.forEach((ring, idx) => {
                    const scaleFactor = 1.0 + Math.sin(time * 5 + idx) * 0.35;
                    ring.scale.set(scaleFactor, scaleFactor, scaleFactor);
                    ring.material.opacity = (1.35 - scaleFactor) * 0.65;
                });

                // Fade out labels on the back hemisphere of the globe
                globeGroup.children.forEach(child => {
                    if (child.isSprite) {
                        const worldPos = new THREE.Vector3();
                        child.getWorldPosition(worldPos);
                        if (worldPos.z < 0.25) {
                            child.material.opacity = Math.max(0, worldPos.z / 0.25);
                        } else {
                            child.material.opacity = 1.0;
                        }
                    }
                });

                // Animate flight particles and update trails
                flightArcs.forEach(arc => {
                    arc.progress += arc.speed * delta;
                    if (arc.progress > 1) arc.progress = 0;
                    
                    const newPos = arc.curve.getPointAt(arc.progress);
                    arc.mesh.position.copy(newPos);

                    // Update trail points dynamically
                    const trailPoints = [];
                    for (let p = 0; p <= 12; p++) {
                        const prog = Math.max(0, arc.progress - (p * 0.012));
                        trailPoints.push(arc.curve.getPointAt(prog));
                    }
                    arc.trailGeom.setFromPoints(trailPoints);
                });

                renderer.render(scene, camera);
            };

            animate();

            const handleResize = () => {
                if (!mountRef.current) return;
                const w = mountRef.current.clientWidth;
                const h = mountRef.current.clientHeight;
                camera.aspect = w / h;
                camera.updateProjectionMatrix();
                renderer.setSize(w, h);
            };
            window.addEventListener('resize', handleResize);

            // Cleanup event listeners
            return () => {
                window.removeEventListener('resize', handleResize);
                window.removeEventListener('mouseup', onMouseUp);
                if (mountRef.current) {
                    mountRef.current.removeEventListener('mousedown', onMouseDown);
                    mountRef.current.removeEventListener('mousemove', onMouseMove);
                }
                cancelAnimationFrame(animationFrameId);
                scene.clear();
                renderer.dispose();
            };
        };

        init();
    }, [theme]);

    const tourSteps = [
      {
        target: '.tour-start-button',
        content: t('welcomeTour'),
        placement: 'bottom',
      },
      {
        target: 'body',
        content: t('goPlanTour'),
        placement: 'center',
      },
    ];

    const heroVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 80,
                damping: 15,
                staggerChildren: 0.2,
            },
        },
    };

    const textItemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0 },
    };

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100 } },
    };

    const cornerFeatureVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 200, damping: 20 } },
        hover: { scale: 1.1 }
    };

    const handleScrollToFeatured = () => {
        if (featuredAdventuresRef.current) {
            featuredAdventuresRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="bg-transparent text-gray-800 dark:text-gray-100 transition-colors duration-500 overflow-x-hidden min-h-screen relative">

            {/* Cinematic Hero Section */}
            <AnimatePresence>
                <motion.section
                    key="hero-section"
                    variants={heroVariants}
                    initial="hidden"
                    animate="visible"
                    className="relative z-10 flex flex-col items-center justify-center pt-36 pb-12 md:pt-48 md:pb-16 text-center px-4"
                >
                    <motion.div
                        variants={textItemVariants}
                        className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-widest mb-6 border border-blue-500/20"
                    >
                        <FontAwesomeIcon icon={faGlobe} className="animate-spin-slow" />
                        <span>{t('craftingExperiences')}</span>
                    </motion.div>
                    
                    <motion.h1
                        variants={textItemVariants}
                        className="text-5xl md:text-8xl font-black text-glow tracking-tight text-gray-900 dark:text-white mb-6 max-w-5xl leading-tight"
                    >
                        {t('heroTitleLine1')} <br className="hidden md:inline"/>{t('heroTitleLine2')}
                    </motion.h1>
                    <motion.p
                        variants={textItemVariants}
                        className="text-base md:text-xl text-gray-500 dark:text-gray-400 mb-6 max-w-2xl leading-relaxed"
                    >
                        {t('heroSubtitle')}
                    </motion.p>

                    {/* Interactive Search Console */}
                    <motion.div
                        variants={textItemVariants}
                        className="w-full max-w-4xl mt-6 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200/55 dark:border-gray-800/50 rounded-3xl p-6 shadow-2xl relative"
                    >
                        {/* Tabs */}
                        <div className="flex space-x-2 border-b border-gray-250/20 dark:border-gray-800/30 pb-4 mb-6">
                            <button
                                onClick={() => { setSearchTab('planner'); setSearchResults(null); }}
                                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
                                    searchTab === 'planner'
                                        ? 'bg-blue-500 text-white shadow-md'
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                            >
                                <FontAwesomeIcon icon={faRoute} />
                                <span>{t('Plan Trip')}</span>
                            </button>
                            <button
                                onClick={() => { setSearchTab('flights'); setSearchResults(null); }}
                                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
                                    searchTab === 'flights'
                                        ? 'bg-blue-500 text-white shadow-md'
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                            >
                                <FontAwesomeIcon icon={faPlane} />
                                <span>{t('searchFlights')}</span>
                            </button>
                            <button
                                onClick={() => { setSearchTab('hotels'); setSearchResults(null); }}
                                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
                                    searchTab === 'hotels'
                                        ? 'bg-blue-500 text-white shadow-md'
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                            >
                                <FontAwesomeIcon icon={faBed} />
                                <span>{t('searchHotels')}</span>
                            </button>
                        </div>

                        {/* Tab Content */}
                        {searchTab === 'planner' && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end text-left">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('destination')}</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Paris, Tokyo, Bali"
                                        value={plannerDest}
                                        onChange={(e) => setPlannerDest(e.target.value)}
                                        className="w-full px-4 py-3 rounded-2xl bg-gray-50/50 dark:bg-gray-950/40 border border-gray-250 dark:border-gray-800/85 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-100"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('duration')}</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="30"
                                        value={plannerDays}
                                        onChange={(e) => setPlannerDays(e.target.value)}
                                        className="w-full px-4 py-3 rounded-2xl bg-gray-50/50 dark:bg-gray-950/40 border border-gray-250 dark:border-gray-800/85 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-100"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('budget')}</label>
                                    <select
                                        value={plannerBudget}
                                        onChange={(e) => setPlannerBudget(e.target.value)}
                                        className="w-full px-4 py-3 rounded-2xl bg-gray-50/50 dark:bg-gray-950/40 border border-gray-250 dark:border-gray-800/85 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-100"
                                    >
                                        <option value="budget">{t('BudgetFriendly')}</option>
                                        <option value="moderate">{t('BudgetModerate')}</option>
                                        <option value="luxury">{t('BudgetLuxury')}</option>
                                    </select>
                                </div>
                                <div>
                                    <button
                                        onClick={handlePlannerSubmit}
                                        disabled={!plannerDest}
                                        className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                                    >
                                        <FontAwesomeIcon icon={faRoute} />
                                        <span>{t('generateItinerary')}</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {searchTab === 'flights' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end text-left">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('from')}</label>
                                        <input
                                            type="text"
                                            value={flightFrom}
                                            onChange={(e) => setFlightFrom(e.target.value)}
                                            className="w-full px-4 py-3 rounded-2xl bg-gray-50/50 dark:bg-gray-950/40 border border-gray-255 dark:border-gray-800/85 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-100"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('to')}</label>
                                        <input
                                            type="text"
                                            value={flightTo}
                                            onChange={(e) => setFlightTo(e.target.value)}
                                            className="w-full px-4 py-3 rounded-2xl bg-gray-50/50 dark:bg-gray-950/40 border border-gray-255 dark:border-gray-800/85 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-100"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('cabinClass')}</label>
                                        <select
                                            value={flightCabin}
                                            onChange={(e) => setFlightCabin(e.target.value)}
                                            className="w-full px-4 py-3 rounded-2xl bg-gray-50/50 dark:bg-gray-950/40 border border-gray-255 dark:border-gray-800/85 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-100"
                                        >
                                            <option value="Economy">Economy</option>
                                            <option value="Premium Economy">Premium Economy</option>
                                            <option value="Business">Business</option>
                                            <option value="First Class">First Class</option>
                                        </select>
                                    </div>
                                    <div>
                                        <button
                                            onClick={handleMockSearch}
                                            disabled={searchLoading}
                                            className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-indigo-650 hover:from-blue-600 hover:to-indigo-750 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
                                        >
                                            <FontAwesomeIcon icon={faSearch} />
                                            <span>{searchLoading ? t('searching') : t('search')}</span>
                                        </button>
                                    </div>
                                </div>

                                {searchLoading && (
                                    <div className="py-8 flex flex-col items-center justify-center space-y-3">
                                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Scanning flight connections...</p>
                                    </div>
                                )}

                                {!searchLoading && searchResults && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-4 pt-4 border-t border-gray-250/20 dark:border-gray-800/30"
                                    >
                                        {searchResults.map((flight, idx) => (
                                            <div key={idx} className="flex flex-col sm:flex-row justify-between items-center bg-white/70 dark:bg-gray-950/40 p-4 rounded-2xl border border-gray-200/50 dark:border-gray-850 gap-4">
                                                <div className="flex items-center space-x-3 text-left">
                                                    <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl">
                                                        <FontAwesomeIcon icon={faPlane} />
                                                    </div>
                                                    <div>
                                                        <p className="font-extrabold text-sm text-gray-900 dark:text-white">{flight.airline}</p>
                                                        <p className="text-[11px] text-gray-400 dark:text-gray-500">{flight.flightNo} • {flightCabin}</p>
                                                    </div>
                                                </div>
                                                <div className="text-center sm:text-left">
                                                    <p className="font-bold text-sm text-gray-800 dark:text-gray-200">{flight.time}</p>
                                                    <p className="text-[11px] text-gray-400 dark:text-gray-500">{flight.duration} • {flight.stops}</p>
                                                </div>
                                                <div className="flex items-center space-x-4">
                                                    <div className="text-right">
                                                        <p className="text-[10px] line-through text-gray-400">${flight.originalPrice}</p>
                                                        <p className="text-lg font-black text-green-600 dark:text-green-400">${flight.price}</p>
                                                    </div>
                                                    <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1">
                                                        <FontAwesomeIcon icon={faCheckCircle} />
                                                        <span>Book</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </div>
                        )}

                        {searchTab === 'hotels' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end text-left">
                                    <div className="space-y-1.5 col-span-1 md:col-span-2">
                                        <label className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('destination')}</label>
                                        <input
                                            type="text"
                                            value={hotelCity}
                                            onChange={(e) => setHotelCity(e.target.value)}
                                            className="w-full px-4 py-3 rounded-2xl bg-gray-50/50 dark:bg-gray-950/40 border border-gray-255 dark:border-gray-800/85 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-100"
                                        />
                                    </div>
                                    <div>
                                        <button
                                            onClick={handleMockSearch}
                                            disabled={searchLoading}
                                            className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-indigo-650 hover:from-blue-600 hover:to-indigo-750 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
                                        >
                                            <FontAwesomeIcon icon={faSearch} />
                                            <span>{searchLoading ? t('searching') : t('search')}</span>
                                        </button>
                                    </div>
                                </div>

                                {searchLoading && (
                                    <div className="py-8 flex flex-col items-center justify-center space-y-3">
                                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Searching available lodging...</p>
                                    </div>
                                )}

                                {!searchLoading && searchResults && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-250/20 dark:border-gray-800/30"
                                    >
                                        {searchResults.map((hotel, idx) => (
                                            <div key={idx} className="flex flex-col bg-white/70 dark:bg-gray-950/40 rounded-2xl border border-gray-200/50 dark:border-gray-850 overflow-hidden text-left shadow-sm">
                                                <div className="h-32 w-full relative">
                                                    <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover" />
                                                    <div className="absolute top-2 right-2 bg-white/95 dark:bg-gray-900/95 text-yellow-500 px-2 py-0.5 rounded-lg text-xs font-bold flex items-center space-x-1">
                                                        <FontAwesomeIcon icon={faStar} size="xs" />
                                                        <span>{hotel.rating}</span>
                                                    </div>
                                                </div>
                                                <div className="p-4 flex flex-col justify-between flex-1 space-y-3">
                                                    <div>
                                                        <p className="font-extrabold text-sm text-gray-900 dark:text-white leading-snug">{hotel.name}</p>
                                                        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 line-clamp-2">{hotel.description}</p>
                                                    </div>
                                                    <div className="flex justify-between items-center pt-2 border-t border-gray-250/20 dark:border-gray-800/40">
                                                        <div>
                                                            <span className="text-[10px] line-through text-gray-400">${hotel.originalPrice}</span>
                                                            <p className="text-sm font-black text-green-600 dark:text-green-400">${hotel.pricePerNight}<span className="text-[10px] text-gray-400 font-normal">/night</span></p>
                                                        </div>
                                                        <button className="px-3.5 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-bold transition-all">Book</button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </div>
                        )}
                    </motion.div>
                </motion.section>
            </AnimatePresence>

            {/* 3D Earth Globe Section */}
            <section className="relative z-10 w-full py-12 md:py-20 flex flex-col items-center justify-center">
                <AnimateOnScroll className="text-center mb-8 px-4">
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white mb-3">{t('interactiveGlobe')}</h2>
                    <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 max-w-xl mx-auto leading-relaxed">
                        {t('globeSubtitle')}
                    </p>
                </AnimateOnScroll>

                {/* 3D Canvas Box */}
                <div className="relative w-full max-w-4xl px-4">
                    <motion.div
                        ref={mountRef}
                        className="relative w-full h-[400px] md:h-[550px] bg-white/20 dark:bg-gray-900/20 rounded-3xl shadow-xl overflow-hidden flex items-center justify-center border border-gray-200/30 dark:border-gray-800/30 backdrop-blur-sm cursor-grab active:cursor-grabbing"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, type: 'spring' }}
                    >
                        {/* Interactive floating control boxes */}
                        <AnimatePresence>
                            {/* Top-Left */}
                            <motion.div
                                key="ctrl-plan"
                                className="absolute top-4 left-4 p-3 bg-white/70 dark:bg-gray-950/70 border border-white/20 dark:border-gray-800/30 text-gray-800 dark:text-white rounded-2xl shadow-lg cursor-pointer flex flex-col items-center justify-center text-center w-20 h-20 backdrop-blur-md"
                                variants={cornerFeatureVariants}
                                whileHover="hover"
                                onClick={() => navigate('/plan')}
                            >
                                <FontAwesomeIcon icon={faPlane} size="lg" className="mb-1 text-blue-500" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">{t('Plan Trip')}</span>
                            </motion.div>

                            {/* Top-Right */}
                            <motion.div
                                key="ctrl-explore"
                                className="absolute top-4 right-4 p-3 bg-white/70 dark:bg-gray-950/70 border border-white/20 dark:border-gray-800/30 text-gray-800 dark:text-white rounded-2xl shadow-lg cursor-pointer flex flex-col items-center justify-center text-center w-20 h-20 backdrop-blur-md"
                                variants={cornerFeatureVariants}
                                whileHover="hover"
                                onClick={() => navigate('/explore')}
                            >
                                <FontAwesomeIcon icon={faCompass} size="lg" className="mb-1 text-green-500" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">{t('Explore')}</span>
                            </motion.div>

                            {/* Bottom-Left */}
                            <motion.div
                                key="ctrl-favorites"
                                className="absolute bottom-4 left-4 p-3 bg-white/70 dark:bg-gray-950/70 border border-white/20 dark:border-gray-800/30 text-gray-800 dark:text-white rounded-2xl shadow-lg cursor-pointer flex flex-col items-center justify-center text-center w-20 h-20 backdrop-blur-md"
                                variants={cornerFeatureVariants}
                                whileHover="hover"
                                onClick={() => navigate('/favorites')}
                            >
                                <FontAwesomeIcon icon={faHeartSolid} size="lg" className="mb-1 text-red-500" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">{t('favorites')}</span>
                            </motion.div>

                            {/* Bottom-Right */}
                            <motion.div
                                key="ctrl-adventures"
                                className="absolute bottom-4 right-4 p-3 bg-white/70 dark:bg-gray-950/70 border border-white/20 dark:border-gray-800/30 text-gray-800 dark:text-white rounded-2xl shadow-lg cursor-pointer flex flex-col items-center justify-center text-center w-20 h-20 backdrop-blur-md"
                                variants={cornerFeatureVariants}
                                whileHover="hover"
                                onClick={handleScrollToFeatured}
                            >
                                <FontAwesomeIcon icon={faMountainSun} size="lg" className="mb-1 text-orange-500" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">{t('adventures')}</span>
                            </motion.div>
                        </AnimatePresence>
                    </motion.div>
                </div>
            </section>

            {/* Exclusive Offers Section */}
            <section className="relative z-10 py-16 max-w-6xl mx-auto px-4 text-center">
                <AnimateOnScroll className="mb-10">
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white mb-3">
                        {t('exclusiveOffers')}
                    </h2>
                    <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 max-w-xl mx-auto leading-relaxed">
                        {t('offersSubtitle')}
                    </p>
                </AnimateOnScroll>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                    <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 backdrop-blur-md border border-purple-500/20 dark:border-purple-500/10 p-6 rounded-3xl flex flex-col justify-between space-y-4 hover:shadow-lg transition-all duration-300">
                        <div className="space-y-2">
                            <span className="px-3 py-1 bg-purple-500 text-white rounded-full text-[10px] font-extrabold uppercase tracking-wider">Flight Special</span>
                            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">Flat 12% OFF on Flights</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Save up to $150 on flight bookings using top credit cards.</p>
                        </div>
                        <div className="flex justify-between items-center border-t border-purple-500/20 pt-4">
                            <div>
                                <span className="text-[10px] text-gray-400 uppercase font-extrabold">PROMO CODE</span>
                                <p className="text-sm font-black text-purple-600 dark:text-purple-400">WGLOWFLIGHT</p>
                            </div>
                            <button onClick={() => { navigator.clipboard.writeText('WGLOWFLIGHT'); }} className="px-3 py-1.5 border border-purple-500/30 text-purple-600 dark:text-purple-400 rounded-xl text-xs font-bold hover:bg-purple-500 hover:text-white transition-all">Copy</button>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-md border border-green-500/20 dark:border-green-500/10 p-6 rounded-3xl flex flex-col justify-between space-y-4 hover:shadow-lg transition-all duration-300">
                        <div className="space-y-2">
                            <span className="px-3 py-1 bg-green-500 text-white rounded-full text-[10px] font-extrabold uppercase tracking-wider">Hotel Deal</span>
                            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">Stay 3 Nights, Pay for 2</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Book handpicked luxury resorts and get the 3rd night free.</p>
                        </div>
                        <div className="flex justify-between items-center border-t border-green-500/20 pt-4">
                            <div>
                                <span className="text-[10px] text-gray-400 uppercase font-extrabold">PROMO CODE</span>
                                <p className="text-sm font-black text-green-600 dark:text-green-400">WGLOWHOTEL</p>
                            </div>
                            <button onClick={() => { navigator.clipboard.writeText('WGLOWHOTEL'); }} className="px-3 py-1.5 border border-green-500/30 text-green-600 dark:text-green-400 rounded-xl text-xs font-bold hover:bg-green-500 hover:text-white transition-all">Copy</button>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-md border border-blue-500/20 dark:border-blue-500/10 p-6 rounded-3xl flex flex-col justify-between space-y-4 hover:shadow-lg transition-all duration-300">
                        <div className="space-y-2">
                            <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-[10px] font-extrabold uppercase tracking-wider">AI Benefit</span>
                            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">Free AI Custom Itinerary</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Generate any itinerary and unlock $30 in activity coupons.</p>
                        </div>
                        <div className="flex justify-between items-center border-t border-blue-500/20 pt-4">
                            <div>
                                <span className="text-[10px] text-gray-400 uppercase font-extrabold">PROMO CODE</span>
                                <p className="text-sm font-black text-blue-600 dark:text-blue-400">WGLOWAI</p>
                            </div>
                            <button onClick={() => { navigator.clipboard.writeText('WGLOWAI'); }} className="px-3 py-1.5 border border-blue-500/30 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold hover:bg-blue-500 hover:text-white transition-all">Copy</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* AI Planning Showcase Section */}
            <AIShowcase />

            {/* Analytics Stats Grid */}
            <div className="max-w-6xl mx-auto px-4 py-16 relative z-10">
                <AnimateOnScroll className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {statsData.map((stat) => (
                        <motion.div
                            key={stat.id}
                            variants={cardVariants}
                            className="relative p-8 bg-white/80 dark:bg-gray-900/50 backdrop-blur-md rounded-3xl border border-gray-200/50 dark:border-gray-800/40 shadow-sm cursor-pointer text-center group"
                            onMouseEnter={() => setHoveredStatCardId(stat.id)}
                            onMouseLeave={() => setHoveredStatCardId(null)}
                            whileHover={{ y: -5, boxShadow: "0 15px 30px rgba(0,0,0,0.1)" }}
                            transition={{ duration: 0.3 }}
                        >
                            <h3 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">{stat.value}</h3>
                            <p className="text-gray-500 dark:text-gray-400 mt-2 font-bold text-sm tracking-wider uppercase">{t(stat.label)}</p>

                            <AnimatePresence>
                                {hoveredStatCardId === stat.id && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute bottom-4 left-4 right-4 p-3 bg-blue-500 text-white rounded-2xl shadow-md text-xs pointer-events-none font-medium"
                                    >
                                        {t(stat.popUpText)}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </AnimateOnScroll>
            </div>

            {/* Featured Adventures Section */}
            <div ref={featuredAdventuresRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
                <AnimateOnScroll className="text-center mb-16">
                    <h2 className="text-4xl md:text-6xl font-black tracking-tight text-gray-900 dark:text-white mb-3">{t('featuredAdventures')}</h2>
                    <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 max-w-xl mx-auto leading-relaxed">
                        {t('featuredAdventuresSubtitle')}
                    </p>
                </AnimateOnScroll>

                <AnimateOnScroll threshold={0.05} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {featuredDestinations.map((dest) => (
                        <motion.div
                            key={dest.id}
                            className="bg-white dark:bg-gray-900/50 border border-gray-200/50 dark:border-gray-800/40 rounded-3xl shadow-md overflow-hidden relative group cursor-pointer"
                            onMouseEnter={() => setHoveredCardId(dest.id)}
                            onMouseLeave={() => setHoveredCardId(null)}
                            whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="relative h-60 w-full overflow-hidden">
                                <img
                                    src={dest.imageUrl}
                                    alt={dest.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                {dest.badge && (
                                    <div className="absolute top-4 left-4 bg-blue-500 text-white px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider shadow-md z-20">
                                        {t(dest.badge)}
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-900/90 border border-white/20 text-gray-800 dark:text-white px-2.5 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 shadow-md z-20">
                                    <FontAwesomeIcon icon={faStar} className="text-yellow-500" />
                                    <span>{dest.rating} ({dest.reviews})</span>
                                </div>

                                {/* Pop-up on Hover inside the image container */}
                                <AnimatePresence>
                                    {hoveredCardId === dest.id && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute inset-0 bg-slate-950/75 backdrop-blur-[3px] flex flex-col justify-center items-center space-y-3 p-4 text-center z-10 pointer-events-none"
                                        >
                                            <div className="text-white font-bold text-sm flex items-center space-x-2">
                                                <span>👥</span>
                                                <span><strong>{dest.happyTravelers.toLocaleString('en-IN')}+</strong> {t('happyTravelers') || 'happy travelers'}</span>
                                            </div>
                                            <div className="text-gray-300 text-xs font-semibold flex items-center space-x-2">
                                                <span>🔖</span>
                                                <span><strong>Tags:</strong> {dest.popularTags.slice(0, 3).join(', ')}</span>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            
                            <div className="p-6 space-y-4">
                                <div>
                                    <h4 className="text-xl font-bold text-gray-900 dark:text-white leading-tight mb-1">{dest.name}</h4>
                                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{dest.location}</p>
                                </div>
                                
                                <div className="flex items-center justify-between pt-4 border-t border-gray-150 dark:border-gray-800/60">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('estStarting')}</span>
                                        <div className="flex items-baseline space-x-1.5">
                                            <span className="text-xs line-through text-gray-400 font-bold">${dest.originalPrice}</span>
                                            <span className="text-xl font-extrabold text-green-600 dark:text-green-400">${dest.price.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            localStorage.setItem('prefilledDest', dest.name);
                                            localStorage.setItem('prefilledBudget', 'moderate');
                                            localStorage.setItem('prefilledDays', 5);
                                            navigate('/plan');
                                        }}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition-colors z-20"
                                    >
                                        {t('Plan Trip')}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimateOnScroll>
            </div>

            <Joyride
                steps={tourSteps}
                run={runTour}
                callback={handleTourCallback}
                continuous
                showSkipButton
                showProgress
                locale={{
                    last: t('onboardingDone'),
                    next: t('onboardingNext'),
                    skip: t('onboardingSkip'),
                }}
                styles={{
                    options: {
                        zIndex: 10000,
                        primaryColor: '#3B82F6',
                    },
                    tooltipContainer: {
                        textAlign: 'left',
                    },
                }}
            />
        </div>
    );
};

// Interactive Real-Time AI Showcase Component with 3D Tilt Card
const AIShowcase = () => {
    const { t } = useTranslation();
    const [step, setStep] = useState(0);
    const [coords, setCoords] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setStep((prev) => (prev + 1) % 4);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const logs = [
        t('log0'),
        t('log1'),
        t('log2'),
        t('log3')
    ];

    const handleMouseMove = (e) => {
        const el = e.currentTarget;
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        setCoords({ x: x * 18, y: -y * 18 }); // 18 degrees tilt
    };

    return (
        <section className="py-20 max-w-6xl mx-auto px-4 relative z-10">
            <div className="text-center mb-12">
                <span className="px-3.5 py-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-bold uppercase tracking-wider">
                    {t('aiEngine')}
                </span>
                <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mt-3">{t('watchAI')}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-lg mx-auto mt-2">{t('watchAISubtitle')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                {/* Left: Terminal Console */}
                <div className="bg-gray-950 p-6 rounded-3xl border border-white/10 shadow-2xl font-mono text-left text-xs space-y-4 min-h-[260px] flex flex-col justify-between">
                    <div>
                        <div className="flex items-center space-x-1.5 mb-4 border-b border-white/10 pb-3">
                            <div className="w-3 h-3 rounded-full bg-red-500 shadow-md shadow-red-500/40" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-md shadow-yellow-500/40" />
                            <div className="w-3 h-3 rounded-full bg-green-500 shadow-md shadow-green-500/40" />
                            <span className="text-[10px] text-gray-500 font-bold ml-2">wanderglow-ai-agent.sh</span>
                        </div>
                        <div className="space-y-3 text-green-400">
                            <p className="text-gray-500">$ run wanderglow-itinerary-generator --destination="Dolomites"</p>
                            {logs.slice(0, step + 1).map((log, idx) => (
                                <motion.p 
                                    key={idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="leading-relaxed"
                                >
                                    {log}
                                </motion.p>
                            ))}
                        </div>
                    </div>
                    {step === 3 && (
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            className="text-blue-400 border-t border-white/5 pt-3 font-semibold"
                        >
                            {t('successPlan')}
                        </motion.div>
                    )}
                </div>

                {/* Right: Immersive Tilt Preview Card */}
                <div className="flex justify-center">
                    <div 
                        onMouseMove={handleMouseMove}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => {
                            setIsHovered(false);
                            setCoords({ x: 0, y: 0 });
                        }}
                        style={isHovered ? {
                            transform: `perspective(1000px) rotateX(${coords.y}deg) rotateY(${coords.x}deg) scale3d(1.03, 1.03, 1.03)`,
                            transition: 'transform 0.08s ease-out'
                        } : {
                            transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
                            transition: 'transform 0.4s ease-out'
                        }}
                        className="w-full max-w-sm bg-white/75 dark:bg-gray-900/50 backdrop-blur-md border border-gray-250 dark:border-gray-800/40 rounded-3xl overflow-hidden shadow-2xl p-5 flex flex-col justify-between h-80 cursor-pointer select-none relative group transition-all duration-300"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-305 pointer-events-none" />
                        <div>
                            <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">
                                <span>{t('day1Trek')}</span>
                                <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full font-extrabold text-[8px]">Dolomites</span>
                            </div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight">{t('secedaRidgeline')}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                                {t('secedaDescription')}
                            </p>
                        </div>

                        <div className="h-28 w-full rounded-2xl overflow-hidden mt-4 relative bg-gray-100 dark:bg-gray-800">
                            <img 
                                src="https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=600&auto=format&fit=crop" 
                                alt="Alpine Peaks"
                                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/10" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LandingPage;
