import * as THREE from 'three';
import { COLOR_TOKENS } from '../utils/colorTokens.js';

const LANDMASS_POLYGONS = {
  'North America': [[-160,70], [-140,65], [-120,60], [-100,50], [-75,45], [-60,45], [-70,30], [-90,20], [-105,25], [-125,35], [-145,55]],
  'South America': [[-80,10], [-60,10], [-35,-5], [-40,-20], [-60,-40], [-70,-55], [-75,-45], [-80,-20]],
  'Europe': [[-10,35], [20,38], [35,45], [30,65], [10,60], [-5,50]],
  'Africa': [[-15,35], [30,32], [50,12], [40,-15], [30,-34], [18,-34], [10,-5], [-15,12]],
  'Asia': [[35,45], [60,60], [100,70], [140,65], [140,35], [100,10], [80,8], [65,25], [45,25]],
  'Australia': [[115,-15], [150,-15], [150,-38], [115,-35]],
  'Antarctica': [[-180,-75], [180,-75], [180,-90], [-180,-90]],
};

function pointInPolygon(lon, lat, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    const intersect = ((yi > lat) !== (yj > lat)) &&
      (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

export function getRegionName(lon, lat) {
  for (const [name, poly] of Object.entries(LANDMASS_POLYGONS)) {
    if (pointInPolygon(lon, lat, poly)) return name;
  }
  return 'Open Ocean';
}

function createProceduralEarthTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  const oceanGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  oceanGrad.addColorStop(0, '#0a101f');
  oceanGrad.addColorStop(0.5, '#0f172a');
  oceanGrad.addColorStop(1, '#080d19');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = 'rgba(201, 162, 39, 0.14)';
  ctx.lineWidth = 2;

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

  ctx.strokeStyle = 'rgba(201, 162, 39, 0.35)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, canvas.height / 2);
  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();

  ctx.fillStyle = '#1c2842';
  ctx.strokeStyle = COLOR_TOKENS.accentTeal.hexStr;
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

  Object.values(LANDMASS_POLYGONS).forEach(drawLandmass);

  return new THREE.CanvasTexture(canvas);
}

export function latLonToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

export function vector3ToLatLon(vec) {
  const norm = vec.clone().normalize();
  const lat = 90 - Math.acos(Math.max(-1, Math.min(1, norm.y))) * (180 / Math.PI);
  let lon = Math.atan2(norm.z, -norm.x) * (180 / Math.PI) - 180;
  if (lon < -180) lon += 360;
  if (lon > 180) lon -= 360;
  return { lat, lon };
}

export function initGlobeEngine(container, activeLayer = 'overview', telemetryData = {}, onMarkerSelect, onGlobeSurfaceSelect) {
  if (!container) return null;

  const width = container.clientWidth || 400;
  const height = container.clientHeight || 400;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.z = 2.85;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.domElement.className = 'globe-canvas';
  container.appendChild(renderer.domElement);

  const globeGroup = new THREE.Group();
  scene.add(globeGroup);

  const texture = createProceduralEarthTexture();
  const geometry = new THREE.SphereGeometry(1, 64, 64);
  const material = new THREE.MeshPhongMaterial({
    map: texture,
    specular: new THREE.Color(COLOR_TOKENS.accentTeal.hexStr),
    shininess: 15,
  });

  const globe = new THREE.Mesh(geometry, material);
  globeGroup.add(globe);

  const layerGroup = new THREE.Group();
  globeGroup.add(layerGroup);

  let tooltipEl = container.querySelector('#globe-hover-tooltip');
  if (!tooltipEl) {
    tooltipEl = document.createElement('div');
    tooltipEl.id = 'globe-hover-tooltip';
    tooltipEl.style.position = 'absolute';
    tooltipEl.style.pointerEvents = 'none';
    tooltipEl.style.display = 'none';
    tooltipEl.style.background = 'var(--color-ink)';
    tooltipEl.style.color = '#FFFFFF';
    tooltipEl.style.padding = '4px 8px';
    tooltipEl.style.fontSize = '12px';
    tooltipEl.style.fontFamily = 'var(--font-mono)';
    tooltipEl.style.border = '1px solid var(--color-hairline)';
    tooltipEl.style.zIndex = '100';
    tooltipEl.style.whiteSpace = 'nowrap';
    container.style.position = 'relative';
    container.appendChild(tooltipEl);
  }

  function renderLayerMarkers(layer, data) {
    while (layerGroup.children.length > 0) {
      const child = layerGroup.children[0];
      layerGroup.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    }

    if (layer === 'seismic') {
      const quakesList = data?.quakeData?.quakes || [
        { lat: 37.77, lon: -122.41, mag: 4.2, place: 'San Francisco, CA', time: Date.now() - 3600000, url: 'https://earthquake.usgs.gov' },
        { lat: 35.67, lon: 139.65, mag: 5.4, place: 'Tokyo, Japan', time: Date.now() - 7200000, url: 'https://earthquake.usgs.gov' },
      ];

      quakesList.slice(0, 20).forEach((q) => {
        const isSevere = q.mag >= 5.0;
        const radius = isSevere ? 0.035 : 0.022;
        const colorHex = isSevere ? COLOR_TOKENS.sale.threeHex : COLOR_TOKENS.info.threeHex;
        const geo = new THREE.SphereGeometry(radius, 16, 16);
        const mat = new THREE.MeshBasicMaterial({ color: colorHex });
        const pin = new THREE.Mesh(geo, mat);
        pin.position.copy(latLonToVector3(q.lat, q.lon, 1.02));
        pin.userData = {
          kind: 'seismic',
          name: q.place || 'Seismic Event',
          lat: q.lat,
          lon: q.lon,
          mag: q.mag,
          time: q.time,
          url: q.url || 'https://earthquake.usgs.gov',
        };
        layerGroup.add(pin);
      });
    } else if (layer === 'aqi') {
      const cityList = data?.citySnapshots?.length ? data.citySnapshots : [
        { name: 'London', lat: 51.5, lon: -0.1, aqi: 28, category: 'Good', statusObj: COLOR_TOKENS.success },
        { name: 'New York', lat: 40.7, lon: -74.0, aqi: 42, category: 'Good', statusObj: COLOR_TOKENS.success },
      ];
      cityList.forEach((c) => {
        const geo = new THREE.SphereGeometry(0.028, 16, 16);
        const mat = new THREE.MeshBasicMaterial({ color: c.statusObj?.threeHex || COLOR_TOKENS.success.threeHex });
        const pin = new THREE.Mesh(geo, mat);
        pin.position.copy(latLonToVector3(c.lat, c.lon, 1.02));
        pin.userData = {
          kind: 'aqi',
          name: c.name,
          lat: c.lat,
          lon: c.lon,
          aqi: c.aqi,
          category: c.category,
          status: c.statusObj?.hexStr || '#1EAA52',
        };
        layerGroup.add(pin);
      });
    } else if (layer === 'satellites') {
      const issLat = data?.issData?.latitude ?? 28.5;
      const issLon = data?.issData?.longitude ?? -84.2;
      const issAlt = data?.issData?.altitude ?? 418;
      const issVel = data?.issData?.velocity ? Math.round(data.issData.velocity) : 27580;
      const issVis = data?.issData?.visibility || 'Daylight';

      const issGeo = new THREE.OctahedronGeometry(0.04, 0);
      const issMat = new THREE.MeshBasicMaterial({ color: COLOR_TOKENS.accentTeal.threeHex });
      const issPin = new THREE.Mesh(issGeo, issMat);
      issPin.position.copy(latLonToVector3(issLat, issLon, 1.05));
      issPin.userData = {
        kind: 'satellite',
        name: 'ISS Space Station (ZARYA-25544)',
        lat: issLat,
        lon: issLon,
        altitude: issAlt,
        velocity: issVel,
        visibility: issVis,
      };
      layerGroup.add(issPin);
    } else if (layer === 'weather') {
      const cityList = data?.citySnapshots?.length ? data.citySnapshots : [
        { name: 'London', lat: 51.5, lon: -0.1, temp: 18, windSpeed: 12, pressure: 1013, statusObj: COLOR_TOKENS.success },
        { name: 'New York', lat: 40.7, lon: -74.0, temp: 24, windSpeed: 15, pressure: 1016, statusObj: COLOR_TOKENS.info },
      ];
      cityList.forEach((c) => {
        const geo = new THREE.SphereGeometry(0.025, 16, 16);
        const mat = new THREE.MeshBasicMaterial({ color: c.statusObj?.threeHex || COLOR_TOKENS.success.threeHex });
        const pin = new THREE.Mesh(geo, mat);
        pin.position.copy(latLonToVector3(c.lat, c.lon, 1.02));
        pin.userData = {
          kind: 'weather',
          name: c.name,
          lat: c.lat,
          lon: c.lon,
          temp: c.temp,
          wind: c.windSpeed,
          pressure: c.pressure,
          status: c.statusObj?.hexStr || '#1EAA52',
        };
        layerGroup.add(pin);
      });
    } else {
      const defaultCities = [
        { name: 'London', lat: 51.5, lon: -0.1 },
        { name: 'New York', lat: 40.7, lon: -74.0 },
        { name: 'Tokyo', lat: 35.6, lon: 139.6 },
        { name: 'Sydney', lat: -33.8, lon: 151.2 },
        { name: 'New Delhi', lat: 28.6, lon: 77.2 },
        { name: 'Cairo', lat: 30.0, lon: 31.2 },
      ];
      const pinGeo = new THREE.SphereGeometry(0.02, 16, 16);
      const pinMat = new THREE.MeshBasicMaterial({ color: COLOR_TOKENS.accentTeal.threeHex });
      defaultCities.forEach((c) => {
        const pin = new THREE.Mesh(pinGeo, pinMat);
        pin.position.copy(latLonToVector3(c.lat, c.lon, 1.01));
        pin.userData = {
          kind: 'overview',
          name: c.name,
          lat: c.lat,
          lon: c.lon,
        };
        layerGroup.add(pin);
      });
    }
  }

  renderLayerMarkers(activeLayer, telemetryData);

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

  const issTrail = createOrbitLoop(1.18, 51.6, COLOR_TOKENS.accentTeal.threeHex);
  const polarTrail = createOrbitLoop(1.32, 85.0, COLOR_TOKENS.info.threeHex);
  scene.add(issTrail);
  scene.add(polarTrail);

  const atmosphereGeo = new THREE.SphereGeometry(1.05, 64, 64);
  const atmosphereMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(COLOR_TOKENS.accentTeal.hexStr),
    transparent: true,
    opacity: 0.12,
    side: THREE.BackSide,
  });
  const atmosphere = new THREE.Mesh(atmosphereGeo, atmosphereMat);
  scene.add(atmosphere);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(COLOR_TOKENS.accentTeal.threeHex, 1.25);
  dirLight.position.set(5, 3, 5);
  scene.add(dirLight);

  let isDragging = false;
  let startPointerPos = { x: 0, y: 0 };
  let previousMousePosition = { x: 0, y: 0 };

  const raycaster = new THREE.Raycaster();
  const mouseVec = new THREE.Vector2();

  function onMouseDown(e) {
    isDragging = true;
    const cx = e.clientX || e.touches?.[0].clientX || 0;
    const cy = e.clientY || e.touches?.[0].clientY || 0;
    startPointerPos = { x: cx, y: cy };
    previousMousePosition = { x: cx, y: cy };
  }

  function onMouseMove(e) {
    const clientX = e.clientX || e.touches?.[0].clientX || 0;
    const clientY = e.clientY || e.touches?.[0].clientY || 0;

    if (isDragging) {
      const deltaX = clientX - previousMousePosition.x;
      const deltaY = clientY - previousMousePosition.y;
      globeGroup.rotation.y += deltaX * 0.005;
      globeGroup.rotation.x += deltaY * 0.005;
      previousMousePosition = { x: clientX, y: clientY };
    }

    if (window.matchMedia('(hover: hover)').matches) {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseVec.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouseVec.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouseVec, camera);
      const markerHits = raycaster.intersectObjects(layerGroup.children, true);

      if (markerHits.length > 0) {
        const hitObj = markerHits[0].object;
        renderer.domElement.style.cursor = 'pointer';

        if (tooltipEl && hitObj.userData?.name) {
          tooltipEl.innerText = hitObj.userData.name;
          tooltipEl.style.display = 'block';
          const toolX = Math.min(clientX - rect.left + 12, rect.width - 140);
          const toolY = Math.max(10, clientY - rect.top + 12);
          tooltipEl.style.left = `${toolX}px`;
          tooltipEl.style.top = `${toolY}px`;
        }
      } else {
        const globeHits = raycaster.intersectObject(globe, false);
        if (globeHits.length > 0) {
          renderer.domElement.style.cursor = isDragging ? 'grabbing' : 'pointer';
          if (tooltipEl) {
            const localPoint = globeGroup.worldToLocal(globeHits[0].point.clone());
            const { lat, lon } = vector3ToLatLon(localPoint);
            const regName = getRegionName(lon, lat);
            tooltipEl.innerText = `${regName} (${lat.toFixed(1)}°, ${lon.toFixed(1)}°)`;
            tooltipEl.style.display = 'block';
            const toolX = Math.min(clientX - rect.left + 12, rect.width - 160);
            const toolY = Math.max(10, clientY - rect.top + 12);
            tooltipEl.style.left = `${toolX}px`;
            tooltipEl.style.top = `${toolY}px`;
          }
        } else {
          renderer.domElement.style.cursor = isDragging ? 'grabbing' : 'grab';
          if (tooltipEl) tooltipEl.style.display = 'none';
        }
      }
    }
  }

  function onMouseUp(e) {
    const clientX = e.clientX || e.changedTouches?.[0]?.clientX || 0;
    const clientY = e.clientY || e.changedTouches?.[0]?.clientY || 0;

    const distSq = Math.pow(clientX - startPointerPos.x, 2) + Math.pow(clientY - startPointerPos.y, 2);

    if (distSq < 16) {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseVec.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouseVec.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouseVec, camera);
      const markerHits = raycaster.intersectObjects(layerGroup.children, true);

      if (markerHits.length > 0 && onMarkerSelect) {
        onMarkerSelect(markerHits[0].object.userData);
      } else {
        const globeHits = raycaster.intersectObject(globe, false);
        if (globeHits.length > 0 && onGlobeSurfaceSelect) {
          const localPoint = globeGroup.worldToLocal(globeHits[0].point.clone());
          const { lat, lon } = vector3ToLatLon(localPoint);
          const region = getRegionName(lon, lat);
          onGlobeSurfaceSelect({ kind: 'region', region, lat, lon });
        }
      }
    }

    isDragging = false;
  }

  const domElement = renderer.domElement;
  domElement.addEventListener('mousedown', onMouseDown);
  domElement.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);

  domElement.addEventListener('touchstart', onMouseDown, { passive: true });
  domElement.addEventListener('touchmove', onMouseMove, { passive: true });
  window.addEventListener('touchend', onMouseUp);

  let animationFrameId;
  function animate() {
    animationFrameId = requestAnimationFrame(animate);
    if (!isDragging) {
      globeGroup.rotation.y += 0.0018;
    }
    issTrail.rotation.y += 0.001;
    polarTrail.rotation.z += 0.0008;

    renderer.render(scene, camera);
  }
  animate();

  function onResize() {
    if (!container) return;
    const newW = container.clientWidth || 400;
    const newH = container.clientHeight || 400;
    camera.aspect = newW / newH;
    camera.updateProjectionMatrix();
    renderer.setSize(newW, newH);
  }
  window.addEventListener('resize', onResize);

  return {
    updateLayer(newLayer, newData) {
      renderLayerMarkers(newLayer, newData);
    },
    dispose() {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchend', onMouseUp);
      domElement.removeEventListener('mousedown', onMouseDown);
      domElement.removeEventListener('mousemove', onMouseMove);
      domElement.removeEventListener('touchstart', onMouseDown);
      domElement.removeEventListener('touchmove', onMouseMove);

      if (tooltipEl && tooltipEl.parentNode) {
        tooltipEl.parentNode.removeChild(tooltipEl);
      }

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
