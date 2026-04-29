// ============================================================
// 📍 STATIONEN – zentrale Datei für Karte + Archiv
//    Jede Station kann mehreren Themen, Routen und Zeitspannen
//    zugeordnet werden.
// ============================================================
const stations = [
  {
    id: 1,
    name: "Löwenkopf an der Wilhelm-Kaisen-Brücke",
    coords: [53.073124, 8.806198],
    info: "Startpunkt an der Weser.",
    foto: "Löwe.JPG",
    themen: ["kolonialismus"],
    routen: ["fahrradroute"],
    zeitspannen: ["1884-1918"]
  },
  {
    id: 2,
    name: "Ehemalige Kellogg's-Fabrik",
    coords: [53.082816, 8.781034],
    info: "Überseeinsel Bereich.",
    foto: "fotos/Kelloggs.JPG",
    themen: ["industrie"],
    routen: ["fahrradroute", "einzelort"],
    zeitspannen: ["nachkriegszeit", "gegenwart"]
  },
  {
    id: 3,
    name: "Aussichtsplattform Waller Sand",
    coords: [53.102788, 8.751673],
    info: "Aussichtsplattform am Wasser.",
    foto: "",
    themen: ["kolonialismus"],
    routen: ["fahrradroute"],
    zeitspannen: ["gegenwart"]
  },
  {
    id: 4,
    name: "Molenfeuer Überseehafen Süd (Mäuseturm)",
    coords: [53.106128, 8.747815],
    info: "Markanter Turm am Hafeneingang.",
    foto: "fotos/Molenturm.JPG",
    themen: ["kolonialismus", "industrie"],
    routen: ["fahrradroute"],
    zeitspannen: ["1884-1918", "gegenwart"]
  },
  {
    id: 5,
    name: "Aussichtspunkt",
    coords: [53.105905, 8.755237],
    info: "Blick über den Hafen.",
    foto: "",
    themen: ["industrie"],
    routen: ["fahrradroute"],
    zeitspannen: ["gegenwart"]
  },
  {
    id: 6,
    name: "Hafencasino",
    coords: [53.096992, 8.773187],
    info: "Sozialer Treffpunkt am Hafen.",
    foto: "",
    themen: ["nationalsozialismus", "industrie"],
    routen: ["fahrradroute", "einzelort"],
    zeitspannen: ["1933-1945", "nachkriegszeit"]
  },
  {
    id: 7,
    name: "Altes Hafenbecken (Rolandmühle)",
    coords: [53.097389, 8.773819],
    info: "Historisches Hafenbecken.",
    foto: "fotos/Hafenbecken.JPG",
    themen: ["kolonialismus", "industrie"],
    routen: ["fahrradroute"],
    zeitspannen: ["1884-1918", "1933-1945"]
  },
  {
    id: 8,
    name: "Ulrichsschuppen Ziegelmauerwerk",
    coords: [53.105780, 8.762667],
    info: "Gedenkort im Hafen.",
    foto: "",
    themen: ["nationalsozialismus"],
    routen: ["fahrradroute", "einzelort"],
    zeitspannen: ["1933-1945"]
  },
  {
    id: 9,
    name: "Blick auf den Werfthafen Bremen",
    coords: [53.113972, 8.743349],
    info: "Endpunkt mit Blick auf den Werfthafen.",
    foto: "fotos/Gästehaus.JPG",
    themen: ["industrie"],
    routen: ["fahrradroute"],
    zeitspannen: ["gegenwart"]
  }
];

