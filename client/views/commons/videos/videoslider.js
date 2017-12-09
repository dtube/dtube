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

Template.videoslider.createSlider = function (elemId) {
  if (Template.videoslider.isOnMobile() == true) {
    $("#" + elemId).owlCarousel({
      loop: true,
      margin: 2,
      nav: false,
      items: 5,
      slideBy: 2,
      autoWidth:false,
      mergeFit:210,
      dots: false,
      responsiveClass: true,
      responsive: {
        299: {
          items: 2,
          nav: false,
          slideBy: 2
        },
        499: {
          items: 3,
          nav: false,
          slideBy: 2
        },
        700: {
          items: 3,
          nav: false,
          loop: false,
          slideBy: 2
        }
      }
    });
  }
  else {
    $("#" + elemId).owlCarousel({
      loop: true,
      margin: 2,
      nav: true,
      navText: [ '', '' ],
      animateOut: 'slideOutDown',
      animateIn: 'flipInX',
      dots: false,
      responsiveClass: true,
      responsive: {
        280: {
          items: 1,
          slideBy: 1,
          nav: false
        },
        570: {
          items: 2,
          slideBy: 2,
          nav: false,
          loop: false
        },
        700: {
          items: 3,
          slideBy: 2,
          nav: false,
          loop: false
        },
        1184: {
          items: 4,
          slideBy: 3,
          nav: true,
          loop: false
        },
        1384: {
          items: 5,
          slideBy: 4,
          nav: true,
          loop: false
        },
        1620: {
          items: 6,
          slideBy: 5,
          nav: true,
          loop: false
        }
      }
    });
  }
}

Template.videoslider.refreshSlider = function () {
  window.dispatchEvent(new Event('resize'))
}