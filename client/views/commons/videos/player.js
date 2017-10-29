  Template.player.startPlayer = function (videoGateway, snapGateway) {
    $('.ui.embed.player').embed({
      url: "https://skzap.github.io/embedtube/#!/" + FlowRouter.getParam("author") + "/" + FlowRouter.getParam("permlink") + "/true/true/" + videoGateway + "/" + snapGateway
    });
  }
  

  Template.player.setTime = function (seconds) {
    $('video')[0].currentTime = seconds
  }