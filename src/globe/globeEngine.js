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
  ctx.strokeStyle = 'rgba(201, 162, 39, 0.12)';
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
  ctx.strokeStyle = 'rgba(201, 162, 39, 0.3)';
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

  // 3. Simplified Continents Drawing (Procedural shapes representing continents)
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

  // Simplified continent polygons [lon, lat]
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

  // 4. Glowing City Telemetry Nodes (Brass & Verdigris dots)
  const cityNodes = [
    [0, 51.5],   // London
    [-74, 40.7],  // New York
    [139.7, 35.6],// Tokyo
    [77.2, 28.6], // New Delhi
    [151.2,-33.8],// Sydney
    [-43.2,-22.9],// Rio
    [31.2, 30.0], // Cairo
  ];

  cityNodes.forEach(([lon, lat]) => {
    const x = ((lon + 180) / 360) * canvas.width;
    const y = ((90 - lat) / 180) * canvas.height;
    ctx.fillStyle = '#C9A227';
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(201, 162, 39, 0.4)';
    ctx.beginPath();
    ctx.arc(x, y, 14, 0, Math.PI * 2);
    ctx.fill();
  });

  return new THREE.CanvasTexture(canvas);
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
  camera.position.z = 2.8;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // §9 performance cap
  renderer.domElement.className = 'globe-canvas';
  container.appendChild(renderer.domElement);

  // Globe Mesh
  const texture = createProceduralEarthTexture();
  const geometry = new THREE.SphereGeometry(1, 64, 64);
  const material = new THREE.MeshPhongMaterial({
    map: texture,
    specular: new THREE.Color('#C9A227'),
    shininess: 15,
  });

  const globe = new THREE.Mesh(geometry, material);
  scene.add(globe);

  // Atmosphere Glow Shroud
  const atmosphereGeo = new THREE.SphereGeometry(1.04, 64, 64);
  const atmosphereMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#5FBFA9'),
    transparent: true,
    opacity: 0.12,
    side: THREE.BackSide,
  });
  const atmosphere = new THREE.Mesh(atmosphereGeo, atmosphereMat);
  scene.add(atmosphere);

  // Lighting — Observatory brass ambient + directional light
  const ambientLight = new THREE.AmbientLight(0xece6d6, 0.6);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xc9a227, 1.2);
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

    globe.rotation.y += deltaX * 0.005;
    globe.rotation.x += deltaY * 0.005;

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
      globe.rotation.y += 0.0015; // Ambient rotation
    }
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

  // Teardown / Cleanup function (§9 WebGL Context Disposal)
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
      atmosphereGeo.dispose();
      atmosphereMat.dispose();
      renderer.dispose();
      if (domElement.parentNode) {
        domElement.parentNode.removeChild(domElement);
      }
    },
  };
}
