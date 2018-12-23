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
        return ChainUsers.findOne({ name: FlowRouter.getParam("author") }).followersCount
    },
    followingCount: function () {
        return ChainUsers.findOne({ name: FlowRouter.getParam("author") }).followsCount
    },
})
