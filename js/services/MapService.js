function MapService() {
  'use strict';
  var map;
  var mapDivId = 'map_canvas';
  var cartoDbUserName = 'timglaser';
  var boundariesLayer = null;
  var treesLayer = null;

  function showNeighborhoodBoundaries() {
    // Add the neighborhood boundaries layer to the map. Shape file from civicapps.org.
    if (boundariesLayer) {
      // Clear previous instance.
      boundariesLayer.setMap(null);
      boundariesLayer = null;
    }
    boundariesLayer = new CartoDBLayer({
      map_canvas: mapDivId,
      map: map,
      user_name: cartoDbUserName,
      table_name: 'neighborhoods_pdx',
      query: "SELECT * FROM {{table_name}}",
      map_style: true,
      debug: false
    });
  }

  function getTreesQuery(neighborhoodId) {
    return ' ' +
      'SELECT t.* ' +
      'FROM heritage_trees_pdx as t ' +
      'JOIN neighborhoods_pdx as n ON ST_Intersects(t.the_geom, n.the_geom) ' +
      'WHERE n.cartodb_id = ' + neighborhoodId;
  }

  function showTreesInNeighborhood(neighborhoodId) {
    if (treesLayer) {
      // Clear previous instance.
      treesLayer.setMap(null);
      treesLayer = null;
    }
    treesLayer = new CartoDBLayer({
      map_canvas: mapDivId,
      map: map,
      user_name: cartoDbUserName,
      table_name: 'heritage_trees_pdx',
      query: getTreesQuery(neighborhoodId),
      map_style: true,
      debug: false
    });
  }

  function zoomToNeighborhood(n) {
    if (map && n && n.xmin && n.xmax && n.ymin && n.ymax) {

      var sw = new google.maps.LatLng(n.ymin, n.xmin);
      var ne = new google.maps.LatLng(n.ymax, n.xmax);
      var bounds = new google.maps.LatLngBounds(sw, ne);
      map.fitBounds(bounds);
    }
  }

  return {
    init: function () {
      var mapOptions = {
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false
      };
      map = new google.maps.Map(document.getElementById(mapDivId), mapOptions);

      // Fit map to the bounds of portland regardless of the size of the map view.
      var sw = new google.maps.LatLng(45.47, -122.8);
      var ne = new google.maps.LatLng(45.59, -122.49);
      var bounds = new google.maps.LatLngBounds(sw, ne);
      map.fitBounds(bounds);

      showNeighborhoodBoundaries();

    },

    focusOnNeighborhood: function (neighborhood) {
      zoomToNeighborhood(neighborhood);
      showTreesInNeighborhood(neighborhood.id);
    }

  };
}
