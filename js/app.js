

// Configurations
var config = angular.module('app.config', []);
config.constant('version', '0.1');
config.constant('debugging', true);
config.constant('rootQueryUrl', 'http://timglaser.cartodb.com/api/v2/sql?q=');


// Services
angular.module('app.services', ['app.config'], function ($provide) {
  $provide.factory('mapService', MapService);
});


// App start.
angular.module('app', ['app.config', 'app.services']).run(function (mapService) {
  mapService.init();
  mapService.focusOnCity();
});


$(document).ready(function () {
  $('.carousel').carousel({ interval: false });
  
  if ('ontouchstart' in document.documentElement) {
    $('body').addClass('touch');
  } else {
    $('body').addClass('no-touch');
  }

  // Adapt sidebar width depending on the window size.
  var onResize = function () {
    if($(window).width() > 1200) {
      // Wide screen. We can use a thinner sidebar be so wide.
      $('#sidebar').removeClass('span5').removeClass('span4').addClass('span3');
      $('#map_canvas').removeClass('span7').removeClass('span8').addClass('span9');

    } else if($(window).width() < 800) {
      // Slim screen. Could use a wider sidebar.
      $('#sidebar').removeClass('span4').removeClass('span3').addClass('span5');
      $('#map_canvas').removeClass('span8').removeClass('span9').addClass('span7');
    } else {
      // Somewhere in between.
      $('#sidebar').removeClass('span5').removeClass('span3').addClass('span4');
      $('#map_canvas').removeClass('span7').removeClass('span9').addClass('span8');
    }
  };
  onResize();
  $(window).resize(onResize);
});
