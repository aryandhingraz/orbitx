import * as THREE from 'three';

/**
 * Creates a procedural 2D texture canvas representing planet Earth
 * Features continent shapes, latitude/longitude brass grid, and specular ocean styling
 */
function createProceduralEarthTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // 1. Ocean Background (Deep Navy Void)
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  oceanGrad.addColorStop(0, '#0a101f');
  oceanGrad.addColorStop(0.5, '#0f172a');
  oceanGrad.addColorStop(1, '#080d19');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. Latitude and Longitude Grid Lines (Brass Instrument Aesthetic)
  ctx.strokeStyle = 'rgba(201, 162, 39, 0.14)';
  ctx.lineWidth = 2;

  // Latitudes
  for (let lat = -80; lat <= 80; lat += 20) {
    const y = ((90 - lat) / 180) * canvas.height;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // Longitudes
  for (let lon = -180; lon < 180; lon += 30) {
    const x = ((lon + 180) / 360) * canvas.width;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  // Equator Highlight
  ctx.strokeStyle = 'rgba(201, 162, 39, 0.35)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, canvas.height / 2);
  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.stroke();

  // Prime Meridian Highlight
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();

  // 3. Continents Polygons
  ctx.fillStyle = '#1c2842';
  ctx.strokeStyle = '#5FBFA9'; // Verdigris coastlines
  ctx.lineWidth = 3;

  function drawLandmass(points) {
    ctx.beginPath();
    points.forEach(([lon, lat], i) => {
      const x = ((lon + 180) / 360) * canvas.width;
      const y = ((90 - lat) / 180) * canvas.height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // North America
  drawLandmass([[-160,70], [-140,65], [-120,60], [-100,50], [-75,45], [-60,45], [-70,30], [-90,20], [-105,25], [-125,35], [-145,55]]);
  // South America
  drawLandmass([[-80,10], [-60,10], [-35,-5], [-40,-20], [-60,-40], [-70,-55], [-75,-45], [-80,-20]]);
  // Europe
  drawLandmass([[-10,35], [20,38], [35,45], [30,65], [10,60], [-5,50]]);
  // Africa
  drawLandmass([[-15,35], [30,32], [50,12], [40,-15], [30,-34], [18,-34], [10,-5], [-15,12]]);
  // Asia
  drawLandmass([[35,45], [60,60], [100,70], [140,65], [140,35], [100,10], [80,8], [65,25], [45,25]]);
  // Australia
  drawLandmass([[115,-15], [150,-15], [150,-38], [115,-35]]);
  // Antarctica
  drawLandmass([[-180,-75], [180,-75], [180,-90], [-180,-90]]);

  return new THREE.CanvasTexture(canvas);
}

/**
 * Converts Lat/Lon to 3D Cartesian coordinates on sphere radius
 */
function latLonToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

/**
 * Main Pure Vanilla JS Globe Engine
 * Zero React dependencies!
 */
export function initGlobeEngine(container) {
  if (!container) return null;

  const width = container.clientWidth || 400;
  const height = container.clientHeight || 400;

  // Scene, Camera, Renderer
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.z = 2.85;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // §9 performance cap
  renderer.domElement.className = 'globe-canvas';
  container.appendChild(renderer.domElement);

  // Globe Group (rotates globe + 3D markers together)
  const globeGroup = new THREE.Group();
  scene.add(globeGroup);

  // Globe Mesh
  const texture = createProceduralEarthTexture();
  const geometry = new THREE.SphereGeometry(1, 64, 64);
  const material = new THREE.MeshPhongMaterial({
    map: texture,
    specular: new THREE.Color('#C9A227'),
    shininess: 15,
  });

  const globe = new THREE.Mesh(geometry, material);
  globeGroup.add(globe);

  // 3D City Pin Markers on Globe Surface
  const cityLocations = [
    { name: 'London', lat: 51.5, lon: -0.1 },
    { name: 'New York', lat: 40.7, lon: -74.0 },
    { name: 'Tokyo', lat: 35.6, lon: 139.6 },
    { name: 'Sydney', lat: -33.8, lon: 151.2 },
    { name: 'New Delhi', lat: 28.6, lon: 77.2 },
    { name: 'Cairo', lat: 30.0, lon: 31.2 },
    { name: 'Rio', lat: -22.9, lon: -43.2 },
  ];

  const pinGeo = new THREE.SphereGeometry(0.02, 16, 16);
  const pinMat = new THREE.MeshBasicMaterial({ color: 0xc9a227 });

  cityLocations.forEach((c) => {
    const pin = new THREE.Mesh(pinGeo, pinMat);
    const pos = latLonToVector3(c.lat, c.lon, 1.01);
    pin.position.copy(pos);
    globeGroup.add(pin);
  });

  // 3D Satellite Trajectory Orbit Trails (Three.js Line Loops)
  function createOrbitLoop(radius, inclinationDeg, colorHex) {
    const points = [];
    const segments = 128;
    const inc = inclinationDeg * (Math.PI / 180);

    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      const x = radius * Math.cos(theta);
      const y = radius * Math.sin(theta) * Math.sin(inc);
      const z = radius * Math.sin(theta) * Math.cos(inc);
      points.push(new THREE.Vector3(x, y, z));
    }

    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
    const lineMat = new THREE.LineDashedMaterial({
      color: colorHex,
      dashSize: 0.05,
      gapSize: 0.03,
      transparent: true,
      opacity: 0.6,
    });
    const line = new THREE.LineLoop(lineGeo, lineMat);
    line.computeLineDistances();
    return line;
  }

  // Add 2 3D Orbit Trajectory Rings
  const issTrail = createOrbitLoop(1.18, 51.6, 0x5fbfa9); // ISS 51.6° inclination
  const polarTrail = createOrbitLoop(1.32, 85.0, 0xc9a227); // Polar orbit
  scene.add(issTrail);
  scene.add(polarTrail);

  // Atmosphere Glow Shroud
  const atmosphereGeo = new THREE.SphereGeometry(1.05, 64, 64);
  const atmosphereMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#5FBFA9'),
    transparent: true,
    opacity: 0.12,
    side: THREE.BackSide,
  });
  const atmosphere = new THREE.Mesh(atmosphereGeo, atmosphereMat);
  scene.add(atmosphere);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xece6d6, 0.65);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xc9a227, 1.25);
  dirLight.position.set(5, 3, 5);
  scene.add(dirLight);

  // Mouse Drag / Touch Controls
  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };

  function onMouseDown(e) {
    isDragging = true;
    previousMousePosition = { x: e.clientX || e.touches?.[0].clientX, y: e.clientY || e.touches?.[0].clientY };
  }

  function onMouseMove(e) {
    if (!isDragging) return;
    const clientX = e.clientX || e.touches?.[0].clientX;
    const clientY = e.clientY || e.touches?.[0].clientY;
    const deltaX = clientX - previousMousePosition.x;
    const deltaY = clientY - previousMousePosition.y;

    globeGroup.rotation.y += deltaX * 0.005;
    globeGroup.rotation.x += deltaY * 0.005;

    previousMousePosition = { x: clientX, y: clientY };
  }

  function onMouseUp() {
    isDragging = false;
  }

  const domElement = renderer.domElement;
  domElement.addEventListener('mousedown', onMouseDown);
  domElement.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);

  domElement.addEventListener('touchstart', onMouseDown, { passive: true });
  domElement.addEventListener('touchmove', onMouseMove, { passive: true });
  window.addEventListener('touchend', onMouseUp);

  // Animation Loop
  let animationFrameId;
  function animate() {
    animationFrameId = requestAnimationFrame(animate);
    if (!isDragging) {
      globeGroup.rotation.y += 0.0018; // Ambient rotation
    }
    issTrail.rotation.y += 0.001; // Orbit trail slow precession
    polarTrail.rotation.z += 0.0008;

    renderer.render(scene, camera);
  }
  animate();

  // Resize Handler
  function onResize() {
    if (!container) return;
    const newW = container.clientWidth || 400;
    const newH = container.clientHeight || 400;
    camera.aspect = newW / newH;
    camera.updateProjectionMatrix();
    renderer.setSize(newW, newH);
  }
  window.addEventListener('resize', onResize);

  // Teardown / Cleanup (§9 WebGL Context Disposal)
  return {
    dispose() {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchend', onMouseUp);
      domElement.removeEventListener('mousedown', onMouseDown);
      domElement.removeEventListener('mousemove', onMouseMove);
      domElement.removeEventListener('touchstart', onMouseDown);
      domElement.removeEventListener('touchmove', onMouseMove);

      geometry.dispose();
      material.dispose();
      texture.dispose();
      pinGeo.dispose();
      pinMat.dispose();
      atmosphereGeo.dispose();
      atmosphereMat.dispose();
      renderer.dispose();
      if (domElement.parentNode) {
        domElement.parentNode.removeChild(domElement);
      }
    },
  };
}
