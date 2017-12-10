Template.popupvoter.rendered = function() {
  //    $('.upvote').popup({
  //        boundary: '.videocontainer',
  //       popup: '.popupupvotes',
  //        position: 'bottom center',
  //        hoverable: true
  //    })
  $('[data-tcs]').each(function() {
    var $el = $(this);
    $el.popup({    
      popup: $el.attr('data-tcs'),
      on: 'hover',
      delay: {
        show: 0,
        hide: 500
      },
      position: 'bottom center',
      hoverable: true
    });
  });
}