import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { COLOR_TOKENS } from '../utils/colorTokens.js';
import '../styles/components/canvasChart.css';

const AURORA_STATIONS = [
  { name: 'Tromsø', country: 'Norway', lat: 69.65, lon: 18.96, minKp: 1, desc: 'Prime Arctic aurora corridor — optimal view even at low Kp', idealIso: 'ISO 1600, 4s, f/2.0' },
  { name: 'Fairbanks', country: 'Alaska, USA', lat: 64.84, lon: -147.72, minKp: 2, desc: 'Auroral oval overhead most clear winter nights', idealIso: 'ISO 3200, 6s, f/1.8' },
  { name: 'Reykjavik', country: 'Iceland', lat: 64.14, lon: -21.94, minKp: 2, desc: 'Frequent vivid auroral curtains over volcanic skies', idealIso: 'ISO 1600, 5s, f/2.8' },
  { name: 'Yellowknife', country: 'Canada', lat: 62.45, lon: -114.37, minKp: 2, desc: 'World capital of aurora watching with 90%+ clarity', idealIso: 'ISO 3200, 4s, f/1.4' },
  { name: 'Edinburgh', country: 'Scotland, UK', lat: 55.95, lon: -3.18, minKp: 5, desc: 'Northern Lights visible during G1+ geomagnetic storms', idealIso: 'ISO 3200, 10s, f/1.8' },
  { name: 'Seattle', country: 'Washington, USA', lat: 47.60, lon: -122.33, minKp: 6, desc: 'Visible on northern horizon during G2+ storms', idealIso: 'ISO 6400, 12s, f/1.4' },
  { name: 'Hanle Observatory', country: 'Ladakh, India', lat: 32.78, lon: 78.96, minKp: 8, desc: 'Hanle Dark Sky Reserve — stable auroral red arc (SAR) during G4/G5 storms', idealIso: 'ISO 6400, 20s, f/1.4' },
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

  // Deep observatory night ocean
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, '#040814');
  grad.addColorStop(0.5, '#0a101f');
  grad.addColorStop(1, '#030610');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle graticule grid
  ctx.strokeStyle = 'rgba(45, 212, 191, 0.1)';
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
  ctx.fillStyle = 'rgba(26, 36, 52, 0.95)';
  ctx.strokeStyle = 'rgba(45, 212, 191, 0.35)';
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

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

