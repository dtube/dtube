var carousel = require('slick-carousel')

Template.verticalvideoslider.rendered = function () {
  Template.verticalvideoslider.createSlick();
  $(window).on('resize', Template.verticalvideoslider.createSlick);
}

Template.verticalvideoslider.createSlick = function () {
  console.log("vertical slider ok");
  $(".verticalvideoslider").not('.slick-initialized').slick({
    autoplay: false,
    dots: false,
    slidesToShow: 4,
    focusOnSelect: false,
    vertical: true,
    slidesToScroll: 6
  });
  var arrow = document.getElementsByClassName('slick-prev');
  console.log(arrow);
}