const map = L.map('map', {
  doubleClickZoom: false,
  maxZoom: 20
}).setView([53.09, 8.78], 14);

L.tileLayer(
  'https://api.maptiler.com/maps/backdrop-v4/256/{z}/{x}/{y}.png?key=H1MLT1MJibg2qwOzZ5h4',
  {
    attribution: '&copy; OpenStreetMap contributors &copy; MapTiler',
    tileSize: 256,
    maxZoom: 20,
    maxNativeZoom: 20
  }
).addTo(map);

const filters = {
  selectedThemen: [],
  selectedRoute: null
};

const markerObjects = [];
let routeLayer = null;

const route20Stations = stations.filter(station =>
  (station.routen || []).includes('fahrradroute')
);

// ============================================================
// THEMEN- UND ROUTENLEISTE
// ============================================================



function setupThemenBar() {
  const chips = document.querySelectorAll('#map-themen-bar .themen-chip');

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const route = chip.dataset.route;
      const thema = chip.dataset.thema;

      if (route) {
        handleRouteClick(route, chip);
      }

      if (thema) {
        handleThemaClick(thema, chip);
      }

      updateMap();
    });
  });
}

function handleRouteClick(route, clickedChip) {
  const routeChips = document.querySelectorAll('#map-themen-bar .themen-chip[data-route]');

  if (filters.selectedRoute === route) {
    filters.selectedRoute = null;
    clickedChip.classList.remove('active');
    clearRoute();
    return;
  }

  filters.selectedRoute = route;

  routeChips.forEach(chip => chip.classList.remove('active'));
  clickedChip.classList.add('active');

  if (route === '20') {
    show20kmRoute();
  }

  if (route === '10') {
    clearRoute();
  }
}

function handleThemaClick(thema, chip) {
  const index = filters.selectedThemen.indexOf(thema);

  if (index > -1) {
    filters.selectedThemen.splice(index, 1);
    chip.classList.remove('active');
  } else {
    filters.selectedThemen.push(thema);
    chip.classList.add('active');
  }
}

function filterStations(allStations) {
  if (filters.selectedThemen.length === 0) {
    return allStations;
  }

  return allStations.filter(station => {
    const stationThemen = station.themen || [];
    return filters.selectedThemen.some(thema => stationThemen.includes(thema));
  });
}

// ============================================================
// ROUTEN
// ============================================================
function clearRoute() {
  if (routeLayer) {
    map.removeLayer(routeLayer);
    routeLayer = null;
  }
}

function show20kmRoute() {
  clearRoute();

  const routePoints = route20Stations
    .map(station => station.coords)
    .filter(Boolean);

  if (routePoints.length < 2) {
    return;
  }

  routeLayer = L.polyline(routePoints, {
    color: 'black',
    weight: 4,
    opacity: 1
  }).addTo(map);

  map.fitBounds(routeLayer.getBounds(), {
    padding: [30, 30]
  });
}

// MARKER
// ============================================================
function createMarkerForStation(station) {
  const zoom = map.getZoom();
const MARKER_SIZE = Math.max(35, 80 - zoom * 2);

const markerHtml = `
  <div class="container-marker" title="${station.name}" style="width:${MARKER_SIZE}px;height:${MARKER_SIZE}px;">
    <svg viewBox="0 0 40 40">
      <!-- Container -->
      <defs>
  <clipPath id="containerClip-${station.id}">
    <rect x="2" y="2" width="36" height="36"/>
  </clipPath>
</defs>

${station.foto
  ? `<image href="${station.foto}" x="2" y="2" width="50" height="36" preserveAspectRatio="xMidYMid slice" clip-path="url(#containerClip-${station.id})" />`
  : `<rect x="2" y="2" width="36" height="36" fill="#2f5f8f" />`
}

<rect x="2" y="2" width="36" height="36" fill="none" stroke="black" stroke-width="2"/>
      
      <!-- Zwei Türlinien -->
      <line x1="18" y1="2" x2="18" y2="38" stroke="black" stroke-width="2"/>
      <line x1="22" y1="2" x2="22" y2="38" stroke="black" stroke-width="2"/>
    </svg>
  </div>
`;

  const icon = L.divIcon({
  html: markerHtml,
  className: '',
  iconSize: [MARKER_SIZE, MARKER_SIZE],
  iconAnchor: [MARKER_SIZE / 2, MARKER_SIZE / 2]
});

  const marker = L.marker(station.coords, { icon });

  attachEvents(marker, station);
  marker.addTo(map);
  markerObjects.push({ station, marker });
}

