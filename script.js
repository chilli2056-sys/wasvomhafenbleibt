const map = L.map('map', {
  doubleClickZoom: false
}).setView([53.09, 8.78], 14);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap-Mitwirkende'
}).addTo(map);

const filters = {
  selectedThemen: [],
  showFahrradroute: false
};

const markerObjects = [];

const routeStations = stations.filter(station =>
  (station.routen || []).includes('fahrradroute')
);

// ============================================================
// THEMENLEISTE
// ============================================================
function setupThemenBar() {
  const chips = document.querySelectorAll('#map-themen-bar .themen-chip');

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      if (chip.dataset.route === 'true') {
        filters.showFahrradroute = !filters.showFahrradroute;
        chip.classList.toggle('active');

        if (!filters.showFahrradroute) {
          stopNavigation();
        }
      } else {
        const thema = chip.dataset.thema;
        const index = filters.selectedThemen.indexOf(thema);

        if (index > -1) {
          filters.selectedThemen.splice(index, 1);
          chip.classList.remove('active');
        } else {
          filters.selectedThemen.push(thema);
          chip.classList.add('active');
        }
      }

      updateMap();
    });
  });
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
// MARKER
// ============================================================
function createMarkerForStation(station) {
  function createMarker(w, h, expW, expH) {
    const markerHtml = `
      <div class="foto-marker" data-station-id="${station.id}" style="width:${w}px;height:${h}px;">
        <div class="foto-marker-thumb" style="width:${w}px;height:${h}px;">
          ${station.foto
            ? `<img src="${station.foto}" alt="${station.name}" style="width:${w}px;height:${h}px;object-fit:cover;" />`
            : `<div class="foto-placeholder"><span>${station.name}</span></div>`}
        </div>
        <div class="foto-marker-expanded" style="width:${expW}px;">
          ${station.foto
            ? `<img src="${station.foto}" alt="${station.name}" style="width:${expW}px;height:${expH}px;object-fit:contain;background:#fff;" />`
            : `<div class="foto-placeholder large"><span>${station.name}</span></div>`}
          <div class="foto-marker-label">${station.name}</div>
        </div>
      </div>
    `;

    const icon = L.divIcon({
      html: markerHtml,
      className: '',
      iconSize: [w, h],
      iconAnchor: [w / 2, h / 2]
    });

    return L.marker(station.coords, { icon });
  }

  if (station.foto) {
    const img = new Image();

    img.onload = () => {
      const THUMB_W = 60;
      const ratio = img.naturalHeight / img.naturalWidth;
      const THUMB_H = Math.round(THUMB_W * ratio);
      const EXP_W = 180;
      const EXP_H = Math.round(EXP_W * ratio);

      const marker = createMarker(THUMB_W, THUMB_H, EXP_W, EXP_H);
      attachEvents(marker, station);
      marker.addTo(map);
      markerObjects.push({ station, marker });
      updateMap();
    };

    img.src = station.foto;
  } else {
    const marker = createMarker(44, 44, 180, 180);
    attachEvents(marker, station);
    marker.addTo(map);
    markerObjects.push({ station, marker });
  }
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

  if (!filters.showFahrradroute) {
    clearCurrentRoute();
    removeCurrentMarkerHighlight();
  }
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

function openSingleCard(station) {
  const container = document.getElementById('content');
  container.innerHTML = '';
  addCard(station);
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
// NAV-MENÜ
// ============================================================
const navMenuToggle = document.getElementById('nav-menu-toggle');
const navMenuPanel = document.getElementById('nav-menu-panel');

navMenuToggle.addEventListener('click', () => {
  navMenuPanel.classList.toggle('hidden');
  navMenuToggle.textContent = navMenuPanel.classList.contains('hidden')
    ? 'Navigation ▾'
    : 'Navigation ▴';
});

// ============================================================
// ETAPPEN-NAVIGATION
// ============================================================
let activeNav = false;
let navIndex = 0;
let watchId = null;
let userLatLng = null;
let userMarker = null;
let currentRouteControl = null;
let lastArrivalStationId = null;

const ARRIVAL_DISTANCE = 35;

const startNavButton = document.getElementById('start-nav');
const nextStopButton = document.getElementById('next-stop');
const stopNavButton = document.getElementById('stop-nav');
const navStatus = document.getElementById('nav-status');

function updateNavStatus(text) {
  navStatus.textContent = text;
}

function getDistanceInMeters(a, b) {
  return map.distance(a, b);
}

function clearCurrentRoute() {
  if (currentRouteControl) {
    map.removeControl(currentRouteControl);
    currentRouteControl = null;
  }
}

function removeCurrentMarkerHighlight() {
  markerObjects.forEach(obj => {
    const el = obj.marker.getElement();
    if (!el) return;
    const markerRoot = el.querySelector('.foto-marker');
    if (markerRoot) {
      markerRoot.classList.remove('foto-marker-current');
    }
  });
}

function highlightCurrentTarget(targetStation) {
  removeCurrentMarkerHighlight();

  markerObjects.forEach(obj => {
    if (obj.station.id === targetStation.id) {
      const el = obj.marker.getElement();
      if (!el) return;
      const markerRoot = el.querySelector('.foto-marker');
      if (markerRoot) {
        markerRoot.classList.add('foto-marker-current');
      }
    }
  });
}

function createUserMarker(latlng) {
  return L.marker(latlng, {
    icon: L.divIcon({
      className: '',
      html: `<div class="user-location-marker"></div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    })
  });
}

function updateUserMarker(lat, lng) {
  userLatLng = L.latLng(lat, lng);

  if (!userMarker) {
    userMarker = createUserMarker(userLatLng).addTo(map);
  } else {
    userMarker.setLatLng(userLatLng);
  }
}

function getCurrentTargetStation() {
  return routeStations[navIndex] || null;
}

function drawRouteToCurrentStation() {
  if (!activeNav) return;

  const target = getCurrentTargetStation();
  if (!target) return;

  clearCurrentRoute();

  let startPoint;

  if (navIndex === 0) {
    if (!userLatLng) return;
    startPoint = userLatLng;
  } else {
    const prev = routeStations[navIndex - 1];
    startPoint = L.latLng(prev.coords[0], prev.coords[1]);
  }

  const targetLatLng = L.latLng(target.coords[0], target.coords[1]);

  currentRouteControl = L.Routing.control({
    waypoints: [startPoint, targetLatLng],
    router: L.Routing.osrmv1({
      serviceUrl: 'https://routing.openstreetmap.de/routed-bike/route/v1'
    }),
    lineOptions: {
      styles: [{ color: 'black', weight: 4 }]
    },
    addWaypoints: false,
    draggableWaypoints: false,
    fitSelectedRoutes: true,
    show: false,
    createMarker: () => null
  }).addTo(map);

  highlightCurrentTarget(target);
}

function checkArrival() {
  if (!activeNav || !userLatLng) return;

  const target = getCurrentTargetStation();
  if (!target) return;

  const targetLatLng = L.latLng(target.coords[0], target.coords[1]);
  const distance = getDistanceInMeters(userLatLng, targetLatLng);

  if (distance <= ARRIVAL_DISTANCE) {
    nextStopButton.disabled = false;
    updateNavStatus(`Angekommen: ${target.name}`);

    if (lastArrivalStationId !== target.id) {
      openSingleCard(target);
      lastArrivalStationId = target.id;
    }

    clearCurrentRoute();
  } else {
    nextStopButton.disabled = true;
    updateNavStatus(`${target.name} · ${Math.round(distance)} m entfernt`);
  }
}

function startNavigation() {
  if (!filters.showFahrradroute) {
    filters.showFahrradroute = true;
    const routeChip = document.querySelector('#map-themen-bar .themen-chip[data-route="true"]');
    routeChip?.classList.add('active');
  }

  if (!navigator.geolocation) {
    alert('Ortung wird auf diesem Gerät nicht unterstützt.');
    return;
  }

  navMenuPanel.classList.remove('hidden');
  navMenuToggle.textContent = 'Navigation ▴';

  activeNav = true;
  navIndex = 0;
  lastArrivalStationId = null;
  nextStopButton.disabled = true;
  updateNavStatus('Standort wird gesucht ...');

  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
  }

  watchId = navigator.geolocation.watchPosition(
    position => {
      const { latitude, longitude } = position.coords;
      updateUserMarker(latitude, longitude);

      const target = getCurrentTargetStation();
      if (!target) return;

      drawRouteToCurrentStation();
      checkArrival();
    },
    error => {
      console.error(error);
      updateNavStatus('Ortung nicht verfügbar');
      alert('Bitte Standortfreigabe erlauben, damit die Navigation funktioniert.');
    },
    {
      enableHighAccuracy: true,
      maximumAge: 3000,
      timeout: 10000
    }
  );
}

function goToNextStation() {
  if (!activeNav) return;

  navIndex += 1;
  nextStopButton.disabled = true;
  lastArrivalStationId = null;

  if (navIndex >= routeStations.length) {
    updateNavStatus('Route abgeschlossen');
    clearCurrentRoute();
    removeCurrentMarkerHighlight();
    return;
  }

  drawRouteToCurrentStation();
  checkArrival();
}

function stopNavigation() {
  activeNav = false;
  navIndex = 0;
  lastArrivalStationId = null;

  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }

  clearCurrentRoute();
  removeCurrentMarkerHighlight();

  if (userMarker) {
    map.removeLayer(userMarker);
    userMarker = null;
  }

  userLatLng = null;
  nextStopButton.disabled = true;
  updateNavStatus('Navigation aus');
}

startNavButton.addEventListener('click', startNavigation);
nextStopButton.addEventListener('click', goToNextStation);
stopNavButton.addEventListener('click', stopNavigation);

// ============================================================
// START
// ============================================================
setupThemenBar();
updateMap();
