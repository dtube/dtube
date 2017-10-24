var carousel = require('slick-carousel')


Template.videoslider.isOnMobile = function () {
  if (/Mobi/.test(navigator.userAgent)) {
    return true;
  }
}


Template.videoslider.rendered = function () {
  //Template.videoslider.createSlick();
  //$(window).on('resize', Template.videoslider.createSlick);
  console.log('creating slick')
  var random = Template.upload.createPermlink(10)
  this.firstNode.id = random
  Template.videoslider.createSlick(random)


  $(this.firstNode).find('.dropdown').dropdown({});
}
Template.videoslider.refreshSlider = function () {
  $('.videoslider').slick('refresh');
}

Template.videoslider.createSlick = function (elemId) {
  if (Template.videoslider.isOnMobile() == true) {
    console.log("slider init for mobile");
    $("#" + elemId).slick({
      autoplay: false,
      dots: false,
      arrows: false,
      slidesToShow: 2,
      focusOnSelect: false,
      slidesToScroll: 2,
    });
    console.log('slider done')
  }
  else {
    console.log("slider init for desktop");
    $("#" + elemId).slick({
      autoplay: false,
      dots: false,
      slidesToShow: 6,
      focusOnSelect: false,
      slidesToScroll: 2,
       responsive: [
        {
          breakpoint: 1550,
          settings: {
            slidesToShow: 5,
            slidesToScroll: 2,
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
          breakpoint: 600,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 2
          }
        },
        {
          breakpoint: 420,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1
          }
        }

      ]
    });
    console.log('slider done')
  }

}