function attachEvents(marker, station) {
  marker.on('click', e => {
    L.DomEvent.stopPropagation(e);
    addCard(station);
  });
}


stations.forEach(station => createMarkerForStation(station));

function updateMap() {
  const filtered = filterStations(stations);

  markerObjects.forEach(obj => {
    const visible = filtered.some(s => s.id === obj.station.id);

    if (visible) {
      if (!map.hasLayer(obj.marker)) {
        obj.marker.addTo(map);
      }
    } else {
      if (map.hasLayer(obj.marker)) {
        map.removeLayer(obj.marker);
      }
    }
  });
}

// ============================================================
// INFO-KARTEN
// ============================================================
function addCard(station) {
  const container = document.getElementById('content');
  const card = document.createElement('div');
  card.className = 'card';

  const themenText = station.themen ? station.themen.join(', ') : '';
  const routenText = station.routen ? station.routen.join(', ') : '';
  const zeitText = station.zeitspannen ? station.zeitspannen.join(', ') : '';

  const fotoHtml = station.foto
    ? `<img src="${station.foto}" alt="${station.name}" class="card-foto" />`
    : `<div class="card-foto-placeholder"><span>${station.name}</span></div>`;

  card.innerHTML = `
    <span class="close">✕</span>
    <h3>${station.name}</h3>
    ${fotoHtml}
    <p>${station.info}</p>
    <p><strong>Themen:</strong> ${themenText}</p>
    <p><strong>Routen:</strong> ${routenText}</p>
    <p><strong>Zeitspannen:</strong> ${zeitText}</p>
  `;

  card.querySelector('.close').onclick = () => card.remove();
  container.prepend(card);

  const isMin = sidebar.offsetHeight <= MIN_HEIGHT + 5;
  if (isMin) {
    sidebar.style.height = '25vh';
    toggleIcon.textContent = '▼';
    map.invalidateSize();
  }
}

// ============================================================
// SIDEBAR
// ============================================================
const sidebar = document.getElementById('sidebar');
const handle = document.getElementById('resize-handle');
const toggleIcon = document.getElementById('toggle-icon');

const MIN_HEIGHT = 48;
const MAX_HEIGHT = () => window.innerHeight - 60 - 56 - 40;

let isDragging = false;
let startY = 0;
let startHeight = 0;

function getClientY(e) {
  return e.touches ? e.touches[0].clientY : e.clientY;
}

function startDrag(e) {
  isDragging = true;
  startY = getClientY(e);
  startHeight = sidebar.offsetHeight;
  document.body.style.userSelect = 'none';
}

function onDrag(e) {
  if (!isDragging) return;

  let h = startHeight + (startY - getClientY(e));
  h = Math.max(MIN_HEIGHT, Math.min(h, MAX_HEIGHT()));
  sidebar.style.height = h + 'px';
  toggleIcon.textContent = h > MIN_HEIGHT ? '▼' : '▲';
  map.invalidateSize();
}

function stopDrag() {
  if (!isDragging) return;

  isDragging = false;
  document.body.style.userSelect = '';

  if (sidebar.offsetHeight < MIN_HEIGHT + 20) {
    sidebar.style.height = MIN_HEIGHT + 'px';
    toggleIcon.textContent = '▲';
  }

  map.invalidateSize();
}

handle.addEventListener('mousedown', startDrag);
handle.addEventListener('touchstart', startDrag, { passive: true });
document.addEventListener('mousemove', onDrag);
document.addEventListener('touchmove', onDrag, { passive: true });
document.addEventListener('mouseup', stopDrag);
document.addEventListener('touchend', stopDrag);

toggleIcon.addEventListener('click', e => {
  e.stopPropagation();
  const isMin = sidebar.offsetHeight <= MIN_HEIGHT + 5;
  sidebar.style.height = isMin ? '25vh' : MIN_HEIGHT + 'px';
  toggleIcon.textContent = isMin ? '▼' : '▲';
  map.invalidateSize();
});

// ============================================================
// START
// ============================================================
setupThemenBar();
updateMap();
