// javascript by Trever J. Bruhn 2022

// map of data from mega cities geojson data

//function to instantiate leaflet map
function createMap() {
  //create the map
  var map = L.map("map", {
    center: [44.15, -121],
    zoom: 7,
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
function pointToLayer(feature, latlng, attributes) {
  //set an attribute to be used to viz as proportional
  //here we ar setting it to be the first index of the atributes array
  var attribute = attributes[0];

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
  var year = attribute.split("-")[0];
  var month = attribute.split("-")[1];

  panelContent +=
    "<p><b>Precipitation in " +
    month +
    "/" +
    year +
    ":</b> " +
    feature.properties[attribute] +
    " inches</p>";

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

  //return the circle marker to the L.geojson pointToLayer option
  return layer;
}

//create and style circle markers for point features
function createPropSymbols(data, map, attributes) {
  //adds the points as styled circles
  L.geoJson(data, {
    pointToLayer: function (feature, latlng) {
      return pointToLayer(feature, latlng, attributes);
    },
  }).addTo(map);
}

//Resize proportional symbols according to attribute vals selected with seqControls
function updatePropSymbols(map, attribute) {
  map.eachLayer(function (layer) {
    if (layer.feature && layer.feature.properties[attribute]) {
      //access feature properties
      var props = layer.feature.properties;

      //update each feature's radius based on new attribute values
      var radius = calcPropRadius(props[attribute]);
      layer.setRadius(radius);

      //add city to popup content string
      var popupContent = props.City + " new";

      //add formatted panel content
      var panelContent = "<p><b>City:</b> " + props.City + "</p>";

      //add formatted year to string
      var year = attribute.split("-")[0];
      var month = attribute.split("-")[1];

      panelContent +=
        "<p><b>Precipitation in " +
        month +
        "/" +
        year +
        ":</b> " +
        props[attribute] +
        " inches</p>";
      //replace the layer popup
      layer.bindPopup(popupContent, {
        offset: new L.Point(0, -radius),
      });
      //replace the panel content
      $("#panel").html(panelContent);

      // //event listener to update panel content on click and stay at the index set by the sequence controls
      layer.on({
        click: function () {
          $("#panel").html(panelContent);
        },
      });
    }
  });
}

//create New sequence controls
function createSequenceControls(map, attributes) {
  //create range input element (the slider)
  $("#foot").append('<input class="range-slider" type="range">');
  //set slider attributes
  $(".range-slider").attr({
    max: 60,
    min: 0,
    value: 0,
    step: 1,
  });
  //add buttons
  $("#foot").append('<button class="skip" id="reverse">Reverse</button>');
  $("#foot").append('<button class="skip" id="forward">Skip</button>');
  //add icons for buttons
  $("#forward").html('<img src="img/skip_fwd.png">');
  $("#reverse").html('<img src="img/skip_rev.png">');

  //add event listeners for slider
  $(".range-slider").on("input", function () {
    //get a new index value
    var index = $(this).val();
    //pass new attribute to update symbols
    updatePropSymbols(map, attributes[index]);
  });

  //add eventlistener for buttons
  $(".skip").on("click", function () {
    //get the index value from the slider
    var index = $(".range-slider").val();
    //increment or decrement depending on button clicked
    if ($(this).attr("id") == "forward") {
      index++;
      //if past last attribute wrap to the first
      index = index > 60 ? 0 : index;
    } else if ($(this).attr("id") == "reverse") {
      index--;
      //if past first wrap to last
      index = index < 0 ? 60 : index;
    }
    //update slider
    $(".range-slider").val(index);
    console.log($(".range-slider").val());
    //pass new attribute to update symbols
    updatePropSymbols(map, attributes[index]);
  });
}

//builds an array of attributes from the data
function processData(data) {
  //empty array to hold attributes
  var attributes = [];

  //properties of the first feature in the dataset
  var properties = data.features[0].properties;

  //add each attribute name to the attributes array
  for (var attribute in properties) {
    //only take precipitation attributes
    if (attribute != "City" && attribute != "county_seat") {
      attributes.push(attribute);
    }
  }
  return attributes;
}

function getData(map) {
  //load the data
  $.ajax("data/OR_cities_precip.geojson", {
    datatype: "json",
    success: function (response) {
      //create an attributes array
      var attributes = processData(response);

      //call function to create proportional symbols
      createPropSymbols(response, map, attributes);
      //call function to create sequence controls
      createSequenceControls(map, attributes);
    },
  });
}

$(createMap); //recommended sytax replacement for $(document).ready(createMap)
