var carousel = require('slick-carousel')

Template.videoslider.rendered = function() {
  Template.videoslider.createSlick();
  $(window).on( 'resize', Template.videoslider.createSlick );
}
Template.videoslider.refreshSlider = function() {
$('.videoslider').slick('refresh');
}

Template.videoslider.createSlick = function() {
    console.log( "slider ok" );  
    $(".videoslider").not('.slick-initialized').slick({
      autoplay: false,
      dots: false,
      slidesToShow: 6,
      focusOnSelect: false,
      slidesToScroll: 6,
      responsive: [
        { 
          breakpoint: 1550,
          settings: {
            slidesToShow: 5,
            slidesToScroll: 5,
            focusOnSelect: false,
          }
        },
        {
          breakpoint: 1280,
          settings: {
            slidesToShow: 4,
            slidesToScroll: 4
          }
        },
        {
          breakpoint: 1080,
          settings: {
            slidesToShow: 3,
            slidesToScroll: 3
          }
        },
        {
          breakpoint: 900,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 2
          }
        }
      ]
  });
}