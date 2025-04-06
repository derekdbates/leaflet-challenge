//geojson link https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson

// Create the 'basemap' tile layer that will be the background of our map.
let basemap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// OPTIONAL: Step 2
// Create the 'street' tile layer as a second background of the map
let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// Create the map object with center and zoom options.
let map = L.map('map', {
  center: [47.6061, -122.3328],
  zoom: 6,
  // layers: [basemap, street]
});




// Then add the 'basemap' tile layer to the map.
basemap.addTo(map);

// OPTIONAL: Step 2
// Create the layer groups, base maps, and overlays for our two sets of data, earthquakes and tectonic_plates.

let layers = {
  EARTHQUAKE: new L.LayerGroup(),
  TECTONIC: new L.LayerGroup() 
};

let overlays = {
  'Earthquake': layers.EARTHQUAKE,
  'Tectonic Plates': layers.TECTONIC
};



// Add a control to the map that will allow the user to change which layers are visible.
L.control.layers(layers, overlays).addTo(map);




// Make a request that retrieves the earthquake geoJSON data.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data) {

  // This function returns the style data for each of the earthquakes we plot on
  // the map. Pass the magnitude and depth of the earthquake into two separate functions
  // to calculate the color and radius.
  function styleInfo(feature) {

    return {
      color: getColor(feature.geometry[2]),
      radius: getRadius(feature.properties.mag),
      fillopacity: .6,
      weight: 1
  };
}


  // This function determines the color of the marker based on the depth of the earthquake.
  function getColor(depth) {
    
      if (depth < 2) return 'blue';
      else if (depth <5) return 'green';
      else if (depth <8) return 'yellow';
      else return 'red';
  };

  // This function determines the radius of the earthquake marker based on its magnitude.
  function getRadius(mag) {
    return mag * 50;
  };

  // Add a GeoJSON layer to the map once the file is loaded.
  let earthquakeLayer = L.geoJson(data, {
    // Turn each feature into a circleMarker on the map.
    pointToLayer: function (feature, latlng) {
      return L.circle(latlng, styleInfo(feature))
    },
    // Set the style for each circleMarker using our styleInfo function.
    style: styleInfo,
    // Create a popup for each marker to display the magnitude and location of the earthquake after the marker has been created and styled
    onEachFeature: function (feature, layer) {
      layer.bindPopup('Location: ' + feature.properties.place + '<br>Magnitude: '+ feature.properties.mag);
    }
  // OPTIONAL: Step 2
  // Add the data to the earthquake layer instead of directly to the map.
  }).addTo(layers.EARTHQUAKE);

  // Create a legend control object.
  let legend = L.control({
    position: "bottomright"
  });

  // Then add all the details for the legend
  legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend");

    // Initialize depth intervals and colors for the legend
    const depthIntervals = [0,10,20,30,40,50];
    const depthColors = ['violet', 'blue', 'green', 'yellow', 'orange', 'red']

    // Loop through our depth intervals to generate a label with a colored square for each interval.
    for (let i = 0; i < depthIntervals.length; i++) {
      div.innerHTML +=
      '<i style="background:' + depthColors[i] + '"></i> ' + depthIntervals[i] + (depthIntervals[i+1] ? '&ndash;' + 
        '<br>' : '+'
       );
    }

    return div;
  };

  // Finally, add the legend to the map.
  legend.addTo(map)

  // OPTIONAL: Step 2
  // Make a request to get our Tectonic Plate geoJSON data.
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (plate_data) {
    // Save the geoJSON data, along with style information, to the tectonic_plates layer.
    let tectLayer = L.geoJSON(plate_data, {
      style: {
        color: 'black',
        opacity: 1,
        weight: 2
      }
    });
    tectLayer.addTo(layers.TECTONIC)

    // Then add the tectonic_plates layer to the map.

  });
});
