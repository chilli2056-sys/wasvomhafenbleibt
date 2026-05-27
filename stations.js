// ============================================================
// 📍 STATIONEN – zentrale Datei für Karte + Archiv
//    Jede Station kann mehreren Themen, Routen und Zeitspannen
//    zugeordnet werden.
//
//    foto:  erstes/einziges Foto (für Marker + Archiv-Kachel)
//    fotos: alle Fotos für die Slideshow im Info-Panel
//           (weglassen oder leer lassen wenn nur ein Foto)
// ============================================================

const stations = [
  {
    id: 1,
    name: "Löwenkopf an der Wilhelm-Kaisen-Brücke",
    coords: [53.073124, 8.806198],
    info: "Startpunkt an der Weser.",
    foto: "fotos/loewe.JPG",
    fotos: [
      "fotos/loewe.JPG"
    ],
    themen: ["kolonialismus"],
    routen: ["fahrradroute"],
    zeitspannen: ["1884-1918"]
  },
  {
    id: 2,
    name: "Ehemalige Kellogg's-Fabrik",
    coords: [53.082816, 8.781034],
    info: "Überseeinsel Bereich.",
    foto: "fotos/Kelloggs/kelloggs1.JPG",
    fotos: [
      "fotos/Kelloggs/kelloggs1.JPG",
      "fotos/Kelloggs/kelloggs2.JPG"
    ],
    themen: ["arbeitsorte"],
    routen: ["fahrradroute", "einzelort"],
    zeitspannen: ["nachkriegszeit", "gegenwart"]
  },
  {
    id: 3,
    name: "Aussichtsplattform Waller Sand",
    coords: [53.102788, 8.751673],
    info: "Aussichtsplattform am Wasser.",
    foto: "",
    fotos: [],
    themen: ["kolonialismus"],
    routen: ["fahrradroute"],
    zeitspannen: ["gegenwart"]
  },
  {
    id: 4,
    name: "Molenfeuer Überseehafen Süd (Mäuseturm)",
    coords: [53.106128, 8.747815],
    info: "Markanter Turm am Hafeneingang.",
    foto: "fotos/molenturm/molenturm1.JPG",
    fotos: [
      "fotos/molenturm/molenturm1.JPG",
      "fotos/Molenturm/molenturm2.JPG",
      "fotos/Molenturm/molenturm3.JPG"
    ],
    themen: ["kolonialismus", "industrie"],
    routen: ["fahrradroute"],
    zeitspannen: ["1884-1918", "gegenwart"]
  },
  {
    id: 5,
    name: "ehemaliges Kühlhaus",
    coords: [53.105905, 8.755237],
    info: "Blick über den Hafen.",
    foto: "fotos/Kuehlhaus/Kuehlhaus.JPG",
    fotos: ["fotos/Kuehlhaus/Kuehlhaus.JPG",],
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
    fotos: [],
    themen: ["nationalsozialismus", "industrie"],
    routen: ["fahrradroute", "einzelort"],
    zeitspannen: ["1933-1945", "nachkriegszeit"]
  },
  {
    id: 7,
    name: "Altes Hafenbecken (Rolandmühle)",
    coords: [53.097389, 8.773819],
    info: "Historisches Hafenbecken.",
    foto: "fotos/Hafenbecken/Hafenbecken1.JPG",
    fotos: [
      "fotos/Hafenbecken/Hafenbecken1.JPG",
      "fotos/Hafenbecken/Hafenbecken2.JPG",
      "fotos/Hafenbecken/Hafenbecken3.JPG",
      "fotos/Hafenbecken/Hafenbecken4.JPG",
      "fotos/Hafenbecken/Hafenbecken5.JPG",
      "fotos/Hafenbecken/Hafenbecken6.JPG"
      
    ],
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
    fotos: [],
    themen: ["nationalsozialismus"],
    routen: ["fahrradroute", "einzelort"],
    zeitspannen: ["1933-1945"]
  },
  {
    id: 9,
    name: "Blick auf den Werfthafen Bremen",
    coords: [53.113972, 8.743349],
    info: "Endpunkt mit Blick auf den Werfthafen.",
    foto: "fotos/gaestehaus.JPG",
    fotos: [
      "fotos/gaestehaus.JPG"
    ],
    themen: ["industrie"],
    routen: ["fahrradroute"],
    zeitspannen: ["gegenwart"]
  },

  {
    id: 10,
    name: "Gleise Überseehafen",
    coords: [53.09562608474965, 8.773603436532781],
    info: "ehemalige Gleise",
    foto: "fotos/Gleisespeicher/Gleise2.JPG",
    fotos: [
      "fotos/Gleisespeicher/Gleise2.JPG",
      "fotos/Gleisespeicher/Gleise1.JPG"
    ],
    themen: ["gleise"],
    routen: ["fahrradroute"],
    zeitspannen: ["gegenwart"]
  },


  {
    id: 11,
    name: "Atlas Werft",
    coords: [53.09092176034009, 8.766275630771801],
    info: "ehemalige Gleise",
    foto: "fotos/Werften/Gleise2.JPG",
    fotos: [
      "fotos/Werften/Gleise2.JPG",
      "fotos/Werften/Gleise1.JPG"
    ],
    themen: ["industrie"],
    routen: ["fahrradroute"],
    zeitspannen: ["gegenwart"]
  },

  {
    id: 12,
    name: "Gleissysteme ehemaliger Überseehafen",
    coords: [53.098333863533085, 8.766805371713273],
    info: "ehemalige Gleise",
    foto: "fotos/Gleisespeicher/Gleisehfk1.JPG",
    fotos: [
      "fotos/Gleisespeicher/Gleisehfk1.JPG",
      "fotos/Gleisespeicher/Gleisehfk.JPG"
    ],
    themen: ["industrie"],
    routen: ["fahrradroute"],
    zeitspannen: ["gegenwart"]
  }
];
