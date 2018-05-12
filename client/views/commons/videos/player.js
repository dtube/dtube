Template.player.rendered = function () {
  Template.player.init()
}

// change this url if you want to work with your own branch of the player
Template.player.init = function() {
  $('.ui.embed.player').embed({
    url: "https://emb.d.tube/#!/" + FlowRouter.getParam("author") + "/" + FlowRouter.getParam("permlink") + "/true/true"
  });
}