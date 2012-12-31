$(document).ready(function() {

  $('.carousel').carousel({
    interval: false
  });

  $('li.neighborhood').click(function(){
    // Manage style.
    $('li.neighborhood').removeClass('active');
    $(this).addClass('active');
    // Slide to next pane.
    $('#sidebar.carousel').carousel('next');
  });

  $('#neighborhood-details').click(function(){
    $('#sidebar.carousel').carousel('prev');
  });
  
});
