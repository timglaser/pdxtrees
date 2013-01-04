/**
 * neighborhoodDetialsCtrl
 */
function neighborhoodDetailsCtrl($scope, neighborhoodService, mapService) {

  var _neighborhood = null;

  $scope.numTrees = 0;
  $scope.tallest = 0;
  $scope.avgHeight = 0;
 
 
  $scope.showNeighborhoods = function() {
    $('#sidebar.carousel').carousel('prev');
  }
 
  $scope.setNeighborhood = function(neighborhood) {
    _neighborhood = neighborhood;
    // todo: handle null/invalid neighborhood;
    neighborhoodService.getNeighborhoodTreeStats(_neighborhood.id, function(stats) {
      // Update display.
      console.log(stats);
      $scope.numTrees = stats.num_trees;
      $scope.tallest = stats.tallest;
      $scope.avgHeight = stats.avg_height;      
    }, function(errorMesssage) {

    });    
  };  
  
  $scope.getNeighborhood = function() {
    return _neighborhood;
  };
  
  document.addEventListener("neighborhoodChanged", function(e) {
    if (e && e.detail && e.detail.neighborhood) {
      $scope.setNeighborhood(e.detail.neighborhood);
    }
  });
  
}

neighborhoodDetailsCtrl.$inject = ['$scope', 'neighborhoodService', 'mapService'];