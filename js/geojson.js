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

// // Ex 2.3 original function to retrieve Data and place it on the map
// function getData(map) {
//   //load the data
//   $.ajax("data/MegaCities.geojson", {
//     datatype: "json",
//     success: function (response) {
//       //create leaflet geoJson layer and add to map
//       L.geoJson(response).addTo(map);
//     },
//   });
// }

// Ex 2.4 function to retrieve Data and place it on the map as vector circles rather than points
//EX 2.5 add popup to each feature
function onEachFeature(feature, layer) {
  // create html string with all properties
  var popupContent = "";
  if (feature.properties) {
    // loop to add feature property names and values to html string
    for (var property in feature.properties) {
      if (property === "City") {
        popupContent +=
          "<p>" + property + ": " + feature.properties[property] + "</p>";
      } else {
        popupContent +=
          "<p>" +
          property +
          ": " +
          feature.properties[property] +
          " million" +
          "</p>";
      }
    }
    layer.bindPopup(popupContent);
  }
}

function getData(map) {
  //load the data
  $.ajax("data/MegaCities.geojson", {
    datatype: "json",
    success: function (response) {
      //create marker options
      var geojsonMarkerOptions = {
        radius: 8,
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8,
      };

      //create a leaflet Geojson layer and add it to the map
      var geoJsonLayer = L.geoJson(response, {
        //each of the following are properties of the 'options' object being passed into L.geoJSON()

        //adds the points as styled circles
        pointToLayer: function (feature, latlng) {
          return L.circleMarker(latlng, geojsonMarkerOptions);
        },

        //adds the popups
        onEachFeature: onEachFeature,

        // //adds a filter to show only the cities with a pop>20mil
        // filter: function (feature, layer) {
        //   return feature.properties.Pop_2015 > 20;
        // },
      });

      //create a l.markercluster group layer
      var markers = L.markerClusterGroup();
      //add geojson to marker cluster layer
      markers.addLayer(geoJsonLayer);
      //add marker cluster layer to the map
      map.addLayer(markers);
    },
  });
}

$(createMap); //recommended sytax replacement for $(document).ready(createMap)
