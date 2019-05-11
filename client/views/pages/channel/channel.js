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
  reclick = false
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
    return Videos.find({ 'author': FlowRouter.getParam("author"), source: 'chainByBlog' }).fetch()
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
    return ChainUsers.findOne({ name: FlowRouter.getParam("author") }).followersCount || 0
  },
  followingCount: function () {
    return ChainUsers.findOne({ name: FlowRouter.getParam("author") }).followsCount || 0
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
    var user = ChainUsers.findOne({ name: FlowRouter.getParam("author") })
    user.followersCount++
    ChainUsers.upsert({ _id: user._id }, user)
    Subs.insert({
      follower: Session.get('activeUsername'),
      following: FlowRouter.getParam("author"),
      what: ['blog']
    })
    broadcast.avalon.follow(FlowRouter.getParam("author"), function (err, result) {
      // alternative, inutile jusqua preuve du contraire
      // steem.api.getFollowCount(FlowRouter.getParam("author"), function(e,r) {
      //   SubCounts.upsert({_id: r.account}, r)
      // })
      if (err)
        toastr.error(Meteor.blockchainError(err))
    })
  },
  'click .unsubscribe': function () {
    var user = ChainUsers.findOne({ name: FlowRouter.getParam("author") })
    user.followersCount--
    ChainUsers.upsert({ _id: user._id }, user)
    Subs.remove({
      follower: Session.get('activeUsername'),
      following: FlowRouter.getParam("author")
    })
    broadcast.avalon.unfollow(FlowRouter.getParam("author"), function (err, result) {
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
  },
  'click .item.keys': function (e) {
    Session.set('currentTab', 'keys')
    if (!reclick) {
      reclick = true
      $('.menu .item').tab();
      $('.menu .item.keys').click()
      $('.menu .item.keys').addClass('active')
    }
  }
})
