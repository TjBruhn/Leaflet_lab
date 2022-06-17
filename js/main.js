// javascript by Trever J. Bruhn 2022

// map of precipitation data for oregon cities from 01/2017-12/2020

//function to instantiate leaflet map
function createMap() {
  //create the map
  var map = L.map("map", {
    center: [44.15, -121],
    zoomControl: false,
    zoom: 7,
    minZoom: 6,
  });

  //addZoomhome
  var zoomHome = L.Control.zoomHome();
  zoomHome.addTo(map);

  //add OSM base tile layer
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
  }).addTo(map);

  //call the getData function
  getData(map);
}

//create an object that splits the attribute into month, numeric month, and year
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

//constructor function to create a popup object
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
    fillColor: "#0068E7",
    color: "#1D0073",
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
      $("#panelTop").html(popup.panelContent);
    },
  });

  //return the circle marker to the L.geojson pointToLayer option
  return layer;
}

//create and style circle markers for point features
function createPropSymbols(data, map, attributes, filtered = false) {
  //adds the points as styled circles
  var layer = L.geoJson(data, {
    filter: function (feature, layer) {
      var countySeat = feature.properties.county_seat;
      if (filtered) {
        //could eliminate by changing at data source
        if (countySeat === "TRUE") {
          countySeat = true;
        } else {
          countySeat = false;
        }
      }
      return countySeat;
    },
    pointToLayer: function (feature, latlng) {
      return pointToLayer(feature, latlng, attributes);
    },
  }).addTo(map);

  //add search control to the map
  map.addControl(
    new L.Control.Search({
      layer: layer,
      propertyName: "City",
      hideMarkerOnCollapse: true,
      zoom: 10,
    })
  );
}

// function createSearch(map) {
//   map.addControl(
//     new L.Control.Search({
//       layer: map.layer,
//       propertyName: "City",
//       hideMarkerOnCollapse: true,
//       zoom: 10,
//     })
//   );
// }

