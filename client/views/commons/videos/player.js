Template.player.rendered = function () {
  Template.player.init()
}

// change this url if you want to work with your own branch of the player
Template.player.init = function() {
  $('.ui.embed.player').embed({
    url: "https://www.youtube.com/embed/" + FlowRouter.getParam("permlink")
    + "?autoplay=1&showinfo=1&modestbranding=1"
  });
}