Template.playerlive.rendered = function () {
    Template.playerlive.init()
  }
  
  // change this url if you want to work with your own branch of the player
  Template.playerlive.init = function() {
    $('.ui.embed.player').embed({
      url: "https://emb.d.tube/#!/" + FlowRouter.getParam("author") + "/live/true/true"
    });
  }