var carousel = require('owl.carousel')

Template.videoslider.isOnMobile = function () {
  if (/Mobi/.test(navigator.userAgent)) {
    return true;
  }
}

Template.videoslider.rendered = function () {
  var random = Template.publish.randomPermlink(10)
  this.firstNode.id = random
  Template.videoslider.createSlider(random)
  $(this.firstNode).find('.dropdown').dropdown({});
  Template.settingsdropdown.nightMode();
}

Template.videoslider.createSlider = function (elemId) {
  if (Template.videoslider.isOnMobile() == true) {
    $("#" + elemId).owlCarousel({
      loop: true,
      margin: 2,
      nav: true,
      navText: ["<i class='chevron left icon semanticui-nextprev-icon'></i>","<i class='chevron right icon semanticui-nextprev-icon'></i>"],
      items: 5,
      slideBy: 2,
      dots: false,
      lazyLoad: true,
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
        699: {
         items: 3,
         slideBy: 2,
        nav: true
       },
       854: {
         items: 4,
         slideBy: 3,
         nav: true
       },
       1060: {
         items: 5,
         slideBy: 4,
         nav: true,
         loop: true
       }
      }
    });
  }
  else {
    $("#" + elemId).owlCarousel({
      loop: true,
      margin: 2,
      responsiveBaseElement: document.getElementsByClassName('ui container'),
      nav: true,
      navText: ["<i class='chevron left icon semanticui-nextprev-icon'></i>","<i class='chevron right icon semanticui-nextprev-icon'></i>"],
      animateOut: 'slideOutDown',
      animateIn: 'flipInX',
      dots: false,
      lazyLoad: true,
      responsiveClass: true,
      responsive: {
         211: {
           items: 1,
           slideBy: 1,
           nav: false
         },
        399: {
           items: 2,
           slideBy: 2,
          nav: false
         },
         642: {
          items: 3,
          slideBy: 2,
         nav: true
        },
        854: {
          items: 4,
          slideBy: 3,
          nav: true
        },
        1060: {
          items: 5,
          slideBy: 4,
          nav: true,
          loop: true
        },
        1272: {
          items: 6,
          slideBy: 5,
          nav: true,
          loop: true
        },
        1484: {
          items: 7,
          slideBy: 5,
          nav: true,
          loop: true
        }
      }
    });
  }
}

Template.videoslider.refreshSlider = function () {
  window.dispatchEvent(new Event('resize'))
}