export function AuroraGlobe3D({ kpIndex = 2, imfBz = -2.8, solarWindSpeed = 450 }) {
  const mountRef = useRef(null);
  const [selectedStation, setSelectedStation] = useState(AURORA_STATIONS[0]);
  const [cameraView, setCameraView] = useState('northPole'); // 'northPole' | 'southPole' | 'perspective' | 'india'
  const [autoRotate, setAutoRotate] = useState(true);
  const [colorMode, setColorMode] = useState('emerald'); // 'emerald' | 'violet' | 'crimson'
  const [waveSpeed, setWaveSpeed] = useState(1.0); // 0.5 | 1.0 | 2.0

  const effectiveKp = Math.max(0, Math.min(9, kpIndex));
  const equatorwardLat = Math.max(40, Math.round(67 - effectiveKp * 2.8));
  const ovalRadiusDeg = 90 - equatorwardLat;
  const ovalRadiusRad = (ovalRadiusDeg * Math.PI) / 180;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let animId;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 460;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 2.4, 2.0);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 2, 2));
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.touchAction = 'none';
    container.appendChild(renderer.domElement);

    // Deep Space Starfield Points
    const starCount = 350;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 25 + Math.random() * 20;
      starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPos[i * 3 + 2] = r * Math.cos(phi);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0x94a3b8,
      size: 0.15,
      transparent: true,
      opacity: 0.75,
    });
    const starMesh = new THREE.Points(starGeo, starMat);
    scene.add(starMesh);

    // Earth Root Rotation Group
    const earthGroup = new THREE.Group();
    scene.add(earthGroup);

    // Dynamic 3D Atmospheric Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffaed, 1.15);
    sunLight.position.set(4, 3, 3);
    scene.add(sunLight);

    // Real 3D Aurora Illuminating Light (Casts colored glow on northern continents)
    const auroraHex =
      colorMode === 'crimson' || effectiveKp >= 5
        ? 0xf43f5e
        : colorMode === 'violet'
        ? 0xa855f7
        : 0x2dd4bf;

    const auroraLight = new THREE.PointLight(auroraHex, 2.4, 2.2);
    auroraLight.position.set(0, Math.cos(ovalRadiusRad) * 1.08, 0);
    earthGroup.add(auroraLight);

    // Southern Light counterpart
    const australisLight = new THREE.PointLight(auroraHex, 1.8, 2.2);
    australisLight.position.set(0, -Math.cos(ovalRadiusRad) * 1.08, 0);
    earthGroup.add(australisLight);

    // 1. Procedural 3D Earth Globe
    const earthTexture = createProceduralEarthTexture();
    const earthGeo = new THREE.SphereGeometry(1, 54, 54);
    const earthMat = new THREE.MeshPhongMaterial({
      map: earthTexture,
      shininess: 14,
      specular: new THREE.Color(0x2dd4bf),
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earthMesh);

    // 2. 3D Aurora Wave Curtains (North & South Ovals)
    const auroraGroup = new THREE.Group();
    earthGroup.add(auroraGroup);

    const segments = 96;
    const ringRadius = Math.sin(ovalRadiusRad) * 1.05;
    const ringY = Math.cos(ovalRadiusRad) * 1.05;

    // A. Main Undulating Aurora Curtain Ribbon (Oxygen Green 557.7nm)
    const ribbonGeo = new THREE.CylinderGeometry(
      ringRadius * 0.98,
      ringRadius * 1.04,
      0.1 + effectiveKp * 0.016,
      segments,
      6,
      true
    );
    const posAttr = ribbonGeo.attributes.position;
    const originalPositions = posAttr.array.slice();

    const ribbonMat = new THREE.MeshBasicMaterial({
      color: auroraHex,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const ribbonMesh = new THREE.Mesh(ribbonGeo, ribbonMat);
    ribbonMesh.position.set(0, ringY, 0);
    auroraGroup.add(ribbonMesh);

    // B. Violet Crown Ribbon hovering at higher ionospheric altitude
    const crownColor = colorMode === 'crimson' ? 0xec4899 : 0xc084fc;
    const crownGeo = new THREE.CylinderGeometry(
      ringRadius * 0.96,
      ringRadius * 1.06,
      0.07 + effectiveKp * 0.012,
      segments,
      4,
      true
    );
    const crownMat = new THREE.MeshBasicMaterial({
      color: crownColor,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const crownMesh = new THREE.Mesh(crownGeo, crownMat);
    crownMesh.position.set(0, ringY + 0.045, 0);
    auroraGroup.add(crownMesh);

    // C. Aurora Australis (Southern Lights counterpart over Antarctica)
    const southRibbonGeo = new THREE.CylinderGeometry(
      ringRadius * 1.04,
      ringRadius * 0.98,
      0.09 + effectiveKp * 0.015,
      segments,
      4,
      true
    );
    const southRibbonMesh = new THREE.Mesh(southRibbonGeo, ribbonMat);
    southRibbonMesh.position.set(0, -ringY, 0);
    auroraGroup.add(southRibbonMesh);

    // D. Ionospheric Energy Particle Field (180 shimmering points)
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const r = ringRadius * (0.96 + Math.random() * 0.08);
      particlePositions[i * 3] = r * Math.cos(angle);
      particlePositions[i * 3 + 1] = ringY + (Math.random() - 0.5) * 0.06;
      particlePositions[i * 3 + 2] = r * Math.sin(angle);
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x34d399,
      size: 0.038,
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    auroraGroup.add(particles);

    // 3. Interactive 3D Station Pins
    const pinsGroup = new THREE.Group();
    earthGroup.add(pinsGroup);

    const pinMeshes = [];
    AURORA_STATIONS.forEach((st) => {
      const pos = latLonToVec3(st.lat, st.lon, 1.02);
      const isVisibleNow = effectiveKp >= st.minKp;

      const pinGeo = new THREE.SphereGeometry(0.026, 16, 16);
      const pinMat = new THREE.MeshBasicMaterial({
        color: isVisibleNow ? 0x2dd4bf : 0x94a3b8,
      });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.copy(pos);
      pinMesh.userData = st;
      pinsGroup.add(pinMesh);
      pinMeshes.push(pinMesh);

      // Pin stem
      const stemGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.045, 8);
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
      const indiaVec = latLonToVec3(32.8, 78.9, 2.8);
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
          setSelectedStation(intersects[0].object.userData);
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

    // Animation Render Loop with Undulating Wave Folding
    const clock = new THREE.Clock();

    function animate() {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime() * waveSpeed;

      // Atmospheric Breathing Light Glow
      const pulse = 0.65 + Math.sin(time * 2.5) * 0.18;
      ribbonMat.opacity = pulse;
      crownMat.opacity = pulse * 0.72;
      auroraLight.intensity = 2.0 + Math.sin(time * 3.0) * 0.8;

      // 3D Harmonic Wave Deformation on Aurora Ribbon Vertices
      const pArr = posAttr.array;
      const vertexCount = pArr.length / 3;
      for (let i = 0; i < vertexCount; i++) {
        const ox = originalPositions[i * 3];
        const oy = originalPositions[i * 3 + 1];
        const oz = originalPositions[i * 3 + 2];
        const theta = Math.atan2(oz, ox);

        // Undulating auroral curtain folding wave
        const wave =
          Math.sin(theta * 6 + time * 2.2) * 0.035 +
          Math.cos(theta * 12 - time * 1.5) * 0.015;

        const currentR = Math.sqrt(ox * ox + oz * oz);
        const newR = currentR + wave;
        pArr[i * 3] = newR * Math.cos(theta);
        pArr[i * 3 + 1] = oy + Math.sin(theta * 4 + time * 1.8) * 0.01;
        pArr[i * 3 + 2] = newR * Math.sin(theta);
      }
      posAttr.needsUpdate = true;

      particles.rotation.y = time * 0.05;

      if (autoRotate && !isDragging) {
        earthGroup.rotation.y += 0.0025;
      }

      renderer.render(scene, camera);
    }
    animate();

    function handleResize() {
      if (!container) return;
      const w = container.clientWidth || 600;
      const h = container.clientHeight || 460;
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

      earthGeo.dispose();
      earthMat.dispose();
      earthTexture.dispose();
      starGeo.dispose();
      starMat.dispose();
      ribbonGeo.dispose();
      ribbonMat.dispose();
      crownGeo.dispose();
      crownMat.dispose();
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
    : 'Unlikely (Requires Kp ≥ ' + selectedStation.minKp + ')';

  return (
    <div className="chart-card" style={{ padding: 'var(--space-lg)', position: 'relative' }}>
      <div className="chart-card__header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              className="swatch-dot"
              style={{ backgroundColor: effectiveKp >= 5 ? 'var(--color-sale)' : 'var(--color-accent-teal)' }}
            ></span>
            <span className="badge-promo">3D OVATION AURORA LIGHTING ENGINE</span>
            <span
              className="badge-promo"
              style={{ color: effectiveKp >= 5 ? 'var(--color-sale)' : 'var(--color-success-bright)' }}
            >
              {effectiveKp >= 5 ? '🚨 ACTIVE GEOMAGNETIC STORM' : 'NOMINAL POLAR CAP'}
            </span>
          </div>
          <h2 className="chart-card__title">Interactive 3D Northern Lights (Aurora Borealis & Australis)</h2>
          <span className="chart-card__subtitle">
            3D WebGL Earth with animated ionospheric undulating curtains and real-time planetary Kp telemetry
          </span>
        </div>

        {/* View Camera Presets & Orbit Controls */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`filter-chip ${cameraView === 'northPole' ? 'filter-chip--active' : ''}`}
            onClick={() => setCameraView('northPole')}
            style={{ fontSize: '11px', padding: '4px 10px' }}
          >
            🧭 Arctic (North Pole)
          </button>
          <button
            type="button"
            className={`filter-chip ${cameraView === 'southPole' ? 'filter-chip--active' : ''}`}
            onClick={() => setCameraView('southPole')}
            style={{ fontSize: '11px', padding: '4px 10px' }}
          >
            🐧 Antarctic (South Pole)
          </button>
          <button
            type="button"
            className={`filter-chip ${cameraView === 'perspective' ? 'filter-chip--active' : ''}`}
            onClick={() => setCameraView('perspective')}
            style={{ fontSize: '11px', padding: '4px 10px' }}
          >
            🌍 Global 3D
          </button>
          <button
            type="button"
            className={`filter-chip ${cameraView === 'india' ? 'filter-chip--active' : ''}`}
            onClick={() => setCameraView('india')}
            style={{ fontSize: '11px', padding: '4px 10px' }}
          >
            🇮🇳 Hanle (India)
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setAutoRotate(!autoRotate)}
            style={{ height: '28px', padding: '0 10px', fontSize: '11px' }}
          >
            {autoRotate ? '⏸️ Pause Orbit' : '▶️ Auto-Rotate'}
          </button>
        </div>
      </div>

      {/* Lighting Spectrum & Wave Speed Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', padding: '6px 0', borderBottom: '1px solid var(--color-hairline-soft)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-mute)' }}>LIGHTING SPECTRUM:</span>
          <button
            type="button"
            className={`filter-chip ${colorMode === 'emerald' ? 'filter-chip--active' : ''}`}
            onClick={() => setColorMode('emerald')}
            style={{ fontSize: '11px', padding: '2px 8px' }}
          >
            🟢 Oxygen Emerald (557.7nm)
          </button>
          <button
            type="button"
            className={`filter-chip ${colorMode === 'violet' ? 'filter-chip--active' : ''}`}
            onClick={() => setColorMode('violet')}
            style={{ fontSize: '11px', padding: '2px 8px' }}
          >
            🟣 Nitrogen Violet (630nm)
          </button>
          <button
            type="button"
            className={`filter-chip ${colorMode === 'crimson' ? 'filter-chip--active' : ''}`}
            onClick={() => setColorMode('crimson')}
            style={{ fontSize: '11px', padding: '2px 8px' }}
          >
            🔴 Storm Crimson (SAR Arc)
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-mute)' }}>WAVE SPEED:</span>
          {[0.5, 1.0, 2.0].map((spd) => (
            <button
              key={spd}
              type="button"
              className={`filter-chip ${waveSpeed === spd ? 'filter-chip--active' : ''}`}
              onClick={() => setWaveSpeed(spd)}
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
          height: '460px',
          position: 'relative',
          borderRadius: 'var(--radius-none)',
          background: 'radial-gradient(circle at center, #0a1122 0%, #030610 100%)',
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
              {imfBz} nT ({imfBz < 0 ? 'Southward / Direct Solar Flow' : 'Northward / Magnetosphere Shielded'})
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
            maxWidth: '220px',
          }}
        >
          <div style={{ color: 'var(--color-mute)', fontSize: '10px' }}>TARGET STATION:</div>
          <div style={{ fontWeight: 700, color: 'var(--color-accent-teal)' }}>{selectedStation.name}</div>
          <div style={{ fontSize: '11px', marginTop: '2px', color: isStationActive ? '#34D399' : '#CBD5E1' }}>
            {isStationActive ? '✨ Aurora Visible' : `Requires Kp ≥ ${selectedStation.minKp}`}
          </div>
        </div>

        {/* Rotation Hint */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(10, 13, 24, 0.8)',
            border: '1px solid var(--color-hairline-soft)',
            padding: '3px 12px',
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
            LIVE FORECAST FOR KP {effectiveKp}
          </span>
        </div>

        <div className="tab-strip" style={{ paddingBottom: '4px' }}>
          {AURORA_STATIONS.map((st) => (
            <button
              key={st.name}
              type="button"
              className={`filter-chip ${selectedStation.name === st.name ? 'filter-chip--active' : ''}`}
              onClick={() => setSelectedStation(st)}
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
