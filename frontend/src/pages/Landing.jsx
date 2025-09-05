// src/pages/Landing.jsx

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faMapMarkedAlt, faHandshake, faRupeeSign, faUsers, faHeart, faTag, faPlane, faCompass, faHeart as faHeartSolid, faMountainSun } from '@fortawesome/free-solid-svg-icons'; // Changed faCommentDots to faMountainSun for Featured Adventures
import Joyride from 'react-joyride';
import { useTranslation } from 'react-i18next';
import * as THREE from 'three'; 
import AnimatedBackground from '../components/AnimatedBackground'; // Import the new component

// Utility for scroll-triggered animations
const AnimateOnScroll = ({ children, variants = { hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0 } }, threshold = 0.2, ...rest }) => {
    const [ref, inView] = useInView({ triggerOnce: true, threshold });
    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={variants}
            transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
            {...rest}
        >
            {children}
        </motion.div>
    );
};

// Image URL from "Patagonia's Glaciers & Mountains"
const patagoniaImageUrl = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070&auto=format&fit=crop";

// Expanded list of featured destinations with new hover-specific data and more items
const featuredDestinations = [
    { id: 1, name: "Majestic Peaks of the Dolomites, Italy", location: "Dolomites, Italy", price: 12000, rating: 4.9, imageUrl: patagoniaImageUrl, happyTravelers: 40000, popularTags: ['Mountains', 'Hiking', 'Scenic'] },
    { id: 2, name: "Serene Alpine Hikes in Banff, Canada", location: "Banff, Canada", price: 15500, rating: 4.8, imageUrl: patagoniaImageUrl, happyTravelers: 35000, popularTags: ['Nature', 'Lakes', 'Wildlife'] },
    { id: 3, name: "Explore the Scottish Highlands", location: "Scottish Highlands, UK", price: 9500, rating: 4.7, imageUrl: patagoniaImageUrl, happyTravelers: 25000, popularTags: ['History', 'Castles', 'Wilderness'] },
    { id: 4, name: "Patagonia's Glaciers & Mountains", location: "Patagonia, Argentina", price: 28000, rating: 4.9, imageUrl: patagoniaImageUrl, happyTravelers: 30000, popularTags: ['Glaciers', 'Trekking', 'Stunning Views'] },
    { id: 5, name: "New Zealand's Southern Alps", location: "South Island, NZ", price: 32000, rating: 5.0, imageUrl: patagoniaImageUrl, happyTravelers: 45000, popularTags: ['Adventure Sports', 'Lord of the Rings', 'Lakes'] },
    { id: 6, name: "Swiss Alps Scenic Journey", location: "Swiss Alps, Switzerland", price: 25000, rating: 4.9, imageUrl: patagoniaImageUrl, happyTravelers: 55000, popularTags: ['Skiing', 'Luxury', 'Panoramic Views'] },
];

// Data for the stats section with pop-up text
const statsData = [
    { id: 'happyTravelers', value: '50K+', label: 'Happy Travelers', popUpText: 'Join our growing community of satisfied adventurers!' },
    { id: 'destinations', value: '200+', label: 'Destinations', popUpText: 'Explore a world of possibilities tailored just for you!' },
    { id: 'satisfaction', value: '98%', label: 'Satisfaction', popUpText: 'Your happiness is our top priority. Travel with confidence!' },
];

