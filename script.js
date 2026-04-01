const map = L.map('map', {
  doubleClickZoom: false
}).setView([53.09, 8.78], 14);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap-Mitwirkende'
}).addTo(map);

const routePoints = [
  [53.07311,8.806255],[53.074871,8.803839],[53.076732,8.80135],[53.078793,8.797563],
  [53.080423,8.792598],[53.081369,8.789036],[53.082213,8.782293],[53.08251,8.780861],
  [53.084384,8.779042],[53.084859,8.779597],[53.086114,8.781768],[53.087291,8.782472],
  [53.090322,8.776489],[53.092112,8.772757],[53.093033,8.770732],[53.09396,8.768699],
  [53.095732,8.765199],[53.097507,8.761555],[53.098263,8.760028],[53.098435,8.758863],
  [53.10124,8.754196],[53.103069,8.751096],[53.105697,8.748363],[53.104812,8.749167],
  [53.103078,8.753227],[53.10209,8.754497],[53.10046,8.757195],[53.101473,8.75892],
  [53.103619,8.754387],[53.10459,8.755123],[53.105905,8.755237],[53.10459,8.755123],
  [53.103619,8.754387],[53.100932,8.758892],[53.101307,8.762896],[53.097654,8.769908],
  [53.097949,8.774769],[53.100613,8.773263],[53.103737,8.767189],[53.106322,8.763789],
  [53.107855,8.763483],[53.109004,8.763582],[53.110638,8.75701],[53.110995,8.755505],
  [53.111899,8.753582],[53.11233,8.752529],[53.112252,8.751093],[53.112964,8.749954],
  [53.113935,8.748128],[53.113456,8.745779],[53.114351,8.743977],[53.113952,8.743308]
];

const filters = {
  selectedThemen: [],
  showFahrradroute: false
};

const markerObjects = [];

const routingControl = L.Routing.control({
  waypoints: routePoints.map(point => L.latLng(point)),
  router: L.Routing.osrmv1({
    serviceUrl: "https://routing.openstreetmap.de/routed-bike/route/v1"
  }),
  lineOptions: {
    styles: [{ color: 'black', weight: 4 }]
  },
  addWaypoints: false,
  draggableWaypoints: false,
  fitSelectedRoutes: false,
  show: false,
  createMarker: () => null
});

function setupThemenBar() {
  const chips = document.querySelectorAll('#map-themen-bar .themen-chip');

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      if (chip.dataset.route === 'true') {
        filters.showFahrradroute = !filters.showFahrradroute;
        chip.classList.toggle('active');
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

function createMarkerForStation(station) {
  function createMarker(w, h, expW, expH) {
    const markerHtml = `
      <div class="foto-marker" style="width:${w}px;height:${h}px;">
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

  if (filters.showFahrradroute) {
    if (!map.hasLayer(routingControl)) {
      routingControl.addTo(map);
    }
  } else {
    if (map.hasLayer(routingControl)) {
      map.removeLayer(routingControl);
    }
  }
}

function addCard(station) {
  const container = document.getElementById("content");
  const card = document.createElement("div");
  card.className = "card";

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

  card.querySelector(".close").onclick = () => card.remove();
  container.prepend(card);

  const isMin = sidebar.offsetHeight <= MIN_HEIGHT + 5;
  if (isMin) {
    sidebar.style.height = '25vh';
    toggleIcon.textContent = '▼';
    map.invalidateSize();
  }
}

const sidebar = document.getElementById("sidebar");
const handle = document.getElementById("resize-handle");
const toggleIcon = document.getElementById("toggle-icon");

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
  document.body.style.userSelect = "none";
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
  document.body.style.userSelect = "";

  if (sidebar.offsetHeight < MIN_HEIGHT + 20) {
    sidebar.style.height = MIN_HEIGHT + 'px';
    toggleIcon.textContent = '▲';
  }

  map.invalidateSize();
}

handle.addEventListener("mousedown", startDrag);
handle.addEventListener("touchstart", startDrag, { passive: true });
document.addEventListener("mousemove", onDrag);
document.addEventListener("touchmove", onDrag, { passive: true });
document.addEventListener("mouseup", stopDrag);
document.addEventListener("touchend", stopDrag);

toggleIcon.addEventListener("click", e => {
  e.stopPropagation();
  const isMin = sidebar.offsetHeight <= MIN_HEIGHT + 5;
  sidebar.style.height = isMin ? '40vh' : MIN_HEIGHT + 'px';
  toggleIcon.textContent = isMin ? '▼' : '▲';
  map.invalidateSize();
});

setupThemenBar();
updateMap();
