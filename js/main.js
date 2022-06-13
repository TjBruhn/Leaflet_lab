// javascript by Trever J. Bruhn 2022

// map of precipitation data for oregon cities from 01/2017-12/2020

//function to instantiate leaflet map
function createMap() {
  //create the map
  var map = L.map("map", {
    center: [44.15, -121],
    zoom: 7,
    minZoom: 7,
  });

  //add OSM base tile layer
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
  }).addTo(map);

  //call the getData function
  getData(map);
}

function AttributeSplit(attribute) {
  var monthList = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  this.year = attribute.split("-")[0];
  this.monthNum = attribute.split("-")[1];
  this.month = monthList[Number(this.monthNum) - 1];
}

// //function to create popups will ba called in pointToLayer and UpdatePropSymbols
// function createPopUp(properties, attribute, layer, radius) {
//   //split out month and year
//   var year = attribute.split("-")[0];
//   var month = attribute.split("-")[1];

//   //construct popup
//   var popupContent =
//     "<p><b>City:</b> " +
//     properties.City +
//     "</p>" +
//     "<p><b>Precipitation in " +
//     month +
//     "/" +
//     year +
//     ":</b> " +
//     properties[attribute] +
//     " inches</p>";

//   //bind the popups to the circle marker add offset to move them above
//   layer.bindPopup(popupContent, {
//     offset: new L.Point(0, -radius),
//   });
// }

//constructor function to create a popup object instead of a fuction like above
function Popup(properties, attribute, layer, radius) {
  this.properties = properties;
  this.attribute = attribute;
  this.layer = layer;
  this.year = attribute.split("-")[0];
  this.month = attribute.split("-")[1];
  this.precipitation = this.properties[attribute];
  this.content =
    "<p><b>City:</b> " +
    this.properties.City +
    "</p>" +
    "<p><b>Precipitation in " +
    this.month +
    "/" +
    this.year +
    ":</b> " +
    this.precipitation +
    " inches</p>";
  this.bindToLayer = function () {
    this.layer.bindPopup(this.content, {
      offset: new L.Point(0, -radius),
    });
  };
  this.panelContent = this.content;
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
  //here we ar setting it to be the first index of the attributes array
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

  //add the popups

  // //use this with the function version
  // createPopUp(
  //   feature.properties,
  //   attribute,
  //   layer,
  //   geojsonMarkerOptions.radius
  // );

  //Use this with the class version
  //create new popup
  var popup = new Popup(
    feature.properties,
    attribute,
    layer,
    geojsonMarkerOptions.radius
  );

  //add popup to circle marker
  popup.bindToLayer();

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
      $("#panel").html(popup.panelContent);
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

      //update popups
      // //use this version with the function
      // createPopUp(props, attribute, layer, radius);

      //Use this with the class version
      //create new popup
      var popup = new Popup(props, attribute, layer, radius);

      //add popup to circle marker
      popup.bindToLayer();

      //update legend
      var attributeSplit = new AttributeSplit(attribute);

      $(".legend-control-container span").html(
        "Precipitation in " + attributeSplit.month + " " + attributeSplit.year
      );

      $("#panel").html(
        "<h1>" +
          attributeSplit.year +
          "</h1><h2>" +
          attributeSplit.month +
          "</h2>"
      );
      //event listener to update panel content on click and stay at the index set by the sequence controls
      layer.on({
        click: function () {
          $("#panel").html(popup.panelContent);
        },
      });
    }
  });
}

//create New sequence controls
function createSequenceControls(map, attributes) {
  //adds the sequence controls on the map
  var SequenceControl = L.Control.extend({
    options: {
      position: "bottomleft",
    },
    onAdd: function (map) {
      //create the controls container div with a specific class name
      var container = L.DomUtil.create("div", "sequence-control-container");

      //create range input element (the slider)
      $(container).append('<input class="range-slider" type="range">');

      //add buttons
      $(container).append('<button class="skip" id="reverse">Reverse</button>');
      $(container).append('<button class="skip" id="forward">Skip</button>');

      //kill any mouse event listeners on the map
      $(container).on("mousedown dblclick", function (e) {
        L.DomEvent.stopPropagation(e);
      });

      return container;
    },
  });
  map.addControl(new SequenceControl());
  //set slider attributes
  $(".range-slider").attr({
    max: 60,
    min: 0,
    value: 0,
    step: 1,
  });

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

function createLegend(map, attributes) {
  var LegendControl = L.Control.extend({
    options: {
      position: "bottomright",
    },
    onAdd: function (map) {
      //create the control container with a specific class name
      var container = L.DomUtil.create("div", "legend-control-container");

      //script to create temporal legend content
      var attributeSplit = new AttributeSplit(attributes[0]);

      $(container).append(
        "<span>Precipitation in " +
          attributeSplit.month +
          " " +
          attributeSplit.year +
          "</span>"
      );

      return container;
    },
  });
  map.addControl(new LegendControl());
}

function createPanel(map, attributes) {
  var attributeSplit = new AttributeSplit(attributes[0]);
  $("#panel").html(
    "<h1>" + attributeSplit.year + "</h1><h2>" + attributeSplit.month + "</h2>"
  );
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
      //call function to create temporal legend on the map
      createLegend(map, attributes);
      //call function to create sidepanel for the map
      createPanel(map, attributes);
    },
  });
}

$(createMap); //recommended sytax replacement for $(document).ready(createMap)
