//
// neighborhoodListCtrl
//
function neighborhoodListCtrl($scope, neighborhoodService, mapService) {

  $scope.neighborhoods = [];
 
  $scope.selectNeighborhood = function(neighborhood) {

    // Indicate that selection has changed in the neighborhood list.
    angular.forEach($scope.neighborhoods, function(nbrhd) {
      nbrhd.selected = nbrhd.id === neighborhood.id ? true : false;
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
    
    neighborhoodService.getNeighborhoodTreeStats(neighborhood.id, function(stats) {
    
    }, function(errorMesssage) {
    
    });
    
  };

  neighborhoodService.getNeighborhoods(function(rows) {
    $scope.neighborhoods = rows;
  }, function(errorMessage) {
      // todo: show graceful error?
  });
  
}

neighborhoodListCtrl.$inject = ['$scope', 'neighborhoodService', 'mapService'];