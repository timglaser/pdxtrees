function MapService() {
  'use strict';
  var self = this, map, infoWindow, boundariesLayer, singleNeighborhoodLayer,
    treesLayer, focusedNeighborhoodId, zoomedNeighborhoodId,
    mapDivId = 'map_canvas', cartoDbUserName = 'timglaser', selectNeighborhood;

  /**
   * Shows an all neighborhood boundaries as an interactive layer.
   */
  function showAllNeighborhoodsLayer() {
    var query = 'SELECT n.*, COUNT(*) as numtrees FROM neighborhoods_pdx as n ' +
      'JOIN heritage_trees_pdx as t ' +
      'ON ST_Intersects(t.the_geom, n.the_geom) ' +
      'GROUP BY n.cartodb_id ' +
      'HAVING COUNT(*) > 0';
    
    // Add layer to the map.
    if (!boundariesLayer) {
      // Initial setup.
      boundariesLayer = new CartoDBLayer({
        map_canvas: mapDivId,
        map: map,
        user_name: cartoDbUserName,
        table_name: 'neighborhoods_pdx',
        query: query,
        layer_order: 'bottom',
        map_style: false,
        debug: true,
        interactivity: 'cartodb_id',
        featureOver: function (mouseEvent, latlng, point, data) {
          map.setOptions({'draggableCursor': 'pointer'});
        },
        featureOut: function (mouseEvent, latlng, point, data) {
          map.setOptions({'draggableCursor': ''});
        },
        featureClick: function (event, latlng, point, data) {
          if (typeof selectNeighborhood === 'function') {
            selectNeighborhood(data.cartodb_id);
          }
        }
      });
    } else {
      // Re-attach to the map.
      boundariesLayer.setMap(map);
    }
  }
  
  function hideAllNeighborhoodsLayer() {
    if (boundariesLayer) {
      boundariesLayer.setMap(null);
    }
  }

  /**
   * Shows only the boundary for the given neighborhood as a non-interactive layer.
   */
  function showSingleNeighborhoodLayer(neighborhoodId) {
    var newQuery = 'SELECT * FROM neighborhoods_pdx_2 WHERE cartodb_id = ' + neighborhoodId;

    if (!singleNeighborhoodLayer) {
      // Initial setup of trees layer.
      focusedNeighborhoodId = neighborhoodId;
      singleNeighborhoodLayer = new CartoDBLayer({
        map_canvas: mapDivId,
        map: map,
        user_name: cartoDbUserName,
        table_name: 'neighborhoods_pdx_2',
        query: newQuery,
        layer_order: 'bottom',
        map_style: false,
        debug: true
      });
    } else if (singleNeighborhoodLayer.options.query !== newQuery) {
      // A different neighborhood has been selected. Use the new query.
      var listener = google.maps.event.addListener(singleNeighborhoodLayer, 'added', function() {
        google.maps.event.removeListener(listener);
        singleNeighborhoodLayer.setQuery(newQuery);
      });
    }
    singleNeighborhoodLayer.setMap(map);
  }

  function hideSingleNeighborhoodLayer() {
    if (singleNeighborhoodLayer) {
      singleNeighborhoodLayer.setMap(null);
    }
  }

  function getTreesQuery(neighborhoodId) {
    return ' ' +
      'SELECT t.* ' +
      'FROM heritage_trees_pdx as t ' +
      'JOIN neighborhoods_pdx as n ON ST_Intersects(t.the_geom, n.the_geom) ' +
      'WHERE n.cartodb_id = ' + neighborhoodId;
  }

  /**
   * Shows the trees in the given neighborhood as an interactive layer.
   */
  function showTreesInNeighborhood(neighborhoodId) {
    var newQuery = getTreesQuery(neighborhoodId);    
    if (!treesLayer) {
      // Initial setup of trees layer.
      treesLayer = new CartoDBLayer({
        map_canvas: mapDivId,
        map: map,
        user_name: cartoDbUserName,
        table_name: 'heritage_trees_pdx',
        query: newQuery,
        layer_order: 'top',
        map_style: false,
        debug: true,
        interactivity: 'cartodb_id, address, circumfere, common_nam, diameter, ' + 
          'height, owner, scientific, spread, year',
        featureOver: function (mouseEvent, latlng, point, data) {
          map.setOptions({'draggableCursor': 'pointer'});
        },
        featureOut: function (mouseEvent, latlng, point, data) {
          map.setOptions({'draggableCursor': ''});
        },
        featureClick: function (event, latlng, point, data) {
          // Prevent double dipping (featureClick gets called twice; once as 
          // 'click', once as 'touchend'

          /* ipad touches aren't working if using this snippet to prevent double dipping: 
          var validTouch = ($('body').hasClass('touch') && event.type === 'touchend');
          var validClick = ($('body').hasClass('no-touch') && event.type === 'click');
          if (validTouch || validClick) {
          } */

          // This test doesn't work to prevent a double call either.
          if (infoWindow.getPosition() !== latlng) {

            var content = ' ' +
            '<div class="treeInfo">' +
              '<h4>' + data.common_nam + '</h4>' +
              '<small>' + data.scientific + '</small>' +
              '<dl class="dl-horizontal">' +
                '<dt>Height</dt><dd>' + data.height + 'ft</dd>' +
                '<dt>Spread</dt><dd>' + data.spread + 'ft</dd>' +
                '<dt>Diameter</dt><dd>' + data.diameter + 'in</dd>' +
                '<dt>Circumference</dt><dd>' + data.circumfere + 'in</dd>' +
                '<dt>Year Added</dt><dd>' + data.year + '</dd>' +
                '<dt>Address</dt><dd>' + data.address + '</dd>' +
                (data.owner !== undefined ? ('<dt>Ownership</dt><dd>' + data.owner + '</dd>') : '') +
              '</dl>' +
            '</div>';
            
            infoWindow.setPosition(latlng);
            infoWindow.setContent(content);
            infoWindow.open(map);
          }
        }
      });
    } else if (treesLayer.options.query !== newQuery) {
      // A different neighborhood has been selected. Use the new query.
      var listener = google.maps.event.addListener(treesLayer, 'added', function() {
        google.maps.event.removeListener(listener);
        treesLayer.setQuery(newQuery);
      });
    }
    treesLayer.setMap(map);
  }
  
  function hideTrees() {
    if (infoWindow) {
      infoWindow.close();
    }
    if (treesLayer) {
      treesLayer.setMap(null);
    }
  }

  function zoomToNeighborhood(n) {
    if (map && n && n.xmin && n.xmax && n.ymin && n.ymax) {
      var sw = new google.maps.LatLng(n.ymin, n.xmin);
      var ne = new google.maps.LatLng(n.ymax, n.xmax);
      var bounds = new google.maps.LatLngBounds(sw, ne);
      map.fitBounds(bounds);
      zoomedNeighborhoodId = n.id;
    }
  }

  function zoomToCity() {
    if (!map) return;
    // Fit map to the bounds of portland regardless of the size of the map view.
    var sw = new google.maps.LatLng(45.47, -122.77);
    var ne = new google.maps.LatLng(45.59, -122.5);
    var cityBounds = new google.maps.LatLngBounds(sw, ne);
    map.fitBounds(cityBounds);
  }

  return {
    init: function () {
      var mapOptions = {
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false
      };
      map = new google.maps.Map(document.getElementById(mapDivId), mapOptions);
      infoWindow = new google.maps.InfoWindow();
      
      // Alter base layer styles.
      map.setOptions({styles: [
        {
          "featureType": "poi",
          "elementType": "labels",
          "stylers": [
            { "visibility": "off" }
          ]
        },{
          "featureType": "administrative.neighborhood",
          "stylers": [
            { "visibility": "off" }
          ]
        },{
          "featureType": "transit",
          "stylers": [
            { "visibility": "off" }
          ]
        },{
          "stylers": [
            { "saturation": -20 }
          ]
        },{
          "featureType": "road",
          "elementType": "geometry",
          "stylers": [
            { "visibility": "simplified" }
          ]
        },{
          "featureType": "road",
          "elementType": "labels",
          "stylers": [
            { "lightness": 35 }
          ]
        },{
          "featureType": "road.highway",
          "elementType": "labels.text",
          "stylers": [
            { "visibility": "off" }
          ]
        },{
          "featureType": "administrative.locality",
          "elementType": "labels",
          "stylers": [
            { "visibility": "off" }
          ]
        }
      ]});
    },
    
    focusOnCity: function () {
      zoomToCity();
      hideSingleNeighborhoodLayer();
      hideTrees();
      showAllNeighborhoodsLayer();
    },

    focusOnNeighborhood: function (neighborhood) {
      zoomToNeighborhood(neighborhood);
      hideAllNeighborhoodsLayer();
      showSingleNeighborhoodLayer(neighborhood.id);
      showTreesInNeighborhood(neighborhood.id);
    },
    
    // A callback that takes a neighborhood cartodb_id as its only parameter.
    // Called when a neighborhood map feature is clicked.
    setSelectNeighborhoodCallback: function (callback) { 
      if (typeof callback === 'function') {
        selectNeighborhood = callback;
      }
    }

  };
}
