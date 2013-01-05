/**
 * neighborhoodListCtrl
 */
function neighborhoodListCtrl($scope, neighborhoodService, mapService) {

  $scope.neighborhoods = [];
  
  $scope.neighborhoodNames = [];
 
  /**
   * To be triggered when a neighborhood has been selected in the UI.
   */
  $scope.selectNeighborhood = function(neighborhood) {
    // Notify of selection change on the document level.
    // todo: make custom event work for IE (http://dean.edwards.name/weblog/2009/03/callbacks-vs-events/)
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent('neighborhoodChanged', false, false, { neighborhood: neighborhood });
    document.dispatchEvent(event);

    // Indicate that the selection has changed in the neighborhood list.
    angular.forEach($scope.neighborhoods, function(nbrhd) {
      nbrhd.selected = nbrhd.id === neighborhood.id ? true : false;
      // Slide to details pane.
      $('#sidebar.carousel').carousel('next');
    });

    // Zoom to the bounds of the selected neighborhood.
    if (neighborhood.bounds) {
      mapService.focusOnNeighborhood(neighborhood);
    } else {
      // We haven't gathered the bounds for this neighborhood yet. Do so and proceed.
      neighborhoodService.getBoundsForNeighborhood(neighborhood.id, function(bounds) {
        neighborhood.bounds = bounds;
        mapService.focusOnNeighborhood(neighborhood);

      }, function(errorMsg) {
        // todo: show graceful error?
        // todo: zoom back out to all neighborhood view?
      });
    }    
  };

  neighborhoodService.getNeighborhoods(function(rows) {
    $scope.neighborhoods = rows;
    angular.forEach(rows, function(n) {
      if (n && n.name) {
        $scope.neighborhoodNames.push(n.name);
      }
    });
    $('.typeahead').typeahead({
      source: $scope.neighborhoodNames,
      items: 8,
      minLength: 1
    });
  }, function(errorMessage) {
      // todo: show graceful error?
  });
  
}

neighborhoodListCtrl.$inject = ['$scope', 'neighborhoodService', 'mapService'];