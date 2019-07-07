Template.comments.rendered = function () {
  $('.ui.accordion').accordion({
    exclusive: false, closeNested: false, animateChildren: false, duration: 0, selector    : {
      accordion : '.accordion',
      trigger   : '#showreplies',
      content   : '.content'
    }
  });
}