

// Configurations
var config = angular.module('app.config', []);
config.constant('version', '0.1');
config.constant('debugging', true);
config.constant('rootQueryUrl', 'http://timglaser.cartodb.com/api/v2/sql?q=');


// Services
angular.module('app.services', ['app.config'], function($provide) {
  $provide.factory('mapService', MapService);
});


// App start.
angular.module('app', ['app.config', 'app.services']).run(function(mapService){
  mapService.init();
});


$(document).ready(function() {
  $('.carousel').carousel({ interval: false });
});
