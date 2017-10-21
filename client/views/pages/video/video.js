var isLoadingState = false

Template.video.rendered = function () {
  var query = {
    tag: FlowRouter.getParam("author"),
    limit: 100
  };
  steem.api.getDiscussionsByBlog(query, function (err, result) {
    if (err === null) {
      var i, len = result.length;
      var videos = []
      for (i = 0; i < len; i++) {
        var video = Videos.parseFromChain(result[i])
        if (video) videos.push(video)
      }
      for (var i = 0; i < videos.length; i++) {
        videos[i].source = 'chainByBlog'
        videos[i]._id += 'b'
        videos[i].fromBlog = FlowRouter.getParam("author")
        try {
          Videos.upsert({ _id: videos[i]._id }, videos[i])
        } catch (err) {
          console.log(err)
        }
      }
    } else {
      console.log(err);
    }
  });
  $(".ui.sidebar").sidebar('hide');
}

Template.video.helpers({
  isOnMobile: function () {
    if (/Mobi/.test(navigator.userAgent)) {
      return true;
    }
  },
  switchMobile: function () {
    $('#videodtube').addClass('videomobile');      
  },
  switchDesktop: function () {
    $('#videodtube').addClass('videodesktop');      
  },
  user: function () {
    return {
      name: FlowRouter.getParam("author")
    }
  },
  userVideosAndResteems: function () {
    return Videos.find({ fromBlog: FlowRouter.getParam("author"), source: 'chainByBlog' }, { limit: 6 }).fetch();
  },
  author: function () {
    return ChainUsers.findOne({ name: FlowRouter.getParam("author") })
  },
  video: function () {
    var videos = Videos.find({
      'info.author': FlowRouter.getParam("author"),
      'info.permlink': FlowRouter.getParam("permlink")
    }).fetch()

    for (var i = 0; i < videos.length; i++) {
      if (videos[i].source == 'chainDirect') {
        Session.set("pageTitle", videos[i].info.title)
        return videos[i]
      }
    }
    Template.video.loadState()
    steem.api.getFollowCount(FlowRouter.getParam("author"), function (e, r) {
      SubCounts.upsert({ _id: r.account }, r)
    })

    for (var i = 0; i < videos.length; i++) {
      if (videos[i].source == 'chainByBlog') return videos[i]
      if (videos[i].source == 'chainByHot') return videos[i]
      if (videos[i].source == 'chainByCreated') return videos[i]
      if (videos[i].source == 'chainByTrending') return videos[i]
    }

    for (var i = 0; i < videos.length; i++) {
      if (videos[i].source == 'wakaArticles') return videos[i]
    }
    if (videos && videos[0]) return videos[0]
    return;
  },
  localIpfs: function () {
    return Session.get('localIpfs')
  }
})

Template.video.events({
  'click .upvote': function (event) {
    var wif = Users.findOne({ username: Session.get('activeUsername') }).privatekey
    var voter = Users.findOne({ username: Session.get('activeUsername') }).username
    var author = FlowRouter.getParam("author")
    var permlink = FlowRouter.getParam("permlink")
    var weight = Session.get('voteWeight') * 100
    steem.broadcast.vote(wif, voter, author, permlink, weight, function (err, result) {
      if (err) toastr.error(Meteor.blockchainError(err), translate('GLOBAL_ERROR_COULD_NOT_VOTE'))
      else toastr.success(translate('GLOBAL_ERROR_VOTE_FOR', weight / 100 + '%', author + '/' + permlink))
      Template.video.loadState()
    });
    Template.video.pinFile(author, permlink, function (e, r) {
      console.log(e, r)
    })
  },
  'click .downvote': function (event) {
    var wif = Users.findOne({ username: Session.get('activeUsername') }).privatekey
    var voter = Users.findOne({ username: Session.get('activeUsername') }).username
    var author = FlowRouter.getParam("author")
    var permlink = FlowRouter.getParam("permlink")
    var weight = Session.get('voteWeight') * -100
    steem.broadcast.vote(wif, voter, author, permlink, weight, function (err, result) {
      if (err) toastr.error(err.cause.payload.error.data.stack[0].format, translate('GLOBAL_ERROR_COULD_NOT_VOTE'))
      else toastr.success(translate('GLOBAL_ERROR_DOWNVOTE_FOR', weight / 100 + '%', author + '/' + permlink))
      Template.video.loadState()
    });
  },
  'click .replyTo': function (event) {
    Session.set('replyingTo', {
      author: $(event.target).data('author'),
      permlink: $(event.target).data('permlink')
    })
  },
  'click .submit': function () {
    if (!Session.get('replyingTo')) return;
    var wif = Users.findOne({ username: Session.get('activeUsername') }).privatekey
    var parentAuthor = Session.get('replyingTo').author
    var parentPermlink = Session.get('replyingTo').permlink
    var author = Users.findOne({ username: Session.get('activeUsername') }).username
    var permlink = Template.upload.createPermlink(9)
    var title = permlink
    var body = $('textarea')[0].value
    var jsonMetadata = {
      app: 'dtube'
    }
    steem.broadcast.comment(wif, parentAuthor, parentPermlink, author, permlink, title, body, jsonMetadata, function (err, result) {
      console.log(err, result)
      if (err) {
        toastr.error(err.payload.error.data.stack[0].format, 'Error')
        return
      }
      Template.video.loadState()
      Session.set('replyingTo', null)
    });
  },
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
        // steem.api.getFollowCount(FlowRouter.getParam("author"), function(e,r) {
        //   SubCounts.upsert({_id: r.account}, r)
        // })
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

Template.video.setTime = function (seconds) {
  $('video')[0].currentTime = seconds
}

Template.video.startPlayer = function (videoGateway, snapGateway) {
  if (!$('.ui.embed').hasClass('active')) {
    $('.ui.embed').embed({
      url: "https://skzap.github.io/embedtube/#!/" + FlowRouter.getParam("author") + "/" + FlowRouter.getParam("permlink") + "/true/true/" + videoGateway + "/" + snapGateway
    });
  }
}

Template.video.loadState = function () {
  if (isLoadingState) return
  isLoadingState = true
  steem.api.getState('/dtube/@' + FlowRouter.getParam("author") + '/' + FlowRouter.getParam("permlink"), function (err, result) {
    if (err) throw err;
    console.log('Loaded video from chain')
    isLoadingState = false
    for (var key in result.accounts) {
      var user = result.accounts[key]
      try {
        user.json_metadata = JSON.parse(user.json_metadata)
      } catch (e) {
      }
      ChainUsers.upsert({ _id: user.id }, Waka.api.DeleteFieldsWithDots(user));
    }

    var video = Videos.parseFromChain(result.content[FlowRouter.getParam("author") + '/' + FlowRouter.getParam("permlink")])
    video.comments = Videos.commentsTree(result.content, FlowRouter.getParam("author"), FlowRouter.getParam("permlink"))
    video.source = 'chainDirect'
    video._id += 'd'
    Videos.upsert({ _id: video._id }, video)
    Waka.api.Set({ info: video.info, content: video.content }, {}, function (e, r) {
      Videos.refreshWaka()
    })
    Template.video.startPlayer(Meteor.ipfsGatewayFor(video.content.videohash), Meteor.ipfsGatewayFor(video.info.snaphash))
  });
}

Template.video.loadFromChain = function (loadComments, loadUsers) {
  steem.api.getContent(FlowRouter.getParam("author"), FlowRouter.getParam("permlink"), function (err, result) {
    var video = Videos.parseFromChain(result)
    if (!video) return;
    video.source = 'chainDirect'
    video._id += 'd'
    Videos.upsert({ _id: video._id }, video)

    Waka.api.Set({ info: video.info, content: video.content }, {}, function (e, r) {
      Videos.refreshWaka()
    })
    if (!loadComments) return
    Template.video.loadComments(FlowRouter.getParam("author"), FlowRouter.getParam("permlink"), true)
  });
}

Template.video.loadComments = function (author, permlink, loadUsers) {
  Session.set('loadingComments', true)
  steem.api.getContentReplies(author, permlink, function (err, result) {
    var oldVideo = Videos.findOne({ 'info.author': author, 'info.permlink': permlink, source: 'chainDirect' })
    oldVideo.comments = result
    Videos.upsert({ _id: oldVideo._id }, oldVideo)

    var usernames = [oldVideo.info.author]
    for (var i = 0; i < oldVideo.comments.length; i++) {
      usernames.push(oldVideo.comments[i].author)
    }
    Session.set('loadingComments', false)
    if (!loadUsers) return
    ChainUsers.fetchNames(usernames)
  });
}

Template.video.pinFile = function (author, permlink, cb) {
  if (!Session.get('localIpfs')) return
  steem.api.getContent(author, permlink, function (e, video) {
    if (!video) return
    var video = Videos.parseFromChain(video)
    localIpfs.pin.add(video.info.snaphash, function (e, r) {
      console.log('pinned snap', e, r)
    })
    localIpfs.pin.add(video.content.videohash, function (e, r) {
      console.log('pinned video', e, r)
    })
  })
}