//Resize proportional symbols according to attribute vals selected with seqControls
function updatePropSymbols(map, attribute) {
  map.eachLayer(function (layer) {
    if (layer.feature && layer.feature.properties[attribute] > -1) {
      //access feature properties
      var props = layer.feature.properties;

      //update each feature's radius based on new attribute values
      var radius = calcPropRadius(props[attribute]);
      layer.setRadius(radius);

      //update popups
      //create new popup object
      var popup = new Popup(props, attribute, layer, radius);

      //add popup to circle marker
      popup.bindToLayer();

      //update legend
      updateLegend(map, attribute);

      //update panel
      createPanel(map, attribute);

      //event listener to update panel content on click and stay at the index set by the sequence controls
      layer.on({
        click: function () {
          $("#panelTop").html(popup.panelContent);
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

      $(container).append("<span>Select Month/Year</span>");
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
    max: 59,
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
      index = index > 59 ? 0 : index;
    } else if ($(this).attr("id") == "reverse") {
      index--;
      //if past first wrap to last
      index = index < 0 ? 59 : index;
    }
    //update slider
    $(".range-slider").val(index);
    console.log("range slider value= ", $(".range-slider").val());
    //pass new attribute to update symbols
    updatePropSymbols(map, attributes[index]);
  });
}

//calculate the max mean, and min vals for a given attribute
function getCircleValues(map, attribute) {
  //start with min/max at the highest/lowest possible
  var min = Infinity;
  var max = -Infinity;

  map.eachLayer(function (layer) {
    //get the attribute value
    if (layer.feature) {
      var attributeValue = Number(layer.feature.properties[attribute]);

      //test for min
      if (attributeValue < min) {
        min = attributeValue;
      }

      //test for max
      if (attributeValue > max) {
        max = attributeValue;
      }
    }
  });

  //set mean
  var mean = (min + max) / 2;

  //return vals as an object
  return {
    max: max,
    mean: mean,
    min: min,
  };
}

//updates legend dynamically
function updateLegend(map, attribute) {
  //script to create temporal legend content
  var attributeSplit = new AttributeSplit(attribute);
  var content =
    "Precipitation in " + attributeSplit.month + " " + attributeSplit.year;

  //replace the content in the legend
  $("#temporal-legend").html(content);

  //get the max, mean, min valuse as an object
  var circleValues = getCircleValues(map, attribute);

  //loop over the circle values to assign a radius and vert ceter to each o 3 circles
  for (var key in circleValues) {
    //get radius
    var radius = calcPropRadius(circleValues[key]);

    //assign the cy and r attributes
    $("#" + key).attr({
      cy: 59 - radius,
      r: radius,
    });

    //add legend text
    $("#" + key + "-text").text(
      key + ": " + Math.round(circleValues[key] * 100) / 100 + " in."
    );
  }
}

//creates legend and places it on the map
function createLegend(map, attributes) {
  var LegendControl = L.Control.extend({
    options: {
      position: "bottomright",
    },
    onAdd: function (map) {
      //create the control container with a specific class name
      var container = L.DomUtil.create("div", "legend-control-container");

      //add temporal legend div to container
      $(container).append('<div id="temporal-legend">');

      //start attribute legend with svg string
      var svg = '<svg id="attribute-legend" width="160px" height="61px">';

      //insert raindrop icon
      svg +=
        '<path fill="lightskyblue" stroke="#000" stroke-width="1.5" d="M30 1 Q31.5 16.8 40 22.5 A20.18 20.18 0 1 1 20 22.5 Q28.5 16.8 30 1 z"/>';

      //array of circle names to base loop on
      var circles = {
        max: 17,
        mean: 37,
        min: 57,
      };

      // loop to add each circle and text to svg string
      for (var circle in circles) {
        //circle string
        svg +=
          '<circle class="legend-circle" id="' +
          circle +
          '" fill="#0068E7" fill-opacity="0.8" stroke="#1D0073" cx="30"/>';

        //text string
        svg +=
          '<text id="' +
          circle +
          '-text" x="65" y="' +
          circles[circle] +
          '"></text>';
      }

      //close svg string
      svg += "</svg>";

      //add attribute legend svg to container
      $(container).append(svg);

      return container;
    },
  });
  map.addControl(new LegendControl());
  updateLegend(map, attributes[0]);
}

//adds content to side panel initially
function createPanel(map, attribute) {
  var attributeSplit = new AttributeSplit(attribute);
  $("#panelTop").html(
    "<h1>" + attributeSplit.year + "</h1><h2>" + attributeSplit.month + "</h2>"
  );
}

//add filters to the map to allow user to see data by month or by year or only county seats
function createFilters(data, map, attributes) {
  //STEP 1: add container below map
  //did this in the index

  //step 2: create button for county seat
  var buttonLabel = "Show County Seats Only";
  $("#filter-panel").append(
    '<button class="filter" id="countySeat">' + buttonLabel + "</button>"
  );
  //step 3: create dropdown for month
  //step 4: create radial button for year
  //step 5: Listen for input
  $("#countySeat").on("click", function () {
    //remove any existing search control
    searchControl = $(".leaflet-control-search");
    searchControl.remove();
    //update button text
    if (buttonLabel === "Show County Seats Only") {
      buttonLabel = "Show All Cities";
      //remove current markers
      map.eachLayer(function (layer) {
        if (layer.feature) {
          map.removeLayer(layer);
        }
      });
      //filter data by county seat
      createPropSymbols(data, map, attributes, (filtered = true));
    } else {
      buttonLabel = "Show County Seats Only";
      //remove current markers
      map.eachLayer(function (layer) {
        if (layer.feature) {
          map.removeLayer(layer);
        }
      });
      //do not filter data by county seat
      createPropSymbols(data, map, attributes, (filtered = false));
    }
    $("#countySeat").html(buttonLabel);
    updatePropSymbols(map, attributes[$(".range-slider").val()]);
  });
  //step 6: apply filter to data
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

//loads the data and calls functions to bring all elements together on the map
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
      createPanel(map, attributes[0]);
      //call function to create filters
      createFilters(response, map, attributes);
      //createSearch(map);
    },
  });
}

$(createMap); //recommended sytax replacement for $(document).ready(createMap)
