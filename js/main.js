// javascript by Trever J. Bruhn 2022

//Initialize map and set view to coords and zoom level
var map = L.map("map").setView([44.0, -123.0], 10);

//Add tile layer
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
}).addTo(map);
