Template.player.rendered = function () {
  Template.player.init()
}

Template.player.setTime = function (seconds) {
  $('video')[0].currentTime = seconds
}

Template.player.init = function() {
  $('.ui.embed.player').embed({
    url: "https://skzap.github.io/embed/#!/" + FlowRouter.getParam("author") + "/" + FlowRouter.getParam("permlink") + "/true/true"
  });
}