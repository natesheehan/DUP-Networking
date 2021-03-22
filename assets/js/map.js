	mapboxgl.accessToken = 'pk.eyJ1IjoibmF0aGFuYWVsaXNhbWFwcGVyIiwiYSI6ImNrODNiZzdoZTA4Y2gzZ281YmJiMHNwOWIifQ.d2ntY86sJ7DR7011dUJ2cw';
	var map = new mapboxgl.Map({
	  container: 'map',
	  style: 'mapbox://styles/mapbox/dark-v10',
	  center: [0, 0],
	  zoom: 1
	});

	map.addControl(
	  new MapboxGeocoder({
	    accessToken: mapboxgl.accessToken,
	    mapboxgl: mapboxgl
	  })
	);

	map.on('load', function() {
	// Add a new source from our GeoJSON data and
	// set the 'cluster' option to true. GL-JS will
	// add the point_count property to your source data.
	map.addSource('earthquakes', {
	  type: 'geojson',
	  // Point to GeoJSON data. This example visualizes all M1.0+ earthquakes
	  // from 12/22/15 to 1/21/16 as logged by USGS' Earthquake hazards program.
	  data: '/cities.geojson',
	  cluster: true,
	  clusterMaxZoom: 14, // Max zoom to cluster points on
	  clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
	});

	map.addLayer({
	  id: 'clusters',
	  type: 'circle',
	  source: 'earthquakes',
	  filter: ['has', 'point_count'],
	  paint: {
	    // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
	    // with three steps to implement three types of circles:
	    //   * Blue, 20px circles when point count is less than 100
	    //   * Yellow, 30px circles when point count is between 100 and 750
	    //   * Pink, 40px circles when point count is greater than or equal to 750
	    'circle-color': [
	      'step',
	      ['get', 'point_count'],
	      '#51bbd6',
	      100,
	      '#f1f075',
	      750,
	      '#f28cb1'
	    ],
	    'circle-radius': [
	      'step',
	      ['get', 'point_count'],
	      20,
	      10,
	      30,
	      20,
	      40
	    ]
	  }
	});

	map.addLayer({
	  id: 'cluster-count',
	  type: 'symbol',
	  source: 'earthquakes',
	  filter: ['has', 'point_count'],
	  layout: {
	    'text-field': '{point_count_abbreviated}',
	    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
	    'text-size': 12,
	  }
	});

	map.addLayer({
	  id: 'unclustered-point',
	  type: 'circle',
	  source: 'earthquakes',
	  filter: ['!', ['has', 'point_count']],
	  paint: {
	    'circle-color': '#11b4da',
	    'circle-radius': 4,
	    'circle-stroke-width': 1,
	    'circle-stroke-color': '#fff'
	  }
	});

	map.addSource('route', {
		'type': 'geojson',
		'data': {
			'type': 'Feature',
			'properties': {},
			'geometry': {
				'type': 'LineString',
				'coordinates': [
					[11.5429503873952, 49.2029999478672],
					[121.4737, 31.230]
				]
			}
		}
	});
	map.addLayer({
		'id': 'route',
		'type': 'line',
		'source': 'route',
		'layout': {
			'line-join': 'round',
			'line-cap': 'round'
		},
		'paint': {
			'line-color': '#e421bc',
			'line-width': 4
		}
	});
});

	// inspect a cluster on click
	map.on('click', 'clusters', function(e) {
	  var features = map.queryRenderedFeatures(e.point, {
	    layers: ['clusters']
	  });
	  var clusterId = features[0].properties.cluster_id;
	  map.getSource('earthquakes').getClusterExpansionZoom(
	    clusterId,
	    function(err, zoom) {
	      if (err) return;

	      map.easeTo({
	        center: features[0].geometry.coordinates,
	        zoom: zoom
	      });
	    }
	  );
	});

	// When a click event occurs on a feature in
	// the unclustered-point layer, open a popup at
	// the location of the feature, with
	// description HTML from its properties.
	map.on('click', 'unclustered-point', function(e) {
	  var coordinates = e.features[0].geometry.coordinates.slice();
	  var name = e.features[0].properties.name;
	  var course = e.features[0].properties.course_title;
	  var year = e.features[0].properties.year_graduated;
	  var linkedin = e.features[0].properties.linkedin;
	  var twitter = e.features[0].properties.twitter;
	  var image = e.features[0].properties.img;

	  // Ensure that if the map is zoomed out such that
	  // multiple copies of the feature are visible, the
	  // popup appears over the copy being pointed to.
	  while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
	    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
	  }

	  new mapboxgl.Popup()
	    .setLngLat(coordinates)
	    .setHTML(
	      '<img src="' + image + '" style="height:80px;width:80px;display: block;margin: auto;">' +
	      '<br><b>Name:</b> ' + name +
	      '<br><b>Course:</b> ' + course +
	      '<br><b>Year:</b> ' + year +
	      '<br><div style="display: block;margin: auto;text-align: center;"></br> <button type="button">View Connections</button> </br> </br> <a href="' + linkedin + '"><img src="assets/images/linkedin.png" style="height:28px;width:28px;margin-right:2%;"></a>' + '<a href="' + twitter + '"><img src="assets/images/twitter.png" style="height:28px;width:28px;margin-left:2%;"></a></div>'
	    )
	    .addTo(map);
	});

	map.on('mouseenter', 'clusters', function() {
	  map.getCanvas().style.cursor = 'pointer';
	});
	map.on('mouseleave', 'clusters', function() {
	map.getCanvas().style.cursor = '';
	});
