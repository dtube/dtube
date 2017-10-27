  Template.player.startPlayer = function (videoGateway, snapGateway) {
    $('.ui.embed.player').embed({
      url: "https://skzap.github.io/embedtube/#!/" + FlowRouter.getParam("author") + "/" + FlowRouter.getParam("permlink") + "/true/true/" + videoGateway + "/" + snapGateway
    });
  }
  