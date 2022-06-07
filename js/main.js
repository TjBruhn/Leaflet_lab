// javascript by Trever J. Bruhn 2022

//Initialize map and set view to coords and zoom level
var map = L.map("map").setView([51.505, -0.09], 13);

//Add tile layer
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
}).addTo(map);

// add marker to the map
var marker = L.marker([51.5, -0.09]).addTo(map);

//add circle - secon arg is radius in meters then passing style items as the last arg
var circle = L.circle([51.508, -0.11], {
  color: "red",
  fillColor: "#f03",
  fillOpacity: 0.5,
  radius: 500,
}).addTo(map);

//Add Polygon
var polygon = L.polygon([
  [51.509, -0.08],
  [51.503, -0.06],
  [51.51, -0.047],
]).addTo(map);

//Popups
//the openPopup opens on load
marker.bindPopup("<b>Hello World!</b><br>I am a popup.").openPopup();

//bindpopup opens on click
circle.bindPopup("I am circle.");
polygon.bindPopup("I am Polygon.");

//Popup on layers
var popup = L.popup()
  .setLatLng([51.513, -0.09])
  .setContent("I am a stand alone Popup")
  .openOn(map); //this auto closes other popups on page load and opens this one can use addTo() but it will leave the others open

//Dealing with events
function onMapClick(e) {
  popup
    .setLatLng(e.latlng)
    .setContent("You have Clicked the map at: " + e.latlng.toString())
    .openOn(map);
}
map.on("click", onMapClick);
