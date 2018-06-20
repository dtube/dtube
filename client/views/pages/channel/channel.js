Template.channel.rendered = function () {
  Session.set('relatedChannels', [])
  Session.set('currentTab', 'videos')
  Template.sidebar.selectMenu();
  Template.settingsdropdown.nightMode();
  // $('.ui.maingrid').removeClass('container');
  $('.ui.sticky').sticky();
  $('.menu .item').tab();
  $('.ui.menu .videoshowmore.money').popup({
    inline: true,
    hoverable: true,
    position: 'bottom right',
    delay: {
      show: 100,
      hide: 0
    }
  })
  $('.ui.infinite')
  .visibility({
    once: false,
    observeChanges: true,
    onBottomVisible: function() {
      $('.ui.infinite .loader').show()
      Videos.getVideosByBlog(FlowRouter.getParam("author"), 50, function(err) {
        if (err) console.log(err)
        $('.ui.infinite .loader').hide()
      })
    }
  });
}

Template.channel.helpers({
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
  relatedChannels: function () {
    return Session.get('relatedChannels')
  },
  isLoggedOn: function () {
    return Session.get('activeUsername')
  },
  activeUser: function () {
    return Session.get('activeUsername')
  },
  userVideos: function () {
    return Videos.find({ 'info.author': FlowRouter.getParam("author"), source: 'chainByBlog' }).fetch()
  },
  userResteems: function () {
    var videos = Videos.find({ source: 'chainByBlog', fromBlog: FlowRouter.getParam("author") }).fetch()
    var resteems = []
    for (var i = 0; i < videos.length; i++) {
      if (videos[i].author != FlowRouter.getParam("author"))
        resteems.push(videos[i])
    }
    return resteems
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
  },
  activities: function () {
      return Activities.find({ username: FlowRouter.getParam("author") }, { sort: { date: -1 } }).fetch()
  },
  currentTab: function () {
    return Session.get('currentTab')
  }
})


Template.channel.events({
  'click .subscribe': function () {
    var subCount = SubCounts.findOne({ account: FlowRouter.getParam("author") })
    subCount.follower_count++
    SubCounts.upsert({ _id: subCount._id }, subCount)
    Subs.insert({
      follower: Session.get('activeUsername'),
      following: FlowRouter.getParam("author"),
      what: ['blog']
    })
    broadcast.follow(FlowRouter.getParam("author"), function (err, result) {
      // alternative, inutile jusqua preuve du contraire
      // steem.api.getFollowCount(FlowRouter.getParam("author"), function(e,r) {
      //   SubCounts.upsert({_id: r.account}, r)
      // })
      if (err)
        toastr.error(Meteor.blockchainError(err))
    })
  },
  'click .unsubscribe': function () {
    var subCount = SubCounts.findOne({ account: FlowRouter.getParam("author") })
    subCount.follower_count--
    SubCounts.upsert({ _id: subCount._id }, subCount)
    Subs.remove({
      follower: Session.get('activeUsername'),
      following: FlowRouter.getParam("author")
    })
    broadcast.unfollow(FlowRouter.getParam("author"), function (err, result) {
      // finished unfollowing
      if (err)
        toastr.error(Meteor.blockchainError(err))
    })
  },
  'click .item.activities': function () {
    Session.set('currentTab', 'activities')
  },
  'click .item.about': function () {
    Session.set('currentTab', 'about')
  }
})
