var carousel = require('owl.carousel')

Template.genreslider.isOnMobile = function () {
  if (/Mobi/.test(navigator.userAgent)) {
    return true;
  }
}

Template.genreslider.rendered = function (first, second) {
  var random = Template.publish.randomPermlink(10)
  this.firstNode.id = random
  Template.genreslider.createSlider(random, this.data.length)
  $(this.firstNode).find('.dropdown').dropdown({});
  Template.settingsdropdown.nightMode();
}

Template.genreslider.createSlider = function (elemId,itemCount) {
  if (Template.genreslider.isOnMobile() == true) {
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
          slideBy: 2,
          loop: itemCount > 2
        },
        499: {
          items: 3,
          nav: false,
          slideBy: 2,
          loop: itemCount > 3
        },
        699: {
         items: 3,
         slideBy: 2,
        nav: true,
        loop: itemCount > 3
       },
       854: {
         items: 4,
         slideBy: 2,
         nav: true,
         loop: itemCount > 4
       },
       1060: {
         items: 5,
         slideBy: 2,
         nav: true,
         loop: itemCount > 5
       }
      }
    });
  }
  else {
    $("#" + elemId).owlCarousel({
      loop: true,
      margin: 2,
      items: 6,
      slideBy: 3,
      responsiveBaseElement: document.getElementsByClassName('ui container'),
      nav: true,
      navText: ["<i class='chevron left icon semanticui-nextprev-icon'></i>","<i class='chevron right icon semanticui-nextprev-icon'></i>"],
      //animateOut: 'slideOutDown',
      //animateIn: 'flipInX',
      dots: false,
      lazyLoad: true,
      //autoplay: 6000,
      //autoplayTimeout: 100000,
      //autoplayHoverPause: true,
      responsiveClass: true,
      responsive: {
         211: {
           items: 1,
           slideBy: 1,
           nav: false,
           loop: itemCount > 1
         },
        399: {
           items: 2,
           slideBy: 2,
          nav: false,
          loop: itemCount > 2
         },
         642: {
          items: 3,
          slideBy: 2,
         nav: true,
         loop: itemCount > 3
        },
        854: {
          items: 4,
          slideBy: 2,
          nav: true,
          loop: itemCount > 4
        },
        1060: {
          items: 2, //5,
          slideBy: 2,
          nav: true,
          loop: itemCount > 5
        },
        1272: {
          items: 6,
          slideBy: 3,
          nav: true,
          loop: itemCount > 6
        },
        1484: {
          items: 5,//7,
          slideBy: 3,
          nav: true,
          loop: itemCount > 7
        }
      }
    });
    //$("#" + elemId).trigger('play.owl.autoplay',[5000]);
  }
}

Template.genreslider.refreshSlider = function () {
  window.dispatchEvent(new Event('resize'))
}
