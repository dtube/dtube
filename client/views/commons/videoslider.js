var carousel = require('slick-carousel')

Template.videoslider.rendered = function() {
  Template.videoslider.createSlick();
  $(window).on( 'resize', Template.videoslider.createSlick );
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
          breakpoint: 1620,
          settings: {
            slidesToShow: 6,
            slidesToScroll: 6,
            focusOnSelect: false,
          }
        },
        {
          breakpoint: 1420,
          settings: {
            slidesToShow: 5,
            slidesToScroll: 5
          }
        },
        {
          breakpoint: 1220,
          settings: {
            slidesToShow: 4,
            slidesToScroll: 4
          }
        },
        {
          breakpoint: 1020,
          settings: {
            slidesToShow: 3,
            slidesToScroll: 3
          }
        },
        {
          breakpoint: 820,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 2
          }
        }
      ]
  });	
}