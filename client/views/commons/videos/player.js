Template.player.rendered = function () {
  $('.ui.embed.player').embed({
    url: "https://emb.d.tube/#!/" + FlowRouter.getParam("author") + "/" + FlowRouter.getParam("permlink") + "/true/true"
  });
}

Template.player.setTime = function (seconds) {
  $('video')[0].currentTime = seconds
}