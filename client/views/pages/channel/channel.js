Template.channel.rendered = function () {
  console.log(SubCounts.findOne({ account: FlowRouter.getParam("author") }))

}


Template.channel.helpers({
  user: function () {
    return {
      name: FlowRouter.getParam("author")
    }
  },
  author: function () {
    return ChainUsers.findOne({ name: FlowRouter.getParam("author") })
  },
  isOnMobile: function () {
    if (/Mobi/.test(navigator.userAgent)) {
        return true;
    }
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
    return subCount.follower_count;
  }
})

Template.channel.events({
  'click .subscribe': function () {
    var json = JSON.stringify(
      ['follow', {
        follower: Session.get('activeUsername'),
        following: FlowRouter.getParam("author"),
        what: ['blog']
      }]
    );
    var subCount = SubCounts.findOne({ account: FlowRouter.getParam("author") })
    subCount.follower_count++
    SubCounts.upsert({ _id: subCount._id }, subCount)
    Subs.insert({
      follower: Session.get('activeUsername'),
      following: FlowRouter.getParam("author"),
      what: ['blog']
    })
    steem.broadcast.customJson(
      Users.findOne({ username: Session.get('activeUsername') }).privatekey,
      [],
      [Session.get('activeUsername')],
      'follow',
      json,
      function (err, result) {
        // alternative, inutile jusqua preuve du contraire
        steem.api.getFollowCount(FlowRouter.getParam("author"), function(e,r) {
          SubCounts.upsert({_id: r.account}, r)
        })
        if (err)
          toastr.error(Meteor.blockchainError(err))

      }
    );
  },
  'click .unsubscribe': function () {
    var json = JSON.stringify(
      ['follow', {
        follower: Session.get('activeUsername'),
        following: FlowRouter.getParam("author"),
        what: []
      }]
    );
    var subCount = SubCounts.findOne({ account: FlowRouter.getParam("author") })
    subCount.follower_count--
    SubCounts.upsert({ _id: subCount._id }, subCount)
    Subs.remove({
      follower: Session.get('activeUsername'),
      following: FlowRouter.getParam("author")
    })
    steem.broadcast.customJson(
      Users.findOne({ username: Session.get('activeUsername') }).privatekey,
      [],
      [Session.get('activeUsername')],
      'follow',
      json,
      function (err, result) {
        if (err)
          toastr.error(Meteor.blockchainError(err))
      }
    );
  }
})
