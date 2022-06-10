// javascript by Trever J. Bruhn 2022

// map of data from mega cities geojson data

//function to instantiate leaflet map
function createMap() {
  //create the map
  var map = L.map("map", {
    center: [20, 0],
    zoom: 2,
  });

  //add OSM base tile layer
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
  }).addTo(map);

  //call the getData function
  getData(map);
}

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
  //scale factor to adjust symbolsize evenly
  var scaleFactor = 50;
  //area based on scalefactor and attValue
  var area = attValue * scaleFactor;
  //radius calculated based on area
  var radius = Math.sqrt(area / Math.PI);

  return radius;
}

// function to convert markers to circle markers
function pointToLayer(feature, latlng) {
  //set an attribute to be used to viz as proportional
  var attribute = "Pop_2015";

  //create marker options
  var geojsonMarkerOptions = {
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8,
  };
  //determine the value for the selected attribute for each feature
  var attValue = Number(feature.properties[attribute]);

  //give each circle marker a radius based on its value
  geojsonMarkerOptions.radius = calcPropRadius(attValue);

  //create the circle marker layer
  var layer = L.circleMarker(latlng, geojsonMarkerOptions);

  //adds the popups
  var popupContent = feature.properties.City;

  var panelContent = "<p><b>City:</b> " + feature.properties.City + "</p>";

  //add formatted year to string
  var year = attribute.split("_")[1];
  panelContent +=
    "<p><b>Population in " +
    year +
    ":</b> " +
    feature.properties[attribute] +
    " million</p>";

  //bind the popups to the circle marker add offset to move them above
  layer.bindPopup(popupContent, {
    offset: new L.Point(0, -geojsonMarkerOptions.radius),
    closeButton: false,
  });

  //event listeners to open popup on hover (no work on mobile)
  layer.on({
    mouseover: function () {
      this.openPopup();
    },
    mouseout: function () {
      this.closePopup();
    },
    //add side panel information using popup
    click: function () {
      $("#panel").html(panelContent);
    },
  });

  //return the circly marker to the L.geojson pointToLayer option
  return layer;
}

//create and style circle markers for point features
function createPropSymbols(data, map) {
  //adds the points as styled circles
  L.geoJson(data, {
    pointToLayer: pointToLayer,
  }).addTo(map);
}

function getData(map) {
  //load the data
  $.ajax("data/MegaCities.geojson", {
    datatype: "json",
    success: function (response) {
      //call function to create proportional symbols
      createPropSymbols(response, map);
    },
  });
}

$(createMap); //recommended sytax replacement for $(document).ready(createMap)
