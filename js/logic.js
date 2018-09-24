function getColor(d) {
  switch (d) {
    case 1: return 'purple';
    case 2: return 'red';
    case 3: return 'orange';
    case 4: return 'yellow';
    case 5: return 'green';
    case 6: return 'grey';
    default: return '#fff';
  }
};
function colorscale(magnitude){
  if(magnitude>=0 & magnitude<=1){
      return "grey";
  }
  else if(magnitude>1 & magnitude<=2){
      return "green";
  }
  else if(magnitude>2 & magnitude<=3){
      return "yellow";
  }
  else if(magnitude>3 & magnitude<=4){
      return "orange";
  }
  else if(magnitude>4 & magnitude<=5){
      return "red";
  }
  else if(magnitude>5){
      return "purple";
  }
}
function updateList(timeline){
  var displayed = timeline.getLayers();
  var list = document.getElementById('displayed-list');
  list.innerHTML = "";
  displayed.forEach(function(quake){
      var li = document.createElement('li');
      li.innerHTML = quake.feature.properties.title + Date(quake.feature.properties.time);
      list.appendChild(li);
  });
}
function createMap(earthquakedata) {
  // Create the tile layer that will be the background of our map
  var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });
  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });
  var googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
    maxZoom: 18,
    subdomains:['mt0','mt1','mt2','mt3']
  });
  var googleTerrain = L.tileLayer('http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',{
    maxZoom: 18,
    subdomains:['mt0','mt1','mt2','mt3']
  });
  var googleHybrid = L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',{
    maxZoom: 18,
    subdomains:['mt0','mt1','mt2','mt3']
  });
  var outdoormap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v9/tiles/{z}/{x}/{y}?access_token="+API_KEY);
  var greyscalemap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?access_token="+API_KEY);
  
  var tectonics_url = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";
  var tectonics = new L.LayerGroup();
  d3.json(tectonics_url).then(function(response){
    console.log(response);
    L.geoJSON(response,{
        color:"blue",
        weight: 2
    }).addTo(tectonics);            
  });
  // Create a baseMaps object to hold the lightmap layer
  var baseMaps = {
    "Light": lightmap,
    "Street": streetmap,
    "Satellite":googleSat,
    "Terrain": googleTerrain,
    "Hybrid":googleHybrid,
    "Outdoor":outdoormap,
    "Greyscale":greyscalemap
  };
  // Create an overlayMaps object to hold the earthquake layer
  var overlayMaps = {
    "Earthquake":earthquakedata,
    "Fault Lines":tectonics
  };
  // Create the map object with options
  var map = L.map("map", {
    center: [41.850033, -107.6500523],
    zoom: 3,
    layers: [googleHybrid, tectonics],
    maxBounds: [[90,-180], [-90, 180]]
  });
  // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(map);
  // FIRST LEGEND FOR TESTING
	var Legend = L.control({position: 'bottomright'});
	Legend.onAdd = function (map) {
		var legdiv = L.DomUtil.create('div', 'info legend'),
			status = [1, 2, 3, 4, 5, 6],
			labels = ['5+', '4-5', '3-4','2-3','1-2','<1'];
		// loop through our status intervals and generate a label with a coloured square for each interval
		for (var i = 0; i < status.length; i++) {
			legdiv.innerHTML +=
				'<i style="background:' + getColor(status[i]) + '"></i> ' +	(status[i] ? labels[i] + '<br>' : '+');
		}
		return legdiv;
	};
  Legend.addTo(map);

  var queryURL="https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
  d3.json(queryURL).then(function(data) {
    var getInterval = function(quake) {
      // earthquake data only has a time, so we'll use that as a "start"
      // and the "end" will be that + some value based on magnitude
      // 18000000 = 30 minutes, so a quake of magnitude 5 would show on the
      // map for 150 minutes or 2.5 hours
      return {
        start: quake.properties.time,
        end:   quake.properties.time + quake.properties.mag * 1800000
      };
    };
    var timelineControl = L.timelineSliderControl({
      formatOutput: function(date) {
        return Date(date).toString("YYYY-MM-DD HH:MM:SS").slice(3,24);
      }
    });
    var timeline = L.timeline(data, {
      getInterval: getInterval,
      pointToLayer: function(data, latlng){
        var hue_min = 120;
        var hue_max = 0;
        var hue = data.properties.mag / 10 * (hue_max - hue_min) + hue_min;
        return L.circleMarker(latlng, {
          radius: data.properties.mag * 3,
          weight: 1,
          opacity: 1,
          fillOpacity: 1,
          color: colorscale(data.properties.mag)
        }).bindPopup("<h5><strong>Place: </strong> " + data.properties.place +
        "</h5><hr><h5><strong>Magnitude: </strong> "+ data.properties.mag +
        "</h5><hr><h5><strong>Time: </strong> " + new Date(data.properties.time) + "</h5>");
      }
    });
    timelineControl.addTo(map);
    timelineControl.addTimelines(timeline);
    timeline.addTo(map);
    timeline.on('change', function(e){
      updateList(e.target);
    });
    updateList(timeline);
  });
}

d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson", function (infoRes) {
  var data = infoRes.features;
  var circles = [];
  for (var i =0;i<data.length;i++){
    var lat = data[i].geometry.coordinates[1];
    var log = data[i].geometry.coordinates[0];
    var place = data[i].properties.place;
    var time = data[i].properties.time;
    var mag = data[i].properties.mag;
    
    var circle = L.circle([lat, log], {
      color:colorscale(mag),
      fillOpacity: 0.55,
      fillColor: colorscale(mag),
      weight:1,
      radius: mag * 40000
    }).bindPopup("<h5><strong>Place: </strong> " + place +
    "</h5><hr><h5><strong>Magnitude: </strong> "+ mag +
    "</h5><hr><h5><strong>Time: </strong> " + new Date(time) + "</h5>");
    circles.push(circle);

  }
  createMap(L.layerGroup(circles));
});




