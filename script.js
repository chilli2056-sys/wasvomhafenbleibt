const map = L.map('map', {
  doubleClickZoom: false,
  maxZoom: 20
}).setView([53.09, 8.78], 14);

L.tileLayer(
  'https://maps.geoapify.com/v1/tile/toner/{z}/{x}/{y}.png?apiKey=f4be76cd0a3340e893714aa6d9052957',
  {
    attribution: 'Powered by <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> | \u00a9 <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> \u00a9 <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
    maxZoom: 20,
    crossOrigin: true
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

// ============================================================
// MARKER
// ============================================================

function createMarkerForStation(station) {
  const zoom = map.getZoom();
  const SIZE = Math.min(Math.max((zoom - 12) * 8, 60), 100);
  const ratio = station._imgRatio || 0.75;
  const sqrtRatio = Math.sqrt(ratio);
  const W = Math.round(SIZE / sqrtRatio);
  const H = Math.round(SIZE * sqrtRatio);
  const SPITZE_H = Math.round(SIZE * 0.3);
  const TOTAL = H + SPITZE_H;

  const foto = station.foto
    ? `<img src="${station.foto}" style="width:${W}px;height:${H}px;object-fit:cover;display:block;pointer-events:none;" />`
    : `<div style="width:${W}px;height:${H}px;background:#ccc;display:flex;align-items:center;justify-content:center;pointer-events:none;">
        <span style="font-size:8px;text-align:center;padding:4px;color:#555;">${station.name}</span>
       </div>`;

  const pfeil = `<svg width="${W}" height="${SPITZE_H}" viewBox="0 0 ${W} ${SPITZE_H}" xmlns="http://www.w3.org/2000/svg" style="display:block;pointer-events:none;">
    <polygon points="0,0 ${W},0 ${W/2},${SPITZE_H}" fill="#9a3f2f"/>
  </svg>`;

  return L.divIcon({
    html: `${foto}${pfeil}`,
    className: 'foto-pin-marker',
    iconSize:   [W, TOTAL],
    iconAnchor: [W / 2, TOTAL]
  });
}

function attachEvents(marker, station) {
  marker.on('click', e => {
    L.DomEvent.stopPropagation(e);
    addCard(station);
  });
}

// Bilder vorladen → Ratios → Marker bauen
const stationsMitFoto = stations.filter(s => s.foto);
let geladen = 0;

function markerSetupStarten() {
  stations.forEach(station => {
    const icon = createMarkerForStation(station);
    const marker = L.marker(station.coords, { icon });
    attachEvents(marker, station);
    marker.addTo(map);
    markerObjects.push({ station, marker });
  });
  updateMap();
}

if (stationsMitFoto.length === 0) {
  markerSetupStarten();
} else {
  stationsMitFoto.forEach(station => {
    const img = new Image();
    img.onload = () => {
      station._imgRatio = img.naturalHeight / img.naturalWidth;
      geladen++;
      if (geladen === stationsMitFoto.length) markerSetupStarten();
    };
    img.onerror = () => {
      geladen++;
      if (geladen === stationsMitFoto.length) markerSetupStarten();
    };
    img.src = station.foto;
  });
}

// Bei jedem Zoom alle Icons neu setzen
map.on('zoomend', () => {
  markerObjects.forEach(obj => {
    const newIcon = createMarkerForStation(obj.station);
    obj.marker.setIcon(newIcon);
  });
  updateMap();
});

function updateMap() {
  const filtered = filterStations(stations);
  markerObjects.forEach(obj => {
    const visible = filtered.some(s => s.id === obj.station.id);
    if (visible) {
      if (!map.hasLayer(obj.marker)) obj.marker.addTo(map);
    } else {
      if (map.hasLayer(obj.marker)) map.removeLayer(obj.marker);
    }
  });
}

// ============================================================
// INFO-KARTEN
// ============================================================
// ============================================================
// INFO-PANEL
// ============================================================

const infoPanel        = document.getElementById('info-panel');
const infoPanelClose   = document.getElementById('info-close');
const infoFotoImg      = document.getElementById('info-foto-img');
const infoFotoZaehler  = document.getElementById('info-foto-zaehler');
const infoPrev         = document.getElementById('info-foto-prev');
const infoNext         = document.getElementById('info-foto-next');
const infoVollbild     = document.getElementById('info-foto-vollbild');
const infoName         = document.getElementById('info-name');
const infoBeschreibung = document.getElementById('info-beschreibung');
const infoThemen       = document.getElementById('info-themen');
const infoRouten       = document.getElementById('info-routen');
const infoZeitspannen  = document.getElementById('info-zeitspannen');
const infoKoordinaten  = document.getElementById('info-koordinaten');

const vollbildOverlay  = document.getElementById('info-vollbild-overlay');
const vollbildImg      = document.getElementById('info-vollbild-img');
const vollbildClose    = document.getElementById('info-vollbild-close');
const vollbildPrev     = document.getElementById('info-vollbild-prev');
const vollbildNext     = document.getElementById('info-vollbild-next');

let aktiveFotos = [];
let aktiverFotoIndex = 0;

function aktualisiereFoto() {
  if (aktiveFotos.length === 0) {
    infoFotoImg.style.display = 'none';
    document.getElementById('info-foto-controls').style.display = 'none';
    return;
  }

  infoFotoImg.style.display = 'block';
  infoFotoImg.src = aktiveFotos[aktiverFotoIndex];
  vollbildImg.src = aktiveFotos[aktiverFotoIndex];

  const mehrere = aktiveFotos.length > 1;
  document.getElementById('info-foto-controls').style.display = mehrere ? 'flex' : 'none';
  infoPrev.style.display = mehrere ? 'flex' : 'none';
  infoNext.style.display = mehrere ? 'flex' : 'none';
}

let aktuelleStationId = null;

function addCard(station) {
  aktuelleStationId = station.id;

  aktiveFotos = station.fotos && station.fotos.length > 0
    ? station.fotos
    : (station.foto ? [station.foto] : []);

  aktiverFotoIndex = 0;

  infoName.textContent = station.name || '';
  infoBeschreibung.textContent = (typeof texte !== 'undefined' && texte[station.id]) ? texte[station.id] : (station.info || '');
  infoThemen.textContent = station.themen ? station.themen.join(', ') : '';
  infoRouten.textContent = station.routen ? 'Routen: ' + station.routen.join(', ') : '';
  infoZeitspannen.textContent = station.zeitspannen ? station.zeitspannen.join(', ') : '';
  if (infoKoordinaten) infoKoordinaten.textContent = station.coords
    ? station.coords[0].toFixed(4) + ' N / ' + station.coords[1].toFixed(4) + ' O'
    : '';

  aktualisiereFoto();

  // Kommentare zurücksetzen
  if (typeof kommentareZuruecksetzen === 'function') kommentareZuruecksetzen(station.id);

  infoPanel.classList.add('open');
}

infoPanelClose.addEventListener('click', () => {
  infoPanel.classList.remove('open');
});

// Swipe auf dem Foto
let swipeStartX = 0;
infoFotoImg.addEventListener('touchstart', e => {
  swipeStartX = e.touches[0].clientX;
}, { passive: true });
infoFotoImg.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - swipeStartX;
  if (Math.abs(dx) > 40 && aktiveFotos.length > 1) {
    aktiverFotoIndex = dx < 0
      ? (aktiverFotoIndex + 1) % aktiveFotos.length
      : (aktiverFotoIndex - 1 + aktiveFotos.length) % aktiveFotos.length;
    aktualisiereFoto();
  }
}, { passive: true });

