Template.channeldesktopcover.helpers({
    mainUser: function () {
      return Users.findOne({ username: Session.get('activeUsername') })
    },
    user: function () {
      return {
        name: FlowRouter.getParam("author")
      }
    },
    author: function () {
      return ChainUsers.findOne({ name: FlowRouter.getParam("author") })
    },
    activeUser: function () {
      return Session.get('activeUsername')
    },
    subCount: function () {
      var subCount = SubCounts.findOne({ account: FlowRouter.getParam("author") })
      if (!subCount || !subCount.follower_count) return 0
      return subCount.follower_count;
    }
  })