const LandingPage = ({ runTour, handleTourCallback, theme }) => { // Ensure theme is passed as a prop
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [hoveredCardId, setHoveredCardId] = useState(null);
    const [hoveredStatCardId, setHoveredStatCardId] = useState(null);
    const [hoveredCorner, setHoveredCorner] = useState(null); // State for corner feature hover

    // Ref for the 3D canvas
    const mountRef = useRef(null);
    // Ref for the Featured Adventures section
    const featuredAdventuresRef = useRef(null);

    useEffect(() => {
        // --- Three.js Setup for Cartoon Robot Head ---
        let scene, camera, renderer, robotHeadGroup;
        let tvScreenMesh, tvFrameMesh, tvBaseMesh;
        let antennaLeft, antennaRight;
        let sideHandleLeft, sideHandleRight;
        let eyeLeft, eyeRight; // The black outer eyes
        let pupilLeft, pupilRight; // The white pupils
        let mouthMesh; // The main curved smile
        let underEyeCurveLeft, underEyeCurveRight; // The new upward semicircles under the eyes

        let mouseX = 0, mouseY = 0;
        let targetX = 0, targetY = 0;
        let animationFrameId;
        const clock = new THREE.Clock();

        if (!mountRef.current) return;

        const init = () => {
            // Scene setup
            scene = new THREE.Scene();
            // Background color matching the image's purple
            const backgroundColor = theme === 'light' ? 0xADD8E6 : 0x1A2B3C; // LightBlue for light, custom dark blue for dark
            scene.background = new THREE.Color(backgroundColor);
            scene.fog = new THREE.Fog(backgroundColor, 5, 10); // Subtle fog for depth


            // Camera
            camera = new THREE.PerspectiveCamera(50, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
            camera.position.set(0, 0.5, 3.0); // Position to focus on the head
            camera.lookAt(0, 0, 0); // Look at the center of the head

            // Renderer
            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
            renderer.shadowMap.enabled = true; // Enable shadows for more realism
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            mountRef.current.appendChild(renderer.domElement);

            // Robot Head Group - all head parts will be added to this group
            robotHeadGroup = new THREE.Group();
            robotHeadGroup.position.y = 0; // Center the head vertically
            scene.add(robotHeadGroup);

            // Materials
            const screenMaterial = new THREE.MeshStandardMaterial({ 
                color: 0xffff00, // Yellow for the screen
                metalness: 0.1, 
                roughness: 0.5 
            });
            const frameMaterial = new THREE.MeshStandardMaterial({ 
                color: 0x696969, // DimGray for the frame and base
                metalness: 0.5, 
                roughness: 0.5 
            });
            const eyeMaterial = new THREE.MeshStandardMaterial({
                color: 0x000000, // Black for the outer eye
                metalness: 0.1,
                roughness: 0.8
            });
            const pupilMaterial = new THREE.MeshStandardMaterial({ 
                color: 0xffffff, // White for the pupil
                emissive: 0xffffff, 
                emissiveIntensity: 0.5 // Subtle glow for pupils
            });
            const mouthMaterial = new THREE.LineBasicMaterial({
                color: 0x000000, // Black for the mouth line
                linewidth: 5 // Thicker line
            });

            // --- HEAD CONSTRUCTION (TV-shaped) ---

            // TV Screen (main face)
            const tvScreenGeometry = new THREE.BoxGeometry(1.5, 1.0, 0.1);
            tvScreenMesh = new THREE.Mesh(tvScreenGeometry, screenMaterial);
            tvScreenMesh.position.z = 0.05; // Slightly forward
            robotHeadGroup.add(tvScreenMesh);
            tvScreenMesh.castShadow = true;
            tvScreenMesh.receiveShadow = true;

            // TV Frame (around the screen)
            const frameThickness = 0.1;
            const tvFrameShape = new THREE.Shape();
            tvFrameShape.moveTo(-0.75, 0.5);
            tvFrameShape.lineTo(0.75, 0.5);
            tvFrameShape.lineTo(0.75, -0.5);
            tvFrameShape.lineTo(-0.75, -0.5);
            tvFrameShape.lineTo(-0.75, 0.5);

            const holePath = new THREE.Path();
            holePath.moveTo(-0.75 + frameThickness, 0.5 - frameThickness);
            holePath.lineTo(0.75 - frameThickness, 0.5 - frameThickness);
            holePath.lineTo(0.75 - frameThickness, -0.5 + frameThickness);
            holePath.lineTo(-0.75 + frameThickness, -0.5 + frameThickness);
            holePath.lineTo(-0.75 + frameThickness, 0.5 - frameThickness);
            tvFrameShape.holes.push(holePath);

            const tvFrameExtrudeSettings = {
                steps: 1,
                depth: 0.1,
                bevelEnabled: false
            };
            const tvFrameGeometry = new THREE.ExtrudeGeometry(tvFrameShape, tvFrameExtrudeSettings);
            tvFrameMesh = new THREE.Mesh(tvFrameGeometry, frameMaterial);
            tvFrameMesh.position.z = 0; // Behind the screen
            robotHeadGroup.add(tvFrameMesh);
            tvFrameMesh.castShadow = true;
            tvFrameMesh.receiveShadow = true;

            // TV Base
            const tvBaseGeometry = new THREE.BoxGeometry(0.8, 0.2, 0.15);
            tvBaseMesh = new THREE.Mesh(tvBaseGeometry, frameMaterial);
            tvBaseMesh.position.y = -0.6;
            tvBaseMesh.position.z = 0.025; // Slightly forward
            robotHeadGroup.add(tvBaseMesh);
            tvBaseMesh.castShadow = true;
            tvBaseMesh.receiveShadow = true;

            // Antennas
            const antennaGeometry = new THREE.BoxGeometry(0.1, 0.4, 0.1); // Rectangular antennas
            antennaLeft = new THREE.Mesh(antennaGeometry, frameMaterial);
            antennaLeft.position.set(-0.5, 0.7, 0);
            antennaLeft.rotation.z = Math.PI / 8; // Tilt left
            robotHeadGroup.add(antennaLeft);
            antennaLeft.castShadow = true;

            antennaRight = new THREE.Mesh(antennaGeometry, frameMaterial);
            antennaRight.position.set(0.5, 0.7, 0);
            antennaRight.rotation.z = -Math.PI / 8; // Tilt right
            robotHeadGroup.add(antennaRight);
            antennaRight.castShadow = true;

            // Side Handles/Ears
            const sideHandleGeometry = new THREE.BoxGeometry(0.15, 0.4, 0.1);
            sideHandleLeft = new THREE.Mesh(sideHandleGeometry, frameMaterial);
            sideHandleLeft.position.set(-0.8, 0, 0);
            robotHeadGroup.add(sideHandleLeft);
            sideHandleLeft.castShadow = true;

            sideHandleRight = new THREE.Mesh(sideHandleGeometry, frameMaterial);
            sideHandleRight.position.set(0.8, 0, 0);
            robotHeadGroup.add(sideHandleRight);
            sideHandleRight.castShadow = true;

            // Eyes (Black outer, white pupils)
            const eyeOuterGeometry = new THREE.SphereGeometry(0.15, 32, 32); // Larger, rounder eyes
            eyeLeft = new THREE.Mesh(eyeOuterGeometry, eyeMaterial);
            eyeLeft.position.set(-0.3, 0.1, 0.1); // Position on screen
            eyeLeft.rotation.z = -Math.PI / 12; // Tilt eyes
            tvScreenMesh.add(eyeLeft); // Add to screen mesh
            eyeLeft.castShadow = true;

            eyeRight = new THREE.Mesh(eyeOuterGeometry, eyeMaterial);
            eyeRight.position.set(0.3, 0.1, 0.1); // Position on screen
            eyeRight.rotation.z = Math.PI / 12; // Tilt eyes
            tvScreenMesh.add(eyeRight); // Add to screen mesh
            eyeRight.castShadow = true;

            // Pupils (White, smaller, inside black eyes)
            const pupilGeometry = new THREE.SphereGeometry(0.08, 32, 32);
            pupilLeft = new THREE.Mesh(pupilGeometry, pupilMaterial);
            pupilLeft.position.set(0, 0, 0.08); // Relative to eyeLeft
            eyeLeft.add(pupilLeft);

            pupilRight = new THREE.Mesh(pupilGeometry, pupilMaterial);
            pupilRight.position.set(0, 0, 0.08); // Relative to eyeRight
            eyeRight.add(pupilRight);

            // Mouth (Curved line - now happy!)
            const mouthCurve = new THREE.QuadraticBezierCurve3(
                new THREE.Vector3(-0.25, -0.05, 0.1), // Start point (wider and lower for a clear upward curve)
                new THREE.Vector3(0, -0.1, 0.3),   // Control point (significantly higher for a very happy smile)
                new THREE.Vector3(0.25, -0.05, 0.1)  // End point (wider and lower for a clear upward curve)
            );
            const mouthPoints = mouthCurve.getPoints(50);
            const mouthGeometry = new THREE.BufferGeometry().setFromPoints(mouthPoints);
            mouthMesh = new THREE.Line(mouthGeometry, mouthMaterial);
            mouthMesh.position.set(0, -0.2, 0.08); // Position on screen
            tvScreenMesh.add(mouthMesh); // Add to screen mesh

            // Under-eye upward semicircles (using QuadraticBezierCurve3 for better control)
            const underEyeLineMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 3 }); // Black line for consistency

            // Left under-eye curve
            const underEyeCurveLeftPoints = new THREE.QuadraticBezierCurve3(
                new THREE.Vector3(-0.1, -0.1, 0.08), // Start point relative to eyeLeft's center
                new THREE.Vector3(0, -0.05, 0.08),   // Control point (higher Y for upward curve)
                new THREE.Vector3(0.1, -0.1, 0.08)   // End point relative to eyeLeft's center
            ).getPoints(32);
            const underEyeCurveLeftGeometry = new THREE.BufferGeometry().setFromPoints(underEyeCurveLeftPoints);
            underEyeCurveLeft = new THREE.Line(underEyeCurveLeftGeometry, underEyeLineMaterial);
            eyeLeft.add(underEyeCurveLeft); // Add to eyeLeft group so it moves with the eye

            // Right under-eye curve
            const underEyeCurveRightPoints = new THREE.QuadraticBezierCurve3(
                new THREE.Vector3(-0.1, -0.1, 0.08), // Start point relative to eyeRight's center
                new THREE.Vector3(0, -0.05, 0.08),   // Control point (higher Y for upward curve)
                new THREE.Vector3(0.1, -0.1, 0.08)   // End point relative to eyeRight's center
            ).getPoints(32);
            const underEyeCurveRightGeometry = new THREE.BufferGeometry().setFromPoints(underEyeCurveRightPoints);
            underEyeCurveRight = new THREE.Line(underEyeCurveRightGeometry, underEyeLineMaterial);
            eyeRight.add(underEyeCurveRight); // Add to eyeRight group so it moves with the eye


            // --- LIGHTING SETUP ---
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.7); // General ambient light
            scene.add(ambientLight);

            // Main directional light for highlights and shadows
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(3, 5, 3);
            directionalLight.castShadow = true;
            directionalLight.shadow.mapSize.width = 1024;
            directionalLight.shadow.mapSize.height = 1024;
            directionalLight.shadow.camera.near = 0.5;
            directionalLight.shadow.camera.far = 10;
            directionalLight.shadow.camera.left = -5;
            directionalLight.shadow.camera.right = 5;
            directionalLight.shadow.camera.top = 5;
            directionalLight.shadow.camera.bottom = -5;
            scene.add(directionalLight);

            // Soft back light to enhance form and create a subtle rim glow
            const backLight = new THREE.DirectionalLight(0xffffff, 0.4);
            backLight.position.set(-3, -2, -3);
            scene.add(backLight);

            // Ground plane for shadows (visible for realism, even if just the head)
            const planeGeometry = new THREE.PlaneGeometry(10, 10);
            const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xd3d3d3, roughness: 0.8, metalness: 0.1 });
            const plane = new THREE.Mesh(planeGeometry, planeMaterial);
            plane.rotation.x = -Math.PI / 2;
            plane.position.y = -1.0; // Position below the robot head
            plane.receiveShadow = true;
            scene.add(plane);


            // Event Listeners
            mountRef.current.addEventListener('mousemove', onDocumentMouseMove);
            window.addEventListener('resize', onWindowResize);

            animate();
        };

        const onDocumentMouseMove = (event) => {
            const rect = mountRef.current.getBoundingClientRect();
            // Normalize mouse coordinates to -1 to +1 range relative to the canvas
            mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1; // Invert Y for typical 3D rotation
        };

        const onWindowResize = () => {
            if (mountRef.current) {
                camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
            }
        };

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);

            // Smoothly interpolate towards the target mouse position for overall robot head rotation
            targetX += (mouseX - targetX) * 0.05; 
            targetY += (mouseY - targetY) * 0.05; 

            const time = clock.getElapsedTime();

            if (robotHeadGroup) { 
                // Overall head movement (rotation and subtle floating)
                // Head rotates TOWARDS the cursor
                robotHeadGroup.rotation.y = targetX * 0.2; 
                robotHeadGroup.rotation.x = targetY * 0.15;
                robotHeadGroup.position.y = Math.sin(time * 0.8) * 0.05; // Gentle up and down motion for 'breathing' effect

                // Eye tracking (eyes move within the head)
                if (pupilLeft && pupilRight) { 
                    pupilLeft.position.x = targetX * 0.05; // Pupils move within their black outer eyes
                    pupilLeft.position.y = targetY * 0.05;
                    pupilRight.position.x = targetX * 0.05;
                    pupilRight.position.y = targetY * 0.05;

                    // Subtle pupil glow pulse
                    const pupilGlowIntensity = 0.5 + Math.sin(time * 4) * 0.1; 
                    if (pupilLeft.material) pupilLeft.material.emissiveIntensity = pupilGlowIntensity;
                    if (pupilRight.material) pupilRight.material.emissiveIntensity = pupilGlowIntensity;
                }

                // Mouth pulse (subtle animation)
                if (mouthMesh) { 
                    mouthMesh.scale.y = 1 + Math.sin(time * 3) * 0.02; // Subtle vertical stretch
                }
            }

            renderer.render(scene, camera);
        };

        init();

        // Cleanup function - very important for Three.js to prevent memory leaks
        return () => {
            console.log("Cleaning up Three.js resources...");
            cancelAnimationFrame(animationFrameId);
            if (mountRef.current && renderer && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }
            window.removeEventListener('resize', onWindowResize);
            
            if (scene) {
                scene.traverse((object) => {
                    if (object.isMesh) {
                        if (object.geometry) object.geometry.dispose();
                        if (object.material) {
                            if (Array.isArray(object.material)) {
                                object.material.forEach(material => material.dispose());
                            } else {
                                object.material.dispose();
                            }
                        }
                    }
                });
            }
            if (renderer) renderer.dispose();
            console.log("Three.js resources disposed.");
        };
    }, []); // Empty dependency array means this runs once on mount and cleans up on unmount

    // Joyride tour steps (assuming you have i18n setup for 't' function)
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

    // Framer Motion variants
    const heroVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 80,
                damping: 10,
                staggerChildren: 0.2,
            },
        },
    };

    const textItemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100 } },
    };

    const cornerFeatureVariants = {
        hidden: { opacity: 0, scale: 0.8, x: 0, y: 0 },
        visible: { opacity: 1, scale: 1, x: 0, y: 0, transition: { type: "spring", stiffness: 200, damping: 20 } },
        hover: { scale: 1.1, boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.4)" }
    };

    const handleScrollToFeatured = () => {
        if (featuredAdventuresRef.current) {
            featuredAdventuresRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-500 overflow-x-hidden">
            {/* Animated Background Component */}
            <AnimatedBackground theme={theme} />

            {/* Hero Section */}
            <AnimatePresence>
                <motion.section
                    key="hero-section" // Added unique key
                    variants={heroVariants}
                    initial="hidden"
                    animate="visible"
                    className="relative z-10 flex flex-col items-center justify-center pt-32 pb-24 md:pt-48 md:pb-32 text-center"
                >
                    <motion.h1
                        variants={textItemVariants}
                        className="text-5xl md:text-7xl font-extrabold text-ocean-blue-deep dark:text-ocean-blue-light mb-4 max-w-4xl leading-tight"
                    >
                        Your Dream Trip Starts Here
                    </motion.h1>
                    <motion.p
                        variants={textItemVariants}
                        className="text-lg md:text-2xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl"
                    >
                        Discover incredible destinations, plan perfect itineraries, and create unforgettable memories with our AI-powered travel companion.
                    </motion.p>
                    <motion.div
                        variants={textItemVariants}
                        className="flex flex-wrap justify-center gap-4"
                    >
                        <motion.button
                            onClick={() => navigate('/plan')}
                            className="px-8 py-4 bg-ocean-blue-deep text-white rounded-full shadow-lg hover:bg-ocean-blue-light transition-colors font-semibold tour-start-button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Plan Your Trip
                        </motion.button>
                        <motion.button
                            onClick={() => navigate('/explore')}
                            className="px-8 py-4 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full shadow-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors font-semibold"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Explore Destinations
                        </motion.button>
                    </motion.div>
                </motion.section>
            </AnimatePresence>

            {/* 3D Robot Guide Section */}
            <section className="relative z-10 w-full py-16 md:py-24 bg-gradient-to-b from-gray-100 to-white dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center">
                <AnimateOnScroll className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-ocean-blue-deep dark:text-ocean-blue-light mb-4">Meet Your AI Travel Guide</h2>
                    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Interact with our intelligent robot guide who helps you plan every step of your journey.
                    </p>
                </AnimateOnScroll>
                <motion.div
                    ref={mountRef}
                    className="relative w-full max-w-4xl h-96 md:h-[600px] bg-gray-200 dark:bg-gray-700 rounded-2xl shadow-xl overflow-hidden flex items-center justify-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.5, type: 'spring', stiffness: 100 }}
                >
                    {/* Three.js canvas will be appended here */}

                    {/* Corner Features */}
                    <AnimatePresence>
                        {/* Top-Left */}
                        <motion.div
                            key="topLeft" // Added unique key
                            className="absolute top-4 left-4 p-4 bg-blue-500 text-white rounded-lg shadow-lg cursor-pointer flex flex-col items-center justify-center text-center w-24 h-24"
                            variants={cornerFeatureVariants}
                            initial="hidden"
                            animate={hoveredCorner === 'topLeft' ? "visible" : "hidden"}
                            whileHover="hover"
                            onMouseEnter={() => setHoveredCorner('topLeft')}
                            onMouseLeave={() => setHoveredCorner(null)}
                            onClick={() => navigate('/plan')}
                        >
                            <FontAwesomeIcon icon={faPlane} size="2x" className="mb-2" />
                            <span className="text-sm font-semibold">{t('Plan Trip')}</span>
                        </motion.div>

                        {/* Top-Right */}
                        <motion.div
                            key="topRight" // Added unique key
                            className="absolute top-4 right-4 p-4 bg-green-500 text-white rounded-lg shadow-lg cursor-pointer flex flex-col items-center justify-center text-center w-24 h-24"
                            variants={cornerFeatureVariants}
                            initial="hidden"
                            animate={hoveredCorner === 'topRight' ? "visible" : "hidden"}
                            whileHover="hover"
                            onMouseEnter={() => setHoveredCorner('topRight')}
                            onMouseLeave={() => setHoveredCorner(null)}
                            onClick={() => navigate('/explore')}
                        >
                            <FontAwesomeIcon icon={faCompass} size="2x" className="mb-2" />
                            <span className="text-sm font-semibold">{t('Explore')}</span>
                        </motion.div>

                        {/* Bottom-Left - Changed to Favorite Page */}
                        <motion.div
                            key="bottomLeft" // Added unique key
                            className="absolute bottom-4 left-4 p-4 bg-purple-500 text-white rounded-lg shadow-lg cursor-pointer flex flex-col items-center justify-center text-center w-24 h-24"
                            variants={cornerFeatureVariants}
                            initial="hidden"
                            animate={hoveredCorner === 'bottomLeft' ? "visible" : "hidden"}
                            whileHover="hover"
                            onMouseEnter={() => setHoveredCorner('bottomLeft')}
                            onMouseLeave={() => setHoveredCorner(null)}
                            onClick={() => navigate('/favorites')} // Navigate to a favorites page
                        >
                            <FontAwesomeIcon icon={faHeartSolid} size="2x" className="mb-2" /> {/* Changed icon to solid heart */}
                            <span className="text-sm font-semibold">{t('Favorite Page')}</span> {/* Changed text */}
                        </motion.div>

                        {/* Bottom-Right - Changed to Featured Adventures Scroll */}
                        <motion.div
                            key="bottomRight" // Added unique key
                            className="absolute bottom-4 right-4 p-4 bg-orange-500 text-white rounded-lg shadow-lg cursor-pointer flex flex-col items-center justify-center text-center w-24 h-24"
                            variants={cornerFeatureVariants}
                            initial="hidden"
                            animate={hoveredCorner === 'bottomRight' ? "visible" : "hidden"}
                            whileHover="hover"
                            onMouseEnter={() => setHoveredCorner('bottomRight')}
                            onMouseLeave={() => setHoveredCorner(null)}
                            onClick={handleScrollToFeatured} // Scroll to the new section
                        >
                            <FontAwesomeIcon icon={faMountainSun} size="2x" className="mb-2" /> {/* New icon for adventures */}
                            <span className="text-sm font-semibold">{t('Featured Adventures')}</span> {/* New text */}
                        </motion.div>
                    </AnimatePresence>

                </motion.div>
                <motion.div 
                    className="mt-8 text-center text-gray-600 dark:text-gray-400 space-y-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                >
                    <p className="text-lg">🤖 Your personal travel assistant is ready!</p>
                </motion.div>
            </section>

            {/* Stats Section with Hover Pop-ups */}
            <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 relative z-10">
                <AnimateOnScroll className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    {statsData.map((stat) => (
                        <motion.div
                            key={stat.id}
                            variants={cardVariants}
                            className="relative p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg group cursor-pointer"
                            onMouseEnter={() => setHoveredStatCardId(stat.id)}
                            onMouseLeave={() => setHoveredStatCardId(null)}
                            whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}
                            transition={{ duration: 0.3 }}
                        >
                            <motion.h3 className="text-5xl font-extrabold text-ocean-blue-deep dark:text-ocean-blue-light">{stat.value}</motion.h3>
                            <motion.p className="text-gray-600 dark:text-gray-400 mt-2">{stat.label}</motion.p>

                            <AnimatePresence>
                                {hoveredStatCardId === stat.id && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute bottom-4 left-4 right-4 p-3 bg-blue-500 text-white rounded-lg shadow-md text-sm pointer-events-none"
                                    >
                                        {t(stat.popUpText)}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </AnimateOnScroll>
            </div>

            {/* Featured Adventures Section - Moved here and added ref */}
            <div ref={featuredAdventuresRef} className="max-w-6xl mx-auto px-4 py-16 md:py-24 relative z-10">
                <AnimateOnScroll className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-ocean-blue-deep dark:text-ocean-blue-light mb-4">Featured Adventures</h2>
                    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Discover handpicked destinations and experiences crafted for every type of traveler.
                    </p>
                </AnimateOnScroll>

                <AnimateOnScroll threshold={0.1} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {featuredDestinations.map((dest, index) => (
                        <motion.div
                            key={dest.id}
                            className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden group cursor-pointer"
                            onMouseEnter={() => setHoveredCardId(dest.id)}
                            onMouseLeave={() => setHoveredCardId(null)}
                            whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="relative h-56 w-full">
                                <img
                                    src={dest.imageUrl}
                                    alt={dest.name}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-25 group-hover:bg-opacity-40 transition-all duration-300" />
                            </div>
                            <div className="p-6">
                                <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">{dest.name}</h4>
                                <p className="text-gray-600 dark:text-gray-400 flex items-center mb-2">
                                    <FontAwesomeIcon icon={faMapMarkedAlt} className="mr-2" />
                                    {dest.location}
                                </p>
                                <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                                    <div className="flex items-center font-bold text-green-600 dark:text-green-400">
                                        <FontAwesomeIcon icon={faRupeeSign} className="mr-1" />
                                        {dest.price.toLocaleString('en-IN')}
                                    </div>
                                </div>
                            </div>

                            {/* Pop-up on Hover */}
                            <AnimatePresence>
                                {hoveredCardId === dest.id && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute bottom-4 left-4 right-4 p-4 bg-white dark:bg-gray-700 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600"
                                    >
                                        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
                                            <li className="flex items-center">
                                                <FontAwesomeIcon icon={faUsers} className="text-blue-500 mr-2" />
                                                <span className="font-bold">{dest.happyTravelers.toLocaleString('en-IN')}+</span> {t('happyTravelers')}
                                            </li>
                                            <li className="flex items-center">
                                                <FontAwesomeIcon icon={faHeart} className="text-red-500 mr-2" />
                                                <span className="font-bold">{dest.rating}</span> {t('rating')}
                                            </li>
                                            <li className="flex items-center">
                                                <FontAwesomeIcon icon={faTag} className="text-green-500 mr-2" />
                                                <span className="font-bold">{t('tags')}:</span> {dest.popularTags.map(tag => t(tag)).join(', ')}
                                            </li>
                                        </ul>
                                    </motion.div>
                                )}
                            </AnimatePresence>
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

export default LandingPage;