infoPrev.addEventListener('click', () => {
  aktiverFotoIndex = (aktiverFotoIndex - 1 + aktiveFotos.length) % aktiveFotos.length;
  aktualisiereFoto();
});

infoNext.addEventListener('click', () => {
  aktiverFotoIndex = (aktiverFotoIndex + 1) % aktiveFotos.length;
  aktualisiereFoto();
});

infoVollbild.addEventListener('click', () => {
  vollbildImg.src = aktiveFotos[aktiverFotoIndex];
  vollbildOverlay.classList.add('open');
});

vollbildClose.addEventListener('click', () => {
  vollbildOverlay.classList.remove('open');
});

vollbildPrev.addEventListener('click', () => {
  aktiverFotoIndex = (aktiverFotoIndex - 1 + aktiveFotos.length) % aktiveFotos.length;
  aktualisiereFoto();
  vollbildImg.src = aktiveFotos[aktiverFotoIndex];
});

vollbildNext.addEventListener('click', () => {
  aktiverFotoIndex = (aktiverFotoIndex + 1) % aktiveFotos.length;
  aktualisiereFoto();
  vollbildImg.src = aktiveFotos[aktiverFotoIndex];
});

// ============================================================
// KOMMENTARE
// ============================================================

const SUPABASE_URL = 'https://frxclqyeimupmaiuvndl.supabase.co';
const SUPABASE_KEY = 'sb_publishable_zeBajWW8Ab2TjAYboip_yg_il422nwf';

