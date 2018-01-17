Template.channel.rendered = function () {
  Session.set('relatedChannels', [])
  Template.settingsdropdown.nightMode();
  Template.channel.randomBackgroundColor();
  $('.ui.maingrid').removeClass('container');
  $('.ui.sticky').sticky();
  $('.menu .item').tab();
  $('.ui.rating').rating('disable');
  $('.ui.menu .videoshowmore.money').popup({
    inline: true,
    hoverable: true,
    position: 'bottom right',
    delay: {
      show: 100,
      hide: 0
    }
  })
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
  isOnMobile: function () {
    if (/Mobi/.test(navigator.userAgent)) {
      return true;
    }
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
  subscribe: function () {
    return Subs.find({ follower: FlowRouter.getParam("author") }).fetch()
  },
  followers: function () {
    return Subs.find({ following: FlowRouter.getParam("author") }).fetch()
  },
  activities: function () {
      return Activities.find({ username: FlowRouter.getParam("author") }, { sort: { date: -1 } }).fetch()
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
    $('.ui.activities').addClass('infinite')
    Activities.getAccountHistory(FlowRouter.getParam("author") ,-1,20)
    $('.ui.infinite.activities').visibility({
      once: false,
      observeChanges: true,
      onBottomVisible: function () {
        $('.ui.infinite.activities .loader').show()
        Activities.getAccountHistory(FlowRouter.getParam("author"))
        $('.ui.infinite.activities .loader').hide()
      }
    });
  }
})


Template.channel.randomBackgroundColor = function () {
  var rnd = Math.floor(Math.random() * (5 - 1 + 1)) + 1;
  switch (rnd) {
    case 1:
      $('#channelcover').removeAttr('class').addClass('channelcover').addClass('channelbga');
      break;
    case 2:
      $('#channelcover').removeAttr('class').addClass('channelcover').addClass('channelbgb');
      break;
    case 3:
      $('#channelcover').removeAttr('class').addClass('channelcover').addClass('channelbgc');
      break;
    case 4:
      $('#channelcover').removeAttr('class').addClass('channelcover').addClass('channelbgd');
      break;
    default:
      $('#channelcover').removeAttr('class').addClass('channelcover').addClass('channelbge');
  }
}