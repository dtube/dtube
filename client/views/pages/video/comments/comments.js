Template.comments.rendered = function () {
  $('.ui.accordion').accordion({
    exclusive: true, closeNested: false, animateChildren: false, duration: 0, selector    : {
      accordion : '.accordion',
      trigger   : '#showreplies',
      content   : '.content'
    }
  });
  Template.settingsdropdown.nightMode();
}