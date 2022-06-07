// javascript by Trever J. Bruhn 2022

//Initialize map and set view to coords and zoom level
var map = L.map("map").setView([39.75621, -104.99404], 13);

//Add tile layer
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
}).addTo(map);

//Simple geoJSON feature
var geojsonFeature = {
  type: "Feature",
  properties: {
    name: "Coors Field",
    amenity: "Baseball Stadium",
    popupContent: "This is where the Rockies play!",
    show_on_map: true,
  },
  geometry: {
    type: "Point",
    coordinates: [-104.99404, 39.75621],
  },
};

var someGeojsonFeature = {
  type: "Feature",
  properties: {
    name: "Busch Field",
    amenity: "Baseball Stadium",
    popupContent: "This is where the Rockies do not play!",
    show_on_map: false,
  },
  geometry: {
    type: "Point",
    coordinates: [-104.98404, 39.74621],
  },
};
var someFeatures = [geojsonFeature, someGeojsonFeature];

//Add the feature to the map
//L.geoJSON(geojsonFeature).addTo(map);

//Alternatively, we could create an empty GeoJSON layer and assign it to a variable so that we can add more features to it later.
var myLayer = L.geoJSON().addTo(map);
myLayer.addData(geojsonFeature);

//passing an array of vaild geoJSON objects
var myLines = [
  {
    type: "LineString",
    coordinates: [
      [-100, 40],
      [-105, 45],
      [-110, 55],
    ],
  },
  {
    type: "LineString",
    coordinates: [
      [-105, 40],
      [-110, 45],
      [-115, 55],
    ],
  },
];

//style options
//simple object that styles all paths the same
var myStyle = {
  color: "#ff7800",
  weight: "5",
  opacity: 0.65,
};

L.geoJSON(myLines, {
  style: myStyle,
}).addTo(map);

//pass a function that styles individual features based on properties
var states = [
  {
    type: "Feature",
    properties: { party: "Republican" },
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [-104.05, 48.99],
          [-97.22, 48.98],
          [-96.58, 45.94],
          [-104.03, 45.94],
          [-104.05, 48.99],
        ],
      ],
    },
  },
  {
    type: "Feature",
    properties: { party: "Democrat" },
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [-109.05, 41.0],
          [-102.06, 40.99],
          [-102.03, 36.99],
          [-109.04, 36.99],
          [-109.05, 41.0],
        ],
      ],
    },
  },
];

L.geoJSON(states, {
  style: function (feature) {
    switch (feature.properties.party) {
      case "Republican":
        return { color: "#ff0000" };
      case "Democrat":
        return { color: "#0000ff" };
    }
  },
}).addTo(map);
//End style function example

//Points are different
// use pointToLayer option to create a circle marker
var geojsonMarkerOptions = {
  radius: 8,
  fillColor: "#ff7800",
  color: "#000",
  weight: 1,
  opacity: 1,
  fillOpacity: 0.8,
};

// L.geoJSON(someGeojsonFeature, {
//   pointToLayer: function (feature, latlng) {
//     return L.circleMarker(latlng, geojsonMarkerOptions);
//   },
// }).addTo(map);

//onEachFeature
function onEachFeature(feature, layer) {
  //feature must have a property named popupContent
  if (feature.properties && feature.properties.popupContent) {
    layer.bindPopup(feature.properties.popupContent);
  }
}

L.geoJSON(someFeatures, {
  onEachFeature: onEachFeature,
}).addTo(map);

// //filters
// L.geoJSON(someFeatures, {
//   filter: function (feature, layer) {
//     return feature.properties.show_on_map;
//   },
// }).addTo(map);
