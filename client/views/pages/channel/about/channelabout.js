Template.channelabout.rendered = function () {
    Template.settingsdropdown.nightMode();
  }

Template.channelabout.helpers({
    author: function () {
        return ChainUsers.findOne({ name: FlowRouter.getParam("author") })
    },
    userVideos: function () {
        return Videos.find({ 'info.author': FlowRouter.getParam("author"), source: 'chainByBlog' }).fetch()
    },
    user: function () {
        return {
            name: FlowRouter.getParam("author")
        }
    },
    subCount: function () {
        var subCount = SubCounts.findOne({ account: FlowRouter.getParam("author") })
        if (!subCount || !subCount.follower_count) return 0
        return subCount.follower_count;
      },
      followingCount: function () {
        var subCount = SubCounts.findOne({ account: FlowRouter.getParam("author") })
        if (!subCount || !subCount.following_count) return 0
        return subCount.following_count;
      }
})