const ADMIN_PW = 'hafen2026';
let istAdmin = sessionStorage.getItem('hafen_admin') === '1';

(function() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('admin') === ADMIN_PW) {
    sessionStorage.setItem('hafen_admin', '1');
    istAdmin = true;
    window.history.replaceState({}, '', window.location.pathname);
  }
})();

async function sbFetch(path, options = {}) {
  const res = await fetch(SUPABASE_URL + '/rest/v1/' + path, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY,
      'Content-Type': 'application/json',
      'Prefer': options.prefer || ''
    },
    ...options
  });
  if (!res.ok) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

const KommentarStore = {
  async laden(stationId) {
    const data = await sbFetch(`kommentare?station_id=eq.${stationId}&order=erstellt_am.asc`);
    return data || [];
  },
  async speichern(stationId, k) {
    await sbFetch('kommentare', {
      method: 'POST',
      prefer: 'return=minimal',
      body: JSON.stringify({
        station_id: stationId,
        text: k.text,
        name: k.name,
        datum: k.datum,
        freigegeben: k.freigegeben
      })
    });
  },
  async freischalten(id) {
    await sbFetch(`kommentare?id=eq.${id}`, {
      method: 'PATCH',
      prefer: 'return=minimal',
      body: JSON.stringify({ freigegeben: true })
    });
  },
  async loeschen(id) {
    await sbFetch(`kommentare?id=eq.${id}`, {
      method: 'DELETE',
      prefer: 'return=minimal'
    });
  }
};

let kommentareSichtbar = false;

const POSITIONEN = [
  { top: '8%',  left: '4%',   rot: -2   },
  { top: '10%', right: '4%',  rot: 1.5  },
  { top: '45%', left: '3%',   rot: 1    },
  { top: '50%', right: '3%',  rot: -1.5 },
  { top: '25%', left: '30%',  rot: 2    },
  { top: '65%', left: '20%',  rot: -1   },
  { top: '30%', right: '20%', rot: 0.5  },
  { top: '70%', right: '15%', rot: -2   },
];

async function kommentareZuruecksetzen(stationId) {
  kommentareSichtbar = false;
  const zettel = document.getElementById('kommentar-notizzettel');
  const toggleBtn = document.getElementById('kommentar-foto-toggle');
  const anzahl = document.getElementById('kommentar-anzahl');
  if (!zettel) return;

  zettel.classList.remove('sichtbar');
  if (toggleBtn) toggleBtn.classList.remove('aktiv');

  const alle = await KommentarStore.laden(stationId);
  const freigegeben = alle.filter(k => k.freigegeben);
  const pending = alle.filter(k => !k.freigegeben);
  const n = freigegeben.length + (istAdmin ? pending.length : 0);
  if (anzahl) anzahl.textContent = n > 0 ? n + (n === 1 ? ' Kommentar' : ' Kommentare') : '';
}

