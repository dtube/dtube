Template.channel.rendered = function () {
  console.log(SubCounts.findOne({ account: FlowRouter.getParam("author") }));
  ChainUsers.fetchNames([FlowRouter.getParam("author")], function(error) {
    if (error) console.log('Error fetch name')
  })
  Session.set('isChannelInfoOpen', false)
  $('.ui.sticky').sticky();
  $('.menu .item').tab();
  $('.ui.rating').rating({
    initialRating: 0,
    maxRating: 5
  });
  $('.ui.rating').rating('disable');
  Session.set('relatedChannels', [])
  AskSteem.related({user: FlowRouter.getParam("author")}, function(err, result) {
    Session.set('relatedChannels', result.results)
  })
  Template.settingsdropdown.nightMode();
}

Template.channel.helpers({
  mainUser: function() {
    return Users.findOne({username: Session.get('activeUsername')})
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
  myChannelSidebar:function () {
    Template.sidebar.activeSidebarChannel();
    return
  },
  resetSidebar:function () {
    Template.sidebar.resetActiveMenu();
    return
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
    broadcast.follow(FlowRouter.getParam("author"), function(err, result) {
      // alternative, inutile jusqua preuve du contraire
      // steem.api.getFollowCount(FlowRouter.getParam("author"), function(e,r) {
      //   SubCounts.upsert({_id: r.account}, r)
      // })
      // if (err)
      //   toastr.error(Meteor.blockchainError(err))
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
    broadcast.unfollow(FlowRouter.getParam("author"), function(err, result) {
      // finished unfollowing
    })
  }
})
