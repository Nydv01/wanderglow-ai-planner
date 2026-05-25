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
    const particleCount = 220; 
    const particleSize = 0.25; // larger because we use glow texture
    const lineDistance = 7.0; 
    const stableLineDistance = 1.2; 
    const maxConnectionsPerParticle = 4; 
    const particleSpeed = 0.003; 
    let velocities = []; 

    // Sparks declarations
    let sparksGeometry, sparksMaterial, sparksPoints;
    const sparksCount = 180;
    const sparksData = [];
    const lastWorldPos = new THREE.Vector3(0, 0, 0);

    const lightThemeParticleColor = new THREE.Color(0x3b82f6); 
    const lightThemeLineColor = new THREE.Color(0x60a5fa);    
    const darkThemeParticleColor = new THREE.Color(0x60a5fa); 
    const darkThemeLineColor = new THREE.Color(0x1e3a8a); 
    const lightThemeBgColor = new THREE.Color(0xf8fafc); // slate-50
    const darkThemeBgColor = new THREE.Color(0x020617); // slate-950

    if (!mountRef.current) return;

    // Create custom canvas texture for particles
    const createCircleTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
      gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.15)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(canvas);
    };

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

      const circleTexture = createCircleTexture();

      // Particles
      const particleGeometry = new THREE.BufferGeometry();
      const positions = [];
      velocities = []; 
      const colors = []; 

      const initialRange = 16; 
      for (let i = 0; i < particleCount; i++) {
        positions.push(
          (Math.random() * initialRange - initialRange / 2), 
          (Math.random() * initialRange - initialRange / 2), 
          (Math.random() * initialRange - initialRange / 2)  
        );
        velocities.push(
          (Math.random() - 0.5) * particleSpeed,
          (Math.random() - 0.5) * particleSpeed,
          (Math.random() - 0.5) * particleSpeed
        );
        colors.push(0, 0, 0); 
      }

      particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      particleGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

      const particleMaterial = new THREE.PointsMaterial({
        size: particleSize,
        map: circleTexture,
        vertexColors: true, 
        blending: THREE.AdditiveBlending, 
        transparent: true,
        opacity: 0.7, 
        sizeAttenuation: true,
        depthWrite: false
      });

      particles = new THREE.Points(particleGeometry, particleMaterial);
      scene.add(particles);

      // Lines
      const lineGeometry = new THREE.BufferGeometry();
      lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute([], 3));
      lineGeometry.setAttribute('color', new THREE.Float32BufferAttribute([], 3));
      
      const lineMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.35, 
      });
      lines = new THREE.LineSegments(lineGeometry, lineMaterial);
      scene.add(lines);

      // Sparks System Setup
      sparksGeometry = new THREE.BufferGeometry();
      const sparkPositions = new Float32Array(sparksCount * 3);
      const sparkColors = new Float32Array(sparksCount * 3);
      
      sparksGeometry.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));
      sparksGeometry.setAttribute('color', new THREE.BufferAttribute(sparkColors, 3));
      
      sparksMaterial = new THREE.PointsMaterial({
        size: 0.45,
        map: circleTexture,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.9,
        sizeAttenuation: true,
        depthWrite: false
      });
      
      sparksPoints = new THREE.Points(sparksGeometry, sparksMaterial);
      scene.add(sparksPoints);

      // Event Listeners
      window.addEventListener('resize', onWindowResize);
      window.addEventListener('mousemove', onMouseMove);
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
      mouseX = (event.clientX - rect.left) / rect.width * 2 - 1;
      mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Project screen coordinate to z=0 in 3D world coordinates
      const vector = new THREE.Vector3(mouseX, mouseY, 0.5);
      vector.unproject(camera);
      const dir = vector.sub(camera.position).normalize();
      const distance = -camera.position.z / dir.z;
      const worldPos = camera.position.clone().add(dir.multiplyScalar(distance));
      
      const speed = worldPos.distanceTo(lastWorldPos);
      lastWorldPos.copy(worldPos);

      // Spawn sparks proportionally to speed of cursor motion
      const spawnCount = Math.min(8, Math.max(2, Math.floor(speed * 25) + 1));
      const isDark = theme !== 'light';

      for (let k = 0; k < spawnCount; k++) {
        let spark;
        if (sparksData.length < sparksCount) {
          spark = {};
          sparksData.push(spark);
        } else {
          // Overwrite the oldest active spark
          spark = sparksData.reduce((oldest, current) => current.age / current.maxAge > oldest.age / oldest.maxAge ? current : oldest, sparksData[0]);
        }
        
        spark.x = worldPos.x + (Math.random() - 0.5) * 0.25;
        spark.y = worldPos.y + (Math.random() - 0.5) * 0.25;
        spark.z = (Math.random() - 0.5) * 0.4;
        
        // Random radial velocity vector
        const angle = Math.random() * Math.PI * 2;
        const speedVal = 0.01 + Math.random() * 0.04;
        spark.vx = Math.cos(angle) * speedVal + (Math.random() - 0.5) * 0.005;
        spark.vy = Math.sin(angle) * speedVal + (Math.random() - 0.5) * 0.005;
        spark.vz = (Math.random() - 0.5) * 0.015;
        
        // Dynamic futuristic generative palette: Indigo, Violet, Cyan, Magenta
        const colorSeed = Math.random();
        if (colorSeed < 0.35) {
          spark.color = new THREE.Color(isDark ? 0x06b6d4 : 0x0ea5e9); // Cyan / Ocean Blue
        } else if (colorSeed < 0.7) {
          spark.color = new THREE.Color(isDark ? 0xa855f7 : 0x7c3aed); // Purple / Violet
        } else {
          spark.color = new THREE.Color(isDark ? 0xec4899 : 0xdb2777); // Magenta / Pink
        }
        
        spark.age = 0;
        spark.maxAge = 35 + Math.random() * 45; // lifetime range
      }
    };

    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);

      const positions = particles.geometry.attributes.position.array;
      const colors = particles.geometry.attributes.color.array;

      const currentLinePositions = [];
      const currentLineColors = [];
      const tempColor = new THREE.Color();
      const bounds = 8; 

      // Update background particles
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        positions[i3] += velocities[i3];
        positions[i3 + 1] += velocities[i3 + 1];
        positions[i3 + 2] += velocities[i3 + 2];

        // Bounds wrapping
        if (positions[i3] > bounds) positions[i3] = -bounds;
        if (positions[i3] < -bounds) positions[i3] = bounds;
        if (positions[i3 + 1] > bounds) positions[i3 + 1] = -bounds;
        if (positions[i3 + 1] < -bounds) positions[i3 + 1] = bounds;
        if (positions[i3 + 2] > bounds) positions[i3 + 2] = -bounds;
        if (positions[i3 + 2] < -bounds) positions[i3 + 2] = bounds;

        // Dynamic mouse warp & repulsion
        const dx = positions[i3] - lastWorldPos.x; 
        const dy = positions[i3 + 1] - lastWorldPos.y; 
        const dz = positions[i3 + 2] - lastWorldPos.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const repelRadius = 2.2;
        const repelStrength = 0.06;

        if (dist < repelRadius) {
          const force = (repelRadius - dist) / repelRadius * repelStrength;
          positions[i3] += dx / dist * force;
          positions[i3 + 1] += dy / dist * force;
          positions[i3 + 2] += dz / dist * force;
        }

        // Apply theme color
        tempColor.set(theme === 'light' ? lightThemeParticleColor : darkThemeParticleColor);
        colors[i3] = tempColor.r;
        colors[i3 + 1] = tempColor.g;
        colors[i3 + 2] = tempColor.b;
        
        let connectionsMade = 0;

        // Calculate line connections
        for (let j = i + 1; j < particleCount; j++) {
          if (connectionsMade >= maxConnectionsPerParticle) break; 

          const j3 = j * 3;
          const lx = positions[i3] - positions[j3];
          const ly = positions[i3 + 1] - positions[j3 + 1];
          const lz = positions[i3 + 2] - positions[j3 + 2];
          const lDist = Math.sqrt(lx * lx + ly * ly + lz * lz);

          if (lDist < lineDistance) {
            let alpha;
            if (lDist < stableLineDistance) {
              alpha = (1 - (lDist / stableLineDistance)) * 0.9;
            } else {
              const timeFactor = Date.now() * 0.00005;
              const flicker = (Math.sin(timeFactor + i * 0.008) + Math.cos(timeFactor * 1.1 + j * 0.012)) / 2;
              alpha = (1 - (lDist / lineDistance)) * Math.max(0, flicker) * 0.55; 
            }

            if (alpha > 0.08) {
              currentLinePositions.push(
                positions[i3], positions[i3 + 1], positions[i3 + 2],
                positions[j3], positions[j3 + 1], positions[j3 + 2]
              );

              tempColor.set(theme === 'light' ? lightThemeLineColor : darkThemeLineColor);
              currentLineColors.push(
                tempColor.r * alpha, tempColor.g * alpha, tempColor.b * alpha,
                tempColor.r * alpha, tempColor.g * alpha, tempColor.b * alpha
              );
              connectionsMade++;
            }
          }
        }
      }

      particles.geometry.attributes.position.needsUpdate = true;
      particles.geometry.attributes.color.needsUpdate = true;

      // Update lines BufferGeometry
      lines.geometry.setAttribute('position', new THREE.Float32BufferAttribute(currentLinePositions, 3));
      lines.geometry.setAttribute('color', new THREE.Float32BufferAttribute(currentLineColors, 3));
      lines.geometry.attributes.position.needsUpdate = true;
      lines.geometry.attributes.color.needsUpdate = true;
      lines.geometry.setDrawRange(0, currentLinePositions.length / 3); 

      // Update active mouse sparks
      const sparkPositions = sparksGeometry.attributes.position.array;
      const sparkColors = sparksGeometry.attributes.color.array;
      
      for (let i = 0; i < sparksCount; i++) {
        const i3 = i * 3;
        const spark = sparksData[i];
        
        if (spark && spark.age < spark.maxAge) {
          spark.x += spark.vx;
          spark.y += spark.vy;
          spark.z += spark.vz;
          spark.age += 1;
          
          sparkPositions[i3] = spark.x;
          sparkPositions[i3 + 1] = spark.y;
          sparkPositions[i3 + 2] = spark.z;
          
          const fade = 1.0 - (spark.age / spark.maxAge);
          sparkColors[i3] = spark.color.r * fade;
          sparkColors[i3 + 1] = spark.color.g * fade;
          sparkColors[i3 + 2] = spark.color.b * fade;
        } else {
          sparkPositions[i3] = 9999;
          sparkPositions[i3 + 1] = 9999;
          sparkPositions[i3 + 2] = 9999;
          sparkColors[i3] = 0;
          sparkColors[i3 + 1] = 0;
          sparkColors[i3 + 2] = 0;
        }
      }
      sparksGeometry.attributes.position.needsUpdate = true;
      sparksGeometry.attributes.color.needsUpdate = true;

      // Subtle dynamic camera orbit
      camera.position.x = Math.sin(Date.now() * 0.00003) * 0.6;
      camera.position.y = Math.cos(Date.now() * 0.00003) * 0.6;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    init();
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId.current);
      if (mountRef.current && renderer && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      window.removeEventListener('resize', onWindowResize);
      window.removeEventListener('mousemove', onMouseMove);
      if (scene) {
        scene.traverse((object) => {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(m => m.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
      }
      if (renderer) renderer.dispose();
    };
  }, [theme]); 

  return (
    <div ref={mountRef} className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
    </div>
  );
};

export default AnimatedBackground;
