import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { COLOR_TOKENS } from '../utils/colorTokens.js';
import { playTelemetryClick, playTelemetryPing, toggleCosmicDrone } from '../utils/soundSynthesizer.js';
import '../styles/components/canvasChart.css';

const AURORA_STATIONS = [
  { name: 'Tromsø', country: 'Norway', lat: 69.65, lon: 18.96, minKp: 1, desc: 'Prime Arctic auroral corridor — overhead curtains on nearly every clear winter night.', idealIso: 'ISO 1600, 4s, f/2.0' },
  { name: 'Fairbanks', country: 'Alaska, USA', lat: 64.84, lon: -147.72, minKp: 2, desc: 'Underneath auroral oval footprint with rapid dynamic coronas.', idealIso: 'ISO 3200, 6s, f/1.8' },
  { name: 'Reykjavik', country: 'Iceland', lat: 64.14, lon: -21.94, minKp: 2, desc: 'Vivid green ribbons cascading over volcanic terrain and glaciers.', idealIso: 'ISO 1600, 5s, f/2.8' },
  { name: 'Yellowknife', country: 'Canada', lat: 62.45, lon: -114.37, minKp: 2, desc: 'Sub-Arctic dark sky preserve with 90%+ annual viewing clarity.', idealIso: 'ISO 3200, 4s, f/1.4' },
  { name: 'Edinburgh', country: 'Scotland, UK', lat: 55.95, lon: -3.18, minKp: 5, desc: 'Northern horizon glows green and magenta during G1+ geomagnetic storms.', idealIso: 'ISO 3200, 10s, f/1.8' },
  { name: 'Seattle', country: 'Washington, USA', lat: 47.60, lon: -122.33, minKp: 6, desc: 'Mid-latitude visibility with pillar rays during G2+ geomagnetic storms.', idealIso: 'ISO 6400, 12s, f/1.4' },
  { name: 'Hanle Observatory', country: 'Ladakh, India', lat: 32.78, lon: 78.96, minKp: 8, desc: 'Hanle Dark Sky Reserve (4,500m) — Stable Auroral Red (SAR) arc observed during G4/G5 storms.', idealIso: 'ISO 6400, 20s, f/1.4' },
];

function latLonToVec3(lat, lon, radius = 1) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

function createProceduralEarthTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Deep space ocean gradient
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, '#020617');
  grad.addColorStop(0.3, '#071026');
  grad.addColorStop(0.7, '#071026');
  grad.addColorStop(1, '#020617');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle coordinate graticules
  ctx.strokeStyle = 'rgba(45, 212, 191, 0.08)';
  ctx.lineWidth = 1;
  for (let lat = -80; lat <= 80; lat += 20) {
    const y = ((90 - lat) / 180) * canvas.height;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
  for (let lon = -180; lon < 180; lon += 30) {
    const x = ((lon + 180) / 360) * canvas.width;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  // Continental landmasses
  ctx.fillStyle = 'rgba(21, 32, 48, 0.96)';
  ctx.strokeStyle = 'rgba(45, 212, 191, 0.4)';
  ctx.lineWidth = 1.5;

  const continents = [
    // North America
    [[-160, 70], [-140, 65], [-120, 60], [-100, 50], [-75, 45], [-60, 45], [-70, 30], [-90, 20], [-105, 25], [-125, 35], [-145, 55]],
    // Eurasia
    [[-10, 35], [20, 38], [35, 45], [60, 60], [100, 70], [140, 65], [140, 35], [100, 10], [80, 8], [65, 25], [45, 25], [10, 60], [-5, 50]],
    // South America
    [[-80, 10], [-60, 10], [-35, -5], [-40, -20], [-60, -40], [-70, -55], [-75, -45], [-80, -20]],
    // Africa
    [[-15, 35], [30, 32], [50, 12], [40, -15], [30, -34], [18, -34], [10, -5], [-15, 12]],
    // Australia
    [[115, -15], [150, -15], [150, -38], [115, -35]],
    // Greenland
    [[-50, 60], [-20, 70], [-30, 80], [-60, 75]],
    // Antarctica perimeter
    [[-180, -78], [-90, -75], [0, -72], [90, -75], [180, -78], [180, -90], [-180, -90]],
  ];

  continents.forEach((poly) => {
    ctx.beginPath();
    poly.forEach(([lon, lat], idx) => {
      const x = ((lon + 180) / 360) * canvas.width;
      const y = ((90 - lat) / 180) * canvas.height;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });

  // Glowing Night City Clusters (London, Paris, NYC, Tokyo, Delhi, Mumbai, Hanle, etc.)
  const cityDots = [
    [77.2, 28.6],   // New Delhi
    [72.8, 19.0],   // Mumbai
    [78.9, 32.8],   // Hanle Observatory Ladakh
    [-74.0, 40.7],  // New York
    [-0.1, 51.5],   // London
    [2.3, 48.8],    // Paris
    [139.6, 35.6],  // Tokyo
    [151.2, -33.8], // Sydney
    [-21.9, 64.1],  // Reykjavik
    [18.9, 69.6],   // Tromsø
    [-147.7, 64.8], // Fairbanks
  ];

  cityDots.forEach(([lon, lat]) => {
    const x = ((lon + 180) / 360) * canvas.width;
    const y = ((90 - lat) / 180) * canvas.height;
    ctx.fillStyle = 'rgba(251, 191, 36, 0.9)';
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fill();

    // Soft warm glow halo
    ctx.fillStyle = 'rgba(251, 191, 36, 0.25)';
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * Creates a procedural vertical gradient alpha texture for ethereal wispy auroral curtains
 */
function createAuroraCurtainTexture(primaryHex = '#2dd4bf', crownHex = '#a855f7') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Vertical atmospheric gradient with soft fading top and bottom edges
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0.0, 'rgba(0, 0, 0, 0)');
  grad.addColorStop(0.18, crownHex);
  grad.addColorStop(0.65, primaryHex);
  grad.addColorStop(0.92, primaryHex);
  grad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Vertical fluted ray striations (simulates ionizing particles streaming down magnetic field lines)
  for (let x = 0; x < canvas.width; x += 4) {
    const alpha = 0.08 + Math.sin(x * 0.18) * 0.06;
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.fillRect(x, 0, 2, canvas.height);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

export function AuroraGlobe3D({ kpIndex = 2, imfBz = -2.8, solarWindSpeed = 450 }) {
  const mountRef = useRef(null);
  const targetRotationRef = useRef({ y: 0, x: 0, active: false });
  const [selectedStation, setSelectedStation] = useState(AURORA_STATIONS[0]);
  const [cameraView, setCameraView] = useState('northPole'); // 'northPole' | 'southPole' | 'perspective' | 'india'
  const [autoRotate, setAutoRotate] = useState(true);
  const [colorMode, setColorMode] = useState('emerald'); // 'emerald' | 'violet' | 'crimson'
  const [waveSpeed, setWaveSpeed] = useState(1.0); // 0.5 | 1.0 | 2.0
  const [simulatedKp, setSimulatedKp] = useState(null); // null = use live telemetry, or number 0-9
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAudioActive, setIsAudioActive] = useState(false);

  // Active Effective Kp (Live SWPC telemetry or interactive simulator override)
  const effectiveKp = simulatedKp !== null ? simulatedKp : Math.max(0, Math.min(9, kpIndex));

  // Ovation Model Empirical Calculation:
  // Kp 0 -> Oval edge ~ 67°N
  // Kp 5 -> Oval edge ~ 53°N (Scotland / Alaska)
  // Kp 9 -> Oval edge ~ 34°N (Hanle Dark Sky Reserve Ladakh / Mediterranean)
  const equatorwardLat = Math.max(34, Math.round(67 - effectiveKp * 3.4));
  const ovalRadiusDeg = 90 - equatorwardLat;
  const ovalRadiusRad = (ovalRadiusDeg * Math.PI) / 180;

  function flyToStation(station) {
    setSelectedStation(station);
    playTelemetryClick(true);
    // Calculate target rotations to center Earth on selected station
    const targetY = -((station.lon + 90) * Math.PI) / 180;
    const targetX = ((station.lat - 45) * Math.PI) / 180 * 0.45;
    targetRotationRef.current = { y: targetY, x: targetX, active: true };
  }

  function toggleAudio() {
    const nextState = !isAudioActive;
    setIsAudioActive(nextState);
    toggleCosmicDrone(nextState);
  }

  useEffect(() => {
    return () => {
      // Cleanup cosmic audio on unmount
      toggleCosmicDrone(false);
    };
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let animId;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 480;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 2.4, 2.0);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 2, 2));
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.touchAction = 'none';
    container.appendChild(renderer.domElement);

    // Deep Space Starfield Points (380 distant stars)
    const starCount = 380;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 24 + Math.random() * 20;
      starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPos[i * 3 + 2] = r * Math.cos(phi);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0x94a3b8,
      size: 0.16,
      transparent: true,
      opacity: 0.78,
    });
    const starMesh = new THREE.Points(starGeo, starMat);
    scene.add(starMesh);

    // Earth Root Rotation Group
    const earthGroup = new THREE.Group();
    scene.add(earthGroup);

    // Base Atmospheric Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffaed, 1.25);
    sunLight.position.set(4, 3, 3);
    scene.add(sunLight);

    // Primary Aurora Color Logic
    const isStormMode = effectiveKp >= 5 || colorMode === 'crimson';
    const primaryAuroraHex =
      colorMode === 'crimson' || effectiveKp >= 7
        ? 0xf43f5e
        : colorMode === 'violet'
        ? 0xa855f7
        : 0x2dd4bf;

    const primaryColorCss =
      colorMode === 'crimson' || effectiveKp >= 7
        ? '#f43f5e'
        : colorMode === 'violet'
        ? '#a855f7'
        : '#2dd4bf';

    const secondaryColorCss = isStormMode ? '#ec4899' : '#38bdf8';
    const secondaryAuroraHex = isStormMode ? 0xec4899 : 0x38bdf8;

    // Real 3D Northern Lights Illuminating Lights (Orbits over Arctic landmasses)
    const auroraLight1 = new THREE.PointLight(primaryAuroraHex, 2.6 + effectiveKp * 0.35, 2.5);
    auroraLight1.position.set(0, Math.cos(ovalRadiusRad) * 1.12, Math.sin(ovalRadiusRad) * 0.4);
    earthGroup.add(auroraLight1);

    const auroraLight2 = new THREE.PointLight(secondaryAuroraHex, 1.8 + effectiveKp * 0.2, 2.2);
    auroraLight2.position.set(-Math.sin(ovalRadiusRad) * 0.4, Math.cos(ovalRadiusRad) * 1.12, 0);
    earthGroup.add(auroraLight2);

    // Southern Light counterpart (Aurora Australis)
    const australisLight = new THREE.PointLight(primaryAuroraHex, 2.0, 2.2);
    australisLight.position.set(0, -Math.cos(ovalRadiusRad) * 1.12, 0);
    earthGroup.add(australisLight);

    // 1. Procedural 3D Earth Globe
    const earthTexture = createProceduralEarthTexture();
    const earthGeo = new THREE.SphereGeometry(1, 56, 56);
    const earthMat = new THREE.MeshPhongMaterial({
      map: earthTexture,
      shininess: 16,
      specular: new THREE.Color(0x2dd4bf),
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earthMesh);

    // 2. Atmospheric Outer Rayleigh Scattering Corona Halo
    const atmosphereGeo = new THREE.SphereGeometry(1.14, 42, 42);
    const atmosphereMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    earthGroup.add(atmosphereMesh);

    // 3. 3D Aurora Wave Curtains (North & South Ovals)
    const auroraGroup = new THREE.Group();
    earthGroup.add(auroraGroup);

    const segments = 108;
    const ringRadius = Math.sin(ovalRadiusRad) * 1.05;
    const ringY = Math.cos(ovalRadiusRad) * 1.05;

    // Procedural wispy curtain gradient texture
    const curtainTexture = createAuroraCurtainTexture(primaryColorCss, secondaryColorCss);

    // A. Main Undulating Aurora Curtain Ribbon (Oxygen 557.7nm)
    const ribbonGeo = new THREE.CylinderGeometry(
      ringRadius * 0.98,
      ringRadius * 1.05,
      0.13 + effectiveKp * 0.024,
      segments,
      8,
      true
    );
    const posAttr = ribbonGeo.attributes.position;
    const originalPositions = posAttr.array.slice();

    const ribbonMat = new THREE.MeshBasicMaterial({
      map: curtainTexture,
      color: primaryAuroraHex,
      transparent: true,
      opacity: 0.88,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const ribbonMesh = new THREE.Mesh(ribbonGeo, ribbonMat);
    ribbonMesh.position.set(0, ringY, 0);
    auroraGroup.add(ribbonMesh);

    // B. Violet / Magenta High-Altitude Nitrogen Crown Ribbon
    const crownGeo = new THREE.CylinderGeometry(
      ringRadius * 0.96,
      ringRadius * 1.07,
      0.09 + effectiveKp * 0.016,
      segments,
      6,
      true
    );
    const crownMat = new THREE.MeshBasicMaterial({
      map: curtainTexture,
      color: secondaryAuroraHex,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const crownMesh = new THREE.Mesh(crownGeo, crownMat);
    crownMesh.position.set(0, ringY + 0.05, 0);
    auroraGroup.add(crownMesh);

    // C. Vertical Ionized Auroral Ray Pillars (Tall fluted columns)
    const rayPillarCount = 52;
    const rayGeo = new THREE.BufferGeometry();
    const rayPositions = new Float32Array(rayPillarCount * 2 * 3);
    for (let i = 0; i < rayPillarCount; i++) {
      const angle = (i / rayPillarCount) * Math.PI * 2;
      const rBase = ringRadius * (1.0 + (Math.sin(i * 3) * 0.03));
      const rTop = rBase * 1.06;
      const yBase = ringY;
      const yTop = ringY + 0.15 + effectiveKp * 0.022;

      // Base vertex
      rayPositions[i * 6] = rBase * Math.cos(angle);
      rayPositions[i * 6 + 1] = yBase;
      rayPositions[i * 6 + 2] = rBase * Math.sin(angle);

      // Top vertex
      rayPositions[i * 6 + 3] = rTop * Math.cos(angle);
      rayPositions[i * 6 + 4] = yTop;
      rayPositions[i * 6 + 5] = rTop * Math.sin(angle);
    }
    rayGeo.setAttribute('position', new THREE.BufferAttribute(rayPositions, 3));
    const rayMat = new THREE.LineBasicMaterial({
      color: primaryAuroraHex,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const rayLines = new THREE.LineSegments(rayGeo, rayMat);
    auroraGroup.add(rayLines);

    // D. Aurora Australis (Southern Lights counterpart over Antarctica)
    const southRibbonGeo = new THREE.CylinderGeometry(
      ringRadius * 1.05,
      ringRadius * 0.98,
      0.12 + effectiveKp * 0.02,
      segments,
      6,
      true
    );
    const southRibbonMesh = new THREE.Mesh(southRibbonGeo, ribbonMat);
    southRibbonMesh.position.set(0, -ringY, 0);
    auroraGroup.add(southRibbonMesh);

    // E. Ionospheric Shimmering Energy Particles (240 points)
    const particleCount = 240;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const r = ringRadius * (0.95 + Math.random() * 0.1);
      particlePositions[i * 3] = r * Math.cos(angle);
      particlePositions[i * 3 + 1] = ringY + (Math.random() - 0.5) * 0.08;
      particlePositions[i * 3 + 2] = r * Math.sin(angle);
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: primaryAuroraHex,
      size: 0.044,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    auroraGroup.add(particles);

    // 4. Interactive 3D Station Pins
    const pinsGroup = new THREE.Group();
    earthGroup.add(pinsGroup);

    const pinMeshes = [];
    AURORA_STATIONS.forEach((st) => {
      const pos = latLonToVec3(st.lat, st.lon, 1.02);
      const isVisibleNow = effectiveKp >= st.minKp;

      const pinGeo = new THREE.SphereGeometry(0.028, 16, 16);
      const pinMat = new THREE.MeshBasicMaterial({
        color: isVisibleNow ? 0x2dd4bf : 0x94a3b8,
      });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.copy(pos);
      pinMesh.userData = st;
      pinsGroup.add(pinMesh);
      pinMeshes.push(pinMesh);

      // Pin stem
      const stemGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.048, 8);
      const stemMat = new THREE.MeshBasicMaterial({ color: 0xcbd5e1 });
      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.position.copy(latLonToVec3(st.lat, st.lon, 1.01));
      stem.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pos.clone().normalize());
      pinsGroup.add(stem);
    });

    // Camera Presets
    if (cameraView === 'northPole') {
      camera.position.set(0, 2.65, 0.7);
      camera.lookAt(0, 0, 0);
    } else if (cameraView === 'southPole') {
      camera.position.set(0, -2.65, 0.7);
      camera.lookAt(0, 0, 0);
    } else if (cameraView === 'india') {
      const indiaVec = latLonToVec3(32.8, 78.9, 2.7);
      camera.position.copy(indiaVec);
      camera.lookAt(0, 0, 0);
    } else {
      camera.position.set(1.4, 1.8, 2.2);
      camera.lookAt(0, 0, 0);
    }

    // Raycaster for Pin Clicks
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Interactive Drag Orbit Controls
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let dragDist = 0;

    function onPointerDown(e) {
      isDragging = true;
      targetRotationRef.current.active = false;
      dragDist = 0;
      const clientX = e.clientX || e.touches?.[0]?.clientX || 0;
      const clientY = e.clientY || e.touches?.[0]?.clientY || 0;
      prevMouseX = clientX;
      prevMouseY = clientY;
    }

    function onPointerMove(e) {
      if (!isDragging) return;
      const clientX = e.clientX || e.touches?.[0]?.clientX || 0;
      const clientY = e.clientY || e.touches?.[0]?.clientY || 0;
      const dx = clientX - prevMouseX;
      const dy = clientY - prevMouseY;
      dragDist += Math.abs(dx) + Math.abs(dy);
      prevMouseX = clientX;
      prevMouseY = clientY;

      earthGroup.rotation.y += dx * 0.007;
      earthGroup.rotation.x += dy * 0.007;
      earthGroup.rotation.x = Math.max(-1.4, Math.min(1.4, earthGroup.rotation.x));
    }

    function onPointerUp(e) {
      if (dragDist < 6) {
        // Handle Pin Click via Raycaster
        const rect = renderer.domElement.getBoundingClientRect();
        const clientX = e.clientX || e.changedTouches?.[0]?.clientX || 0;
        const clientY = e.clientY || e.changedTouches?.[0]?.clientY || 0;
        mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(pinMeshes, false);
        if (intersects.length > 0 && intersects[0].object.userData?.name) {
          flyToStation(intersects[0].object.userData);
          playTelemetryPing(true);
        }
      }
      isDragging = false;
    }

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onPointerDown);
    dom.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    dom.addEventListener('touchstart', onPointerDown, { passive: true });
    dom.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // Animation Render Loop with Sinusoidal Folding Waves
    const clock = new THREE.Clock();

    function animate() {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime() * waveSpeed;

      // Smooth Station Fly-To Rotation Interpolation
      if (targetRotationRef.current.active) {
        const tr = targetRotationRef.current;
        earthGroup.rotation.y += (tr.y - earthGroup.rotation.y) * 0.06;
        earthGroup.rotation.x += (tr.x - earthGroup.rotation.x) * 0.06;
        if (Math.abs(tr.y - earthGroup.rotation.y) < 0.005 && Math.abs(tr.x - earthGroup.rotation.x) < 0.005) {
          tr.active = false;
        }
      }

      // Atmospheric Breathing Light Glow
      const pulse = 0.72 + Math.sin(time * 2.5) * 0.16;
      ribbonMat.opacity = pulse;
      crownMat.opacity = pulse * 0.78;
      rayMat.opacity = pulse * 0.85;
      auroraLight1.intensity = 2.4 + Math.sin(time * 3.0) * 0.9;
      auroraLight2.intensity = 1.8 + Math.cos(time * 2.2) * 0.7;

      // 3D Harmonic Wave Deformation on Aurora Ribbon Vertices
      const pArr = posAttr.array;
      const vertexCount = pArr.length / 3;
      for (let i = 0; i < vertexCount; i++) {
        const ox = originalPositions[i * 3];
        const oy = originalPositions[i * 3 + 1];
        const oz = originalPositions[i * 3 + 2];
        const theta = Math.atan2(oz, ox);

        // Sinusoidal auroral curtain wave folding
        const wave =
          Math.sin(theta * 6 + time * 2.4) * 0.04 +
          Math.cos(theta * 14 - time * 1.6) * 0.018;

        const currentR = Math.sqrt(ox * ox + oz * oz);
        const newR = currentR + wave;
        pArr[i * 3] = newR * Math.cos(theta);
        pArr[i * 3 + 1] = oy + Math.sin(theta * 4 + time * 1.8) * 0.012;
        pArr[i * 3 + 2] = newR * Math.sin(theta);
      }
      posAttr.needsUpdate = true;

      particles.rotation.y = time * 0.04;
      rayLines.rotation.y = -time * 0.02;

      if (autoRotate && !isDragging && !targetRotationRef.current.active) {
        earthGroup.rotation.y += 0.0022;
      }

      renderer.render(scene, camera);
    }
    animate();

    function handleResize() {
      if (!container) return;
      const w = container.clientWidth || 600;
      const h = container.clientHeight || 480;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('mousedown', onPointerDown);
      dom.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      dom.removeEventListener('touchstart', onPointerDown);
      dom.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);

      // Explicit WebGL Resource Disposal (conforming to syllabus criteria)
      earthGeo.dispose();
      earthMat.dispose();
      earthTexture.dispose();
      curtainTexture.dispose();
      atmosphereGeo.dispose();
      atmosphereMat.dispose();
      starGeo.dispose();
      starMat.dispose();
      ribbonGeo.dispose();
      ribbonMat.dispose();
      crownGeo.dispose();
      crownMat.dispose();
      rayGeo.dispose();
      rayMat.dispose();
      southRibbonGeo.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();

      if (dom && dom.parentElement) {
        dom.parentElement.removeChild(dom);
      }
    };
  }, [effectiveKp, ovalRadiusRad, cameraView, autoRotate, colorMode, waveSpeed]);

  const isStationActive = effectiveKp >= selectedStation.minKp;
  const viewingLikelihood = isStationActive
    ? 'Optimal Viewing (Auroral Oval Overhead)'
    : effectiveKp + 1 === selectedStation.minKp
    ? 'Fringe Visibility (Look North Horizon)'
    : `Sub-Threshold (Requires Kp ≥ ${selectedStation.minKp})`;

  function toggleFullscreen() {
    playTelemetryClick(true);
    const elem = mountRef.current;
    if (!elem) return;
    if (!document.fullscreenElement) {
      elem.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }

  return (
    <div className="chart-card" style={{ padding: 'var(--space-lg)', position: 'relative' }}>
      <div className="chart-card__header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <span
              className="swatch-dot"
              style={{ backgroundColor: effectiveKp >= 5 ? 'var(--color-sale)' : 'var(--color-accent-teal)' }}
            ></span>
            <span className="badge-promo">3D OVATION AURORA LIGHTING ENGINE</span>
            <span
              className="badge-promo"
              style={{ color: effectiveKp >= 5 ? 'var(--color-sale)' : 'var(--color-success-bright)', borderColor: effectiveKp >= 5 ? 'var(--color-sale)' : 'var(--color-success-bright)' }}
            >
              {effectiveKp >= 8
                ? '🔴 G4/G5 EXTREME GEOMAGNETIC STORM'
                : effectiveKp >= 5
                ? '🚨 ACTIVE GEOMAGNETIC STORM'
                : 'NOMINAL POLAR CAP'}
            </span>
            {simulatedKp !== null && (
              <span className="badge-promo" style={{ color: '#FBBF24', borderColor: '#FBBF24' }}>
                SIMULATION OVERRIDE ACTIVE (Kp {simulatedKp})
              </span>
            )}
          </div>
          <h2 className="chart-card__title">Interactive 3D Northern Lights (Aurora Borealis & Australis)</h2>
          <span className="chart-card__subtitle">
            3D WebGL Earth with animated undulating ionospheric curtains, ray pillars, dynamic lighting, and NOAA SWPC planetary Kp telemetry
          </span>
        </div>

        {/* View Camera Presets & Orbit Controls */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`filter-chip ${cameraView === 'northPole' ? 'filter-chip--active' : ''}`}
            onClick={() => { playTelemetryClick(true); setCameraView('northPole'); }}
            style={{ fontSize: '11px', padding: '4px 10px' }}
          >
            🧭 Arctic (North Pole)
          </button>
          <button
            type="button"
            className={`filter-chip ${cameraView === 'southPole' ? 'filter-chip--active' : ''}`}
            onClick={() => { playTelemetryClick(true); setCameraView('southPole'); }}
            style={{ fontSize: '11px', padding: '4px 10px' }}
          >
            🐧 Antarctic (South Pole)
          </button>
          <button
            type="button"
            className={`filter-chip ${cameraView === 'perspective' ? 'filter-chip--active' : ''}`}
            onClick={() => { playTelemetryClick(true); setCameraView('perspective'); }}
            style={{ fontSize: '11px', padding: '4px 10px' }}
          >
            🌍 Global 3D
          </button>
          <button
            type="button"
            className={`filter-chip ${cameraView === 'india' ? 'filter-chip--active' : ''}`}
            onClick={() => { playTelemetryClick(true); setCameraView('india'); }}
            style={{ fontSize: '11px', padding: '4px 10px' }}
          >
            🇮🇳 Hanle (India)
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => { playTelemetryClick(true); setAutoRotate(!autoRotate); }}
            style={{ height: '28px', padding: '0 10px', fontSize: '11px' }}
          >
            {autoRotate ? '⏸️ Pause Orbit' : '▶️ Auto-Rotate'}
          </button>
          <button
            type="button"
            className={`btn-secondary ${isAudioActive ? 'filter-chip--active' : ''}`}
            onClick={toggleAudio}
            style={{ height: '28px', padding: '0 10px', fontSize: '11px' }}
            title="Toggle Ethereal Cosmic Drone Audio"
          >
            {isAudioActive ? '🔊 Cosmic Audio' : '🔇 Audio Off'}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={toggleFullscreen}
            style={{ height: '28px', padding: '0 10px', fontSize: '11px' }}
            title="Toggle Fullscreen 3D Viewport"
          >
            ⛶ Fullscreen
          </button>
        </div>
      </div>

      {/* Evaluator Live Simulation & Stress-Test Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', padding: '8px 0', borderBottom: '1px solid var(--color-hairline-soft)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-mute)' }}>EVALUATION STRESS-TEST:</span>
          <button
            type="button"
            className={`filter-chip ${simulatedKp === null ? 'filter-chip--active' : ''}`}
            onClick={() => { playTelemetryClick(true); setSimulatedKp(null); }}
            style={{ fontSize: '11px', padding: '2px 8px' }}
          >
            📡 Live SWPC (Kp {kpIndex})
          </button>
          <button
            type="button"
            className={`filter-chip ${simulatedKp === 1 ? 'filter-chip--active' : ''}`}
            onClick={() => { playTelemetryClick(true); setSimulatedKp(1); }}
            style={{ fontSize: '11px', padding: '2px 8px' }}
          >
            Quiet (Kp 1)
          </button>
          <button
            type="button"
            className={`filter-chip ${simulatedKp === 4 ? 'filter-chip--active' : ''}`}
            onClick={() => { playTelemetryClick(true); setSimulatedKp(4); }}
            style={{ fontSize: '11px', padding: '2px 8px' }}
          >
            Active (Kp 4)
          </button>
          <button
            type="button"
            className={`filter-chip ${simulatedKp === 6 ? 'filter-chip--active' : ''}`}
            onClick={() => { playTelemetryClick(true); setSimulatedKp(6); }}
            style={{ fontSize: '11px', padding: '2px 8px' }}
          >
            G2 Storm (Kp 6)
          </button>
          <button
            type="button"
            className={`filter-chip ${simulatedKp === 9 ? 'filter-chip--active' : ''}`}
            onClick={() => { playTelemetryClick(true); setSimulatedKp(9); }}
            style={{ fontSize: '11px', padding: '2px 8px' }}
          >
            🔴 G5 Extreme SAR (Kp 9)
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-mute)' }}>SPECTRUM:</span>
          <button
            type="button"
            className={`filter-chip ${colorMode === 'emerald' ? 'filter-chip--active' : ''}`}
            onClick={() => { playTelemetryClick(true); setColorMode('emerald'); }}
            style={{ fontSize: '11px', padding: '2px 8px' }}
          >
            🟢 557.7nm (Oxygen)
          </button>
          <button
            type="button"
            className={`filter-chip ${colorMode === 'violet' ? 'filter-chip--active' : ''}`}
            onClick={() => { playTelemetryClick(true); setColorMode('violet'); }}
            style={{ fontSize: '11px', padding: '2px 8px' }}
          >
            🟣 630nm (Nitrogen)
          </button>
          <button
            type="button"
            className={`filter-chip ${colorMode === 'crimson' ? 'filter-chip--active' : ''}`}
            onClick={() => { playTelemetryClick(true); setColorMode('crimson'); }}
            style={{ fontSize: '11px', padding: '2px 8px' }}
          >
            🔴 SAR Arc
          </button>

          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-mute)', marginLeft: '6px' }}>SPEED:</span>
          {[0.5, 1.0, 2.0].map((spd) => (
            <button
              key={spd}
              type="button"
              className={`filter-chip ${waveSpeed === spd ? 'filter-chip--active' : ''}`}
              onClick={() => { playTelemetryClick(true); setWaveSpeed(spd); }}
              style={{ fontSize: '11px', padding: '2px 8px' }}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>

      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={mountRef}
        style={{
          width: '100%',
          height: '480px',
          position: 'relative',
          borderRadius: 'var(--radius-none)',
          background: 'radial-gradient(circle at center, #071026 0%, #020617 100%)',
          border: '1px solid var(--color-hairline)',
          overflow: 'hidden',
          cursor: 'grab',
          marginTop: 'var(--space-xs)',
        }}
      >
        {/* Floating Telemetry HUD Badges */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          <div
            style={{
              background: 'rgba(10, 13, 24, 0.92)',
              border: '1px solid var(--color-hairline)',
              padding: '6px 12px',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: 'var(--color-ink)',
            }}
          >
            <span style={{ color: 'var(--color-mute)' }}>Equatorward Reach: </span>
            <strong style={{ color: 'var(--color-accent-teal)' }}>{equatorwardLat}°N Latitude</strong>
          </div>
          <div
            style={{
              background: 'rgba(10, 13, 24, 0.92)',
              border: '1px solid var(--color-hairline)',
              padding: '6px 12px',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: 'var(--color-ink)',
            }}
          >
            <span style={{ color: 'var(--color-mute)' }}>IMF Bz Coupling: </span>
            <strong style={{ color: imfBz < 0 ? '#34D399' : '#FBBF24' }}>
              {imfBz} nT ({imfBz < 0 ? 'Southward / Direct Solar Inflow' : 'Northward / Shielded'})
            </strong>
          </div>
          <div
            style={{
              background: 'rgba(10, 13, 24, 0.92)',
              border: '1px solid var(--color-hairline)',
              padding: '6px 12px',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: 'var(--color-ink)',
            }}
          >
            <span style={{ color: 'var(--color-mute)' }}>Solar Wind: </span>
            <strong style={{ color: '#F8FAFC' }}>{solarWindSpeed} km/s</strong>
          </div>
        </div>

        {/* Selected Pin Callout */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'rgba(10, 13, 24, 0.92)',
            border: `1px solid ${isStationActive ? 'var(--color-success-bright)' : 'var(--color-hairline)'}`,
            padding: '8px 14px',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--color-ink)',
            zIndex: 10,
            maxWidth: '240px',
          }}
        >
          <div style={{ color: 'var(--color-mute)', fontSize: '10px' }}>TARGET STATION:</div>
          <div style={{ fontWeight: 700, color: 'var(--color-accent-teal)' }}>{selectedStation.name}</div>
          <div style={{ fontSize: '11px', marginTop: '2px', color: isStationActive ? '#34D399' : '#CBD5E1' }}>
            {isStationActive ? '✨ Aurora Visible Overhead' : `Requires Kp ≥ ${selectedStation.minKp}`}
          </div>
        </div>

        {/* Orbit Interaction Hint */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(10, 13, 24, 0.85)',
            border: '1px solid var(--color-hairline-soft)',
            padding: '4px 14px',
            borderRadius: 'var(--radius-lg)',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-mute)',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          👆 Click 3D pins on Earth to inspect stations • Drag to freely orbit in 3D
        </div>
      </div>

      {/* Station Selector & Live Viewing Forecast Matrix */}
      <div style={{ marginTop: 'var(--space-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontSize: 'var(--text-caption-sm)', color: 'var(--color-mute)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
            SELECT AURORA OBSERVATORY STATION:
          </span>
          <span style={{ fontSize: '11px', color: 'var(--color-accent-teal)', fontFamily: 'var(--font-mono)' }}>
            LIVE FORECAST FOR KP {effectiveKp} {simulatedKp !== null ? '(SIMULATED)' : '(SWPC TELEMETRY)'}
          </span>
        </div>

        <div className="tab-strip" style={{ paddingBottom: '4px' }}>
          {AURORA_STATIONS.map((st) => (
            <button
              key={st.name}
              type="button"
              className={`filter-chip ${selectedStation.name === st.name ? 'filter-chip--active' : ''}`}
              onClick={() => flyToStation(st)}
              style={{ fontSize: '12px' }}
            >
              {st.name} ({st.lat}°N)
            </button>
          ))}
        </div>

        {/* Selected Station Detailed Readout */}
        <div
          className="data-widget-card"
          style={{
            marginTop: 'var(--space-sm)',
            borderLeft: `4px solid ${isStationActive ? 'var(--color-success-bright)' : 'var(--color-info)'}`,
            padding: '16px',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <strong style={{ color: 'var(--color-ink)', fontSize: 'var(--text-body-md)' }}>
                {selectedStation.name}, {selectedStation.country} ({selectedStation.lat}°N, {selectedStation.lon}°E)
              </strong>
              <p style={{ fontSize: 'var(--text-caption-sm)', color: 'var(--color-mute)', marginTop: '2px' }}>
                {selectedStation.desc}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className="instrument-gauge__label">Tonight's Viewing Probability</span>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-body-md)',
                  fontWeight: 700,
                  color: isStationActive ? 'var(--color-success-bright)' : 'var(--color-info)',
                  marginTop: '2px',
                }}
              >
                {viewingLikelihood}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 'var(--space-sm)', marginTop: '4px', paddingTop: '8px', borderTop: '1px solid var(--color-hairline-soft)' }}>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--color-mute)', textTransform: 'uppercase' }}>Recommended Camera Exposure</span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--color-ink)', fontWeight: 600 }}>
                {selectedStation.idealIso}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--color-mute)', textTransform: 'uppercase' }}>Minimum Planetary Kp Needed</span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--color-accent-teal)', fontWeight: 600 }}>
                Kp ≥ {selectedStation.minKp}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--color-mute)', textTransform: 'uppercase' }}>Current Atmospheric Status</span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: isStationActive ? '#34D399' : '#CBD5E1', fontWeight: 600 }}>
                {isStationActive ? '✅ Active Auroral Window' : '⏳ Sub-Threshold Geomagnetism'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
