var carousel = require('owl.carousel')

Template.videoslider.isOnMobile = function () {
  if (/Mobi/.test(navigator.userAgent)) {
    return true;
  }
}


Template.videoslider.rendered = function () {
  var random = Template.upload.createPermlink(10)
  this.firstNode.id = random
  Template.videoslider.createSlider(random)


  $(this.firstNode).find('.dropdown').dropdown({});
}
Template.videoslider.refreshSlider = function () {
  $('.owl-carousel').owlCarousel()('refresh');
}

Template.videoslider.createSlider = function (elemId) {
  if (Template.videoslider.isOnMobile() == true) {
    $("#" + elemId).owlCarousel({
      loop: true,
      margin: 10,
      nav: false,
      items: 6,
      autoWidth:false,
      mergeFit:210,
      dots: false,
      responsiveRefreshRate: true,
      responsiveClass: true,
      responsive: {
        299: {
          items: 2,
          nav: false
        },
        499: {
          items: 3,
          nav: false
        },
        700: {
          items: 3,
          nav: false,
          loop: false
        }
      }
    });
  }
  else {
    $("#" + elemId).owlCarousel({
      loop: true,
      margin: 10,
      nav: true,
      responsiveRefreshRate: true,
      items: 6,
      navText: [ '', '' ],
      dots: false,
      responsiveClass: true,
      responsive: {
        280: {
          items: 1,
          nav: false
        },
        499: {
          items: 2,
          nav: false
        },
        700: {
          items: 3,
          nav: false,
          loop: false
        },
        993: {
          items: 4,
          nav: true,
          loop: false
        },
        1180: {
          items: 5,
          nav: true,
          loop: false
        },
        1281: {
          items: 5,
          nav: true,
          loop: false
        },
        1367: {
          items: 6,
          nav: true,
          loop: false
        }
      }
    });
  }

}
