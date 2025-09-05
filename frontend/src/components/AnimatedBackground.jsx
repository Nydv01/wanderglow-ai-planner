// src/components/AnimatedBackground.jsx
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const AnimatedBackground = ({ theme }) => {
  const mountRef = useRef(null);
  const animationFrameId = useRef(null);

  useEffect(() => {
    let scene, camera, renderer;
    let particles, lines;
    let mouseX = 0, mouseY = 0;
    const particleCount = 200; // Adjusted particle count for a more balanced network
    const particleSize = 0.04; // Slightly smaller particle size for a finer look
    const lineDistance = 7.0; // Increased max distance for lines to form (more lengthy lines)
    const stableLineDistance = 1.2; // Distance for lines to appear more stable
    const maxConnectionsPerParticle = 4; // Limit the number of connections per particle
    const particleSpeed = 0.003; // Slightly slower speed of particle drift
    let velocities = []; // Declare velocities here so it's accessible to init and animate

    // Define colors based on theme
    // Further adjusted light theme colors for even better visibility and contrast
    const lightThemeParticleColor = new THREE.Color(0x87CEEB); // Sky Blue - visible but ethereal
    const lightThemeLineColor = new THREE.Color(0x4682B4);    // Steel Blue - clear for lines
    const darkThemeParticleColor = new THREE.Color(0x93C5FD); // light blue for dark mode
    const darkThemeLineColor = new THREE.Color(0xBFDBFE); // very light blue for dark mode
    const lightThemeBgColor = new THREE.Color(0xF3F4F6); // gray-100
    const darkThemeBgColor = new THREE.Color(0x111827); // gray-900

    if (!mountRef.current) return;

    const init = () => {
      // Scene
      scene = new THREE.Scene();
      scene.background = theme === 'light' ? lightThemeBgColor : darkThemeBgColor;

      // Camera
      camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
      camera.position.z = 5;

      // Renderer
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      mountRef.current.appendChild(renderer.domElement);

      // Particles
      const particleGeometry = new THREE.BufferGeometry();
      const positions = [];
      velocities = []; // Initialize velocities here
      const colors = []; // Store colors for each particle

      // Adjusted initial position range to spread particles more widely
      const initialRange = 16; // Particles will be generated from -8 to 8
      for (let i = 0; i < particleCount; i++) {
        // Random positions within a larger cube
        positions.push(
          (Math.random() * initialRange - initialRange / 2), // x
          (Math.random() * initialRange - initialRange / 2), // y
          (Math.random() * initialRange - initialRange / 2)  // z
        );
        // Random velocities for subtle drift
        velocities.push(
          (Math.random() - 0.5) * particleSpeed,
          (Math.random() - 0.5) * particleSpeed,
          (Math.random() - 0.5) * particleSpeed
        );
        // Initial color (will be updated based on theme)
        colors.push(0, 0, 0); 
      }

      particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      particleGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

      const particleMaterial = new THREE.PointsMaterial({
        size: particleSize,
        vertexColors: true, // Use vertex colors
        blending: THREE.AdditiveBlending, // For a glowing effect
        transparent: true,
        opacity: 0.6, // Adjusted opacity for particles for a more subtle look
        sizeAttenuation: true,
      });

      particles = new THREE.Points(particleGeometry, particleMaterial);
      scene.add(particles);

      // Lines (initially empty, will be updated dynamically)
      const lineGeometry = new THREE.BufferGeometry();
      lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute([], 3));
      lineGeometry.setAttribute('color', new THREE.Float32BufferAttribute([], 3));
      
      const lineMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.5, // Adjusted base opacity for lines for a more subtle look
        linewidth: 1, // Note: linewidth is not widely supported in WebGL, might need a custom shader for consistent width
      });
      lines = new THREE.LineSegments(lineGeometry, lineMaterial);
      scene.add(lines);

      // Event Listeners
      window.addEventListener('resize', onWindowResize);
      mountRef.current.addEventListener('mousemove', onMouseMove);
    };

    const onWindowResize = () => {
      if (mountRef.current) {
        camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      }
    };

    const onMouseMove = (event) => {
      const rect = mountRef.current.getBoundingClientRect();
      const bounds = 8; // Match the new scene bounds
      mouseX = (event.clientX - rect.left) / rect.width * 2 - 1;
      mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);

      const positions = particles.geometry.attributes.position.array;
      const colors = particles.geometry.attributes.color.array;

      const currentLinePositions = [];
      const currentLineColors = [];

      const tempColor = new THREE.Color();

      // Update particle positions and colors
      const bounds = 8; // New bounds for wrapping, matching initial range
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Apply velocity
        positions[i3] += velocities[i3];
        positions[i3 + 1] += velocities[i3 + 1];
        positions[i3 + 2] += velocities[i3 + 2];

        // Wrap particles around the scene bounds (updated to new bounds)
        if (positions[i3] > bounds) positions[i3] = -bounds;
        if (positions[i3] < -bounds) positions[i3] = bounds;
        if (positions[i3 + 1] > bounds) positions[i3 + 1] = -bounds;
        if (positions[i3 + 1] < -bounds) positions[i3 + 1] = bounds;
        if (positions[i3 + 2] > bounds) positions[i3 + 2] = -bounds;
        if (positions[i3 + 2] < -bounds) positions[i3 + 2] = bounds;

        // Update particle color based on theme
        tempColor.set(theme === 'light' ? lightThemeParticleColor : darkThemeParticleColor);
        colors[i3] = tempColor.r;
        colors[i3 + 1] = tempColor.g;
        colors[i3 + 2] = tempColor.b;

        // Mouse interaction: push particles away if mouse is close
        const dx = positions[i3] - mouseX * bounds; 
        const dy = positions[i3 + 1] - mouseY * bounds; 
        const dist = Math.sqrt(dx * dx + dy * dy);
        const repelRadius = 1.0;
        const repelStrength = 0.01;

        if (dist < repelRadius) {
          const force = (repelRadius - dist) / repelRadius * repelStrength;
          positions[i3] += dx / dist * force;
          positions[i3 + 1] += dy / dist * force;
        }
        
        // Track connections for the current particle
        let connectionsMadeByCurrentParticle = 0;

        // Create lines to nearby particles
        for (let j = i + 1; j < particleCount; j++) {
          // If max connections reached for this particle, break
          if (connectionsMadeByCurrentParticle >= maxConnectionsPerParticle) {
            break; 
          }

          const j3 = j * 3;
          const dx = positions[i3] - positions[j3];
          const dy = positions[i3 + 1] - positions[j3 + 1];
          const dz = positions[i3 + 2] - positions[j3 + 2];
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (distance < lineDistance) {
            let finalAlpha;
            if (distance < stableLineDistance) {
              // Lines very close to particles are more stable and less flickering
              finalAlpha = (1 - (distance / stableLineDistance)) * 0.9; // Stronger base alpha for stable lines
            } else {
              // Lines further away flicker more to give a "connecting" feel
              const timeFactor = Date.now() * 0.00005; // Very slow time factor for gentle animation
              const flicker = (Math.sin(timeFactor + i * 0.008) + Math.cos(timeFactor * 1.1 + j * 0.012)) / 2;
              // Allow flicker to go to zero, so lines can truly disappear
              const dynamicVisibility = Math.max(0, flicker); 
              
              const baseAlpha = (1 - (distance / lineDistance)); // Alpha based on distance
              finalAlpha = baseAlpha * dynamicVisibility * 0.5; // Overall opacity control for dynamic lines
            }

            // Only draw if finalAlpha is above a very small threshold to avoid drawing nearly invisible lines
            if (finalAlpha > 0.1) { // Adjusted threshold to show more subtle lines, balancing visibility
                currentLinePositions.push(
                  positions[i3], positions[i3 + 1], positions[i3 + 2],
                  positions[j3], positions[j3 + 1], positions[j3 + 2]
                );

                tempColor.set(theme === 'light' ? lightThemeLineColor : darkThemeLineColor);
                currentLineColors.push(
                  tempColor.r * finalAlpha, tempColor.g * finalAlpha, tempColor.b * finalAlpha,
                  tempColor.r * finalAlpha, tempColor.g * finalAlpha, tempColor.b * finalAlpha
                );
                connectionsMadeByCurrentParticle++; // Increment connection counter
            }
          }
        }
      }

      particles.geometry.attributes.position.needsUpdate = true;
      particles.geometry.attributes.color.needsUpdate = true;

      // Update lines
      lines.geometry.setAttribute('position', new THREE.Float32BufferAttribute(currentLinePositions, 3));
      lines.geometry.setAttribute('color', new THREE.Float32BufferAttribute(currentLineColors, 3));
      lines.geometry.attributes.position.needsUpdate = true;
      lines.geometry.attributes.color.needsUpdate = true;
      lines.geometry.setDrawRange(0, currentLinePositions.length / 3); 

      // Camera animation (subtle rotation)
      camera.position.x = Math.sin(Date.now() * 0.00005) * 0.5;
      camera.position.y = Math.cos(Date.now() * 0.00005) * 0.5;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    init();
    animate();

    // Cleanup function
    return () => {
      cancelAnimationFrame(animationFrameId.current);
      if (mountRef.current && renderer && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      window.removeEventListener('resize', onWindowResize);
      if (scene) {
        scene.traverse((object) => {
          if (object.isMesh || object.isPoints || object.isLineSegments) {
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
    };
  }, [theme]); 

  return (
    <div ref={mountRef} className="fixed inset-0 z-0 overflow-hidden">
    </div>
  );
};

export default AnimatedBackground;
