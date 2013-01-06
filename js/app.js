

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
});


$(document).ready(function () {
  $('.carousel').carousel({ interval: false });
  
  if ('ontouchstart' in document.documentElement) {
    $('body').addClass('touch');
    // not working on ipad $('#neighborhood-list').kinetic({x:false, triggerHardware: true});
  } else {
    $('body').addClass('no-touch');
  }
  
/*
  $('#neighborhood-list-pane .search-query').tooltip({ 
    placement: 'bottom',
    title: 'Select a neighborhood to explore our heritage trees.',
    trigger: 'manual'
  });
    
  $('#neighborhood-list-pane .search-query').tooltip('show');
  
*/
/*
  $('.search-query').popover({ 
    placement: 'bottom',
    html: true,
    content: '<p class="lead">Select a neighborhood to start exploring our heritage trees.<p><button class="btn btn-primary pull-right" onclick="$(".search-query").popover("hide");">Got it!</button>',
    trigger: 'manual'
  });
    
  $('.search-query').popover('show');
*/
/*
  $('.popover').css({ 
    'color' : 'red',
    'left' : 'auto',
    'right' : '10px'});
*/

  
});