async function renderKommentare(stationId) {
  const zettel = document.getElementById('kommentar-notizzettel');
  if (!zettel) return;
  zettel.innerHTML = '';

  const alle = await KommentarStore.laden(stationId);
  const freigegeben = alle.filter(k => k.freigegeben);
  const pending = alle.filter(k => !k.freigegeben);
  const anzeigen = [...freigegeben, ...(istAdmin ? pending : [])];

  anzeigen.forEach((k, i) => {
    const pos = POSITIONEN[i % POSITIONEN.length];
    const z = document.createElement('div');
    z.className = 'notizzettel';
    if (!k.freigegeben) z.style.opacity = '0.55';

    Object.entries(pos).forEach(([prop, val]) => {
      if (prop === 'rot') z.style.transform = `rotate(${val}deg)`;
      else z.style[prop] = val;
    });

    z.innerHTML = `<div class="notizzettel-text">${k.text}</div>
      <div class="notizzettel-meta"><span>${k.name}</span><span>${k.datum}</span></div>
      ${!k.freigegeben && istAdmin ? `
        <div style="display:flex;gap:4px;margin-top:4px;">
          <button class="nz-freischalten" data-id="${k.id}">✓</button>
          <button class="nz-loeschen" data-id="${k.id}">✕</button>
        </div>` : ''}
      ${k.freigegeben && istAdmin ? `<button class="nz-loeschen" data-id="${k.id}" style="margin-top:4px;">✕</button>` : ''}`;

    z.addEventListener('click', () => z.classList.toggle('expanded'));
    zettel.appendChild(z);
  });

  zettel.querySelectorAll('.nz-freischalten').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.stopPropagation();
      await KommentarStore.freischalten(btn.dataset.id);
      renderKommentare(stationId);
      kommentareZuruecksetzen(stationId);
    });
  });

  zettel.querySelectorAll('.nz-loeschen').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.stopPropagation();
      await KommentarStore.loeschen(btn.dataset.id);
      renderKommentare(stationId);
      kommentareZuruecksetzen(stationId);
    });
  });
}

// Sprechblasen-Toggle
const kommentarFotoToggle = document.getElementById('kommentar-foto-toggle');
if (kommentarFotoToggle) {
  kommentarFotoToggle.addEventListener('click', () => {
    if (!aktuelleStationId) return;
    kommentareSichtbar = !kommentareSichtbar;
    document.getElementById('kommentar-notizzettel').classList.toggle('sichtbar', kommentareSichtbar);
    kommentarFotoToggle.classList.toggle('aktiv', kommentareSichtbar);
    if (kommentareSichtbar) renderKommentare(aktuelleStationId);
  });
}

// Kommentar senden
document.getElementById('kommentar-senden').addEventListener('click', async () => {
  const text = document.getElementById('kommentar-text').value.trim();
  const name = document.getElementById('kommentar-name').value.trim() || 'Anonym';
  if (!text || !aktuelleStationId) return;

  await KommentarStore.speichern(aktuelleStationId, {
    text,
    name,
    datum: new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' }),
    freigegeben: istAdmin
  });

  document.getElementById('kommentar-text').value = '';
  document.getElementById('kommentar-name').value = '';

  document.getElementById('kommentar-text').placeholder = istAdmin
    ? '✓ Veröffentlicht.'
    : '✓ Danke! Wird nach Freischaltung angezeigt.';
  setTimeout(() => {
    document.getElementById('kommentar-text').placeholder = 'Kommentar schreiben…';
  }, 3000);

  await kommentareZuruecksetzen(aktuelleStationId);
  if (kommentareSichtbar) renderKommentare(aktuelleStationId);
});

// ============================================================
// START
// ============================================================

setupThemenBar();
updateMap();
