import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { COLOR_TOKENS } from '../utils/colorTokens.js';
import '../styles/components/canvasChart.css';

const AURORA_STATIONS = [
  { name: 'Tromsø', country: 'Norway', lat: 69.65, lon: 18.96, minKp: 1, desc: 'Prime Arctic aurora corridor — optimal view even at low Kp' },
  { name: 'Fairbanks', country: 'Alaska, USA', lat: 64.84, lon: -147.72, minKp: 2, desc: 'Auroral oval overhead most clear winter nights' },
  { name: 'Reykjavik', country: 'Iceland', lat: 64.14, lon: -21.94, minKp: 2, desc: 'Frequent vivid auroral curtains over volcanic skies' },
  { name: 'Yellowknife', country: 'Canada', lat: 62.45, lon: -114.37, minKp: 2, desc: 'World capital of aurora watching with 90%+ clarity' },
  { name: 'Edinburgh', country: 'Scotland, UK', lat: 55.95, lon: -3.18, minKp: 5, desc: 'Northern Lights visible during G1+ geomagnetic storms' },
  { name: 'Seattle', country: 'Washington, USA', lat: 47.60, lon: -122.33, minKp: 6, desc: 'Visible on northern horizon during G2+ storms' },
  { name: 'Hanle Observatory', country: 'Ladakh, India', lat: 32.78, lon: 78.96, minKp: 8, desc: 'Hanle Dark Sky Reserve — stable auroral red arc (SAR) during G4/G5 storms' },
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
  grad.addColorStop(0, '#060a17');
  grad.addColorStop(0.5, '#0b1120');
  grad.addColorStop(1, '#050811');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Latitude and Longitude Graticules
  ctx.strokeStyle = 'rgba(45, 212, 191, 0.12)';
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

  // Continental land contours (simplified vector paths)
  ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
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
  const [cameraView, setCameraView] = useState('northPole'); // 'northPole' | 'perspective' | 'india'
  const [autoRotate, setAutoRotate] = useState(true);

  // Dynamic Auroral Oval radius based on Kp index (67° down to 42° latitude)
  const effectiveKp = Math.max(0, Math.min(9, kpIndex));
  const equatorwardLat = Math.max(40, Math.round(67 - effectiveKp * 2.8));
  const ovalRadiusDeg = 90 - equatorwardLat; // Angular radius from pole
  const ovalRadiusRad = (ovalRadiusDeg * Math.PI) / 180;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let animId;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 2.4, 2.2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 2, 2));
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.touchAction = 'none';
    container.appendChild(renderer.domElement);

    // Main Earth Sphere Group
    const earthGroup = new THREE.Group();
    scene.add(earthGroup);

    // Ambient & Directional Sun Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffaed, 1.2);
    sunLight.position.set(4, 3, 3);
    scene.add(sunLight);

    // 1. Procedural 3D Earth Globe
    const earthTexture = createProceduralEarthTexture();
    const earthGeo = new THREE.SphereGeometry(1, 48, 48);
    const earthMat = new THREE.MeshPhongMaterial({
      map: earthTexture,
      shininess: 12,
      specular: new THREE.Color(0x2dd4bf),
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earthMesh);

    // 2. 3D Aurora Curtain Ribbons (Oxygen Green 557.7nm & Nitrogen Violet 630nm)
    const auroraGroup = new THREE.Group();
    earthGroup.add(auroraGroup);

    // Build glowing Auroral Oval Ring around the Magnetic North Pole
    const segments = 64;
    const ringRadius = Math.sin(ovalRadiusRad) * 1.04;
    const ringY = Math.cos(ovalRadiusRad) * 1.04;

    // Glowing Green Aurora Base Ribbon
    const ribbonGeo = new THREE.CylinderGeometry(
      ringRadius * 0.98,
      ringRadius * 1.03,
      0.08 + effectiveKp * 0.015,
      segments,
      1,
      true
    );
    const ribbonMat = new THREE.MeshBasicMaterial({
      color: effectiveKp >= 5 ? 0xef4444 : 0x2dd4bf,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const ribbonMesh = new THREE.Mesh(ribbonGeo, ribbonMat);
    ribbonMesh.position.set(0, ringY, 0);
    auroraGroup.add(ribbonMesh);

    // Violet Crown Ribbon hovering at higher altitude (250km ionosphere)
    const crownGeo = new THREE.CylinderGeometry(
      ringRadius * 0.96,
      ringRadius * 1.05,
      0.05 + effectiveKp * 0.01,
      segments,
      1,
      true
    );
    const crownMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const crownMesh = new THREE.Mesh(crownGeo, crownMat);
    crownMesh.position.set(0, ringY + 0.04, 0);
    auroraGroup.add(crownMesh);

    // Luminous Particle Glow Ring along auroral boundary
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const r = ringRadius * (0.97 + Math.random() * 0.06);
      particlePositions[i * 3] = r * Math.cos(angle);
      particlePositions[i * 3 + 1] = ringY + (Math.random() - 0.5) * 0.05;
      particlePositions[i * 3 + 2] = r * Math.sin(angle);
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x34d399,
      size: 0.035,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    auroraGroup.add(particles);

    // 3. 3D Station Pins
    const pinsGroup = new THREE.Group();
    earthGroup.add(pinsGroup);

    AURORA_STATIONS.forEach((st) => {
      const pos = latLonToVec3(st.lat, st.lon, 1.02);
      const isVisibleNow = effectiveKp >= st.minKp;

      const pinGeo = new THREE.SphereGeometry(0.024, 16, 16);
      const pinMat = new THREE.MeshBasicMaterial({
        color: isVisibleNow ? 0x2dd4bf : 0x94a3b8,
      });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.copy(pos);
      pinMesh.userData = st;
      pinsGroup.add(pinMesh);

      // Pin stem
      const stemGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.04, 8);
      const stemMat = new THREE.MeshBasicMaterial({ color: 0xcbd5e1 });
      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.position.copy(latLonToVec3(st.lat, st.lon, 1.01));
      stem.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pos.clone().normalize());
      pinsGroup.add(stem);
    });

    // Camera initial angle based on preset
    if (cameraView === 'northPole') {
      camera.position.set(0, 2.7, 0.8);
      camera.lookAt(0, 0, 0);
    } else if (cameraView === 'india') {
      const indiaVec = latLonToVec3(32.8, 78.9, 2.85);
      camera.position.copy(indiaVec);
      camera.lookAt(0, 0, 0);
    } else {
      camera.position.set(1.4, 1.8, 2.2);
      camera.lookAt(0, 0, 0);
    }

    // Interactive Drag Controls
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    function onPointerDown(e) {
      isDragging = true;
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
      prevMouseX = clientX;
      prevMouseY = clientY;

      earthGroup.rotation.y += dx * 0.008;
      earthGroup.rotation.x += dy * 0.008;
      earthGroup.rotation.x = Math.max(-1.3, Math.min(1.3, earthGroup.rotation.x));
    }

    function onPointerUp() {
      isDragging = false;
    }

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onPointerDown);
    dom.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    dom.addEventListener('touchstart', onPointerDown, { passive: true });
    dom.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // Animation Loop
    let clock = new THREE.Clock();

    function animate() {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Atmospheric Breathing Pulsation for Aurora Glow
      const pulse = 0.65 + Math.sin(time * 2.5) * 0.18;
      ribbonMat.opacity = pulse;
      crownMat.opacity = pulse * 0.75;
      particles.rotation.y = time * 0.06;

      if (autoRotate && !isDragging) {
        earthGroup.rotation.y += 0.003;
      }

      renderer.render(scene, camera);
    }
    animate();

    function handleResize() {
      if (!container) return;
      const w = container.clientWidth || 600;
      const h = container.clientHeight || 450;
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
      ribbonGeo.dispose();
      ribbonMat.dispose();
      crownGeo.dispose();
      crownMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();

      if (dom && dom.parentElement) {
        dom.parentElement.removeChild(dom);
      }
    };
  }, [effectiveKp, ovalRadiusRad, cameraView, autoRotate]);

  const viewingLikelihood =
    effectiveKp >= selectedStation.minKp
      ? 'Optimal (Aurora Oval Overhead)'
      : effectiveKp + 1 === selectedStation.minKp
      ? 'Possible on Northern Horizon'
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
            <span className="badge-promo">3D OVATION AURORA MODEL</span>
            <span
              className="badge-promo"
              style={{ color: effectiveKp >= 5 ? 'var(--color-sale)' : 'var(--color-success-bright)' }}
            >
              {effectiveKp >= 5 ? '🚨 ACTIVE GEOMAGNETIC STORM' : 'NOMINAL POLAR CAP'}
            </span>
          </div>
          <h2 className="chart-card__title">Interactive 3D Aurora Borealis & Australis Oval</h2>
          <span className="chart-card__subtitle">
            3D WebGL Earth with live ionospheric glowing auroral curtain driven by real SWPC Kp telemetry
          </span>
        </div>

        {/* View Camera Mode & Rotation Controls */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`filter-chip ${cameraView === 'northPole' ? 'filter-chip--active' : ''}`}
            onClick={() => setCameraView('northPole')}
            style={{ fontSize: '11px', padding: '4px 10px' }}
          >
            🧭 North Pole Polar View
          </button>
          <button
            type="button"
            className={`filter-chip ${cameraView === 'perspective' ? 'filter-chip--active' : ''}`}
            onClick={() => setCameraView('perspective')}
            style={{ fontSize: '11px', padding: '4px 10px' }}
          >
            🌍 Global Perspective
          </button>
          <button
            type="button"
            className={`filter-chip ${cameraView === 'india' ? 'filter-chip--active' : ''}`}
            onClick={() => setCameraView('india')}
            style={{ fontSize: '11px', padding: '4px 10px' }}
          >
            🇮🇳 Hanle Observatory View
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

      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={mountRef}
        style={{
          width: '100%',
          height: '420px',
          position: 'relative',
          borderRadius: 'var(--radius-none)',
          background: 'radial-gradient(circle at center, #0a1122 0%, #050811 100%)',
          border: '1px solid var(--color-hairline)',
          overflow: 'hidden',
          cursor: 'grab',
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
              background: 'rgba(10, 13, 24, 0.88)',
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
              background: 'rgba(10, 13, 24, 0.88)',
              border: '1px solid var(--color-hairline)',
              padding: '6px 12px',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: 'var(--color-ink)',
            }}
          >
            <span style={{ color: 'var(--color-mute)' }}>IMF Bz Coupling: </span>
            <strong style={{ color: imfBz < 0 ? '#34D399' : '#FBBF24' }}>
              {imfBz} nT ({imfBz < 0 ? 'Southward / Direct Auroral Flow' : 'Northward / Shielded'})
            </strong>
          </div>
        </div>

        {/* Rotation Hint */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(10, 13, 24, 0.75)',
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
          👆 Drag to freely orbit 3D globe • Pinch to zoom
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
            borderLeft: `4px solid ${effectiveKp >= selectedStation.minKp ? 'var(--color-success-bright)' : 'var(--color-info)'}`,
            padding: '12px 16px',
            gap: '6px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
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
                  color: effectiveKp >= selectedStation.minKp ? 'var(--color-success-bright)' : 'var(--color-info)',
                  marginTop: '2px',
                }}
              >
                {viewingLikelihood}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
