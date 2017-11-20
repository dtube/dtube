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
      slidesToShow: 3,
      focusOnSelect: false,
      slidesToScroll: 3,
      responsive: [
        {
          breakpoint: 700,
          settings: {
            slidesToShow: 3,
            slidesToScroll: 3
          }
        },
        {
          breakpoint: 499,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 2
          }
        },
        {
          breakpoint: 299,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1
          }
        }
      ]
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
        // {
        //   breakpoint: 1550,
        //   settings: {
        //     slidesToShow: 6,
        //     slidesToScroll: 2,
        //     focusOnSelect: false,
        //   }
        // },

        {
          breakpoint: 1367,
          settings: {
            slidesToShow: 5,
            slidesToScroll: 5
          }
        },
        {
          breakpoint: 1281,
          settings: {
            slidesToShow: 5,
            slidesToScroll: 5
          }
        },
        {
          breakpoint: 1180,
          settings: {
            slidesToShow: 4,
            slidesToScroll: 4
          }
        },       
        {
          breakpoint: 993,
          settings: {
            slidesToShow: 3,
            slidesToScroll: 3
          }
        },
        {
          breakpoint: 700,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 2
          }
        },
        {
          breakpoint: 499,
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
