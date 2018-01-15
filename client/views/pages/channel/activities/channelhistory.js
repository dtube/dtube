Template.channelhistory.helpers({
    author: function () {
      return ChainUsers.findOne({ name: FlowRouter.getParam("author") })
    }
  })
  