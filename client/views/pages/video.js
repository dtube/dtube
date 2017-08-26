Template.video.rendered = function() {

}

Template.video.helpers({
  video: function() {
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
  localIpfs: function() {
    return Session.get('localIpfs')
  }
})

Template.video.events({
  'click .upvote': function(event) {
    var wif = Users.findOne({username: Session.get('activeUsername')}).privatekey
    var voter = Users.findOne({username: Session.get('activeUsername')}).username
    var author = FlowRouter.getParam("author")
    var permlink = FlowRouter.getParam("permlink")
    var weight = Session.get('voteWeight')*100
    steem.broadcast.vote(wif, voter, author, permlink, weight, function(err, result) {
      if (err) toastr.error(Meteor.blockchainError(err), 'Could not vote')
      else toastr.success(weight/100+'% vote for '+author+'/'+permlink)
      Template.video.loadState()
    });
    Template.video.pinFile(author, permlink, function(e,r) {
      console.log(e,r)
    })
  },
  'click .downvote': function(event) {
    var wif = Users.findOne({username: Session.get('activeUsername')}).privatekey
    var voter = Users.findOne({username: Session.get('activeUsername')}).username
    var author = FlowRouter.getParam("author")
    var permlink = FlowRouter.getParam("permlink")
    var weight = Session.get('voteWeight')*-100
    steem.broadcast.vote(wif, voter, author, permlink, weight, function(err, result) {
      if (err) toastr.error(err.cause.payload.error.data.stack[0].format, 'Could not vote')
      else toastr.success(weight/100+'% downvote for '+author+'/'+permlink)
      Template.video.loadState()
    });
  },
  'click .replyTo': function(event) {
    Session.set('replyingTo', {
      author: $(event.target).data('author'),
      permlink: $(event.target).data('permlink')
    })
  },
  'click .submit': function() {
    if (!Session.get('replyingTo')) return;
    var wif = Users.findOne({username: Session.get('activeUsername')}).privatekey
    var parentAuthor = Session.get('replyingTo').author
    var parentPermlink = Session.get('replyingTo').permlink
    var author = Users.findOne({username: Session.get('activeUsername')}).username
    var permlink = Template.upload.createPermlink(9)
    var title = permlink
    var body = $('textarea')[0].value
    var jsonMetadata = {
      app: 'dtube'
    }
    steem.broadcast.comment(wif, parentAuthor, parentPermlink, author, permlink, title, body, jsonMetadata, function(err, result) {
      console.log(err,result)
      if (err) {
        toastr.error(err.payload.error.data.stack[0].format, 'Error')
        return
      }
      Template.video.loadState()
      Session.set('replyingTo', null)
    });
  }
})

Template.video.setTime = function(seconds) {
  $('video')[0].currentTime = seconds
}

Template.video.loadState = function() {
  steem.api.getState('/dtube/@'+FlowRouter.getParam("author")+'/'+FlowRouter.getParam("permlink"), function(err, result) {
    if (err) throw err;
    for (var key in result.accounts) {
      var user = result.accounts[key]
      try {
        user.json_metadata = JSON.parse(user.json_metadata)
      } catch(e) {
      }
      ChainUsers.upsert({_id: user.id}, Waka.api.DeleteFieldsWithDots(user));
    }

    var video = Videos.parseFromChain(result.content[FlowRouter.getParam("author")+'/'+FlowRouter.getParam("permlink")])
    video.comments = Videos.commentsTree(result.content, FlowRouter.getParam("author"), FlowRouter.getParam("permlink"))
    video.source = 'chainDirect'
    video._id += 'd'
    Videos.upsert({_id: video._id}, video)
    Waka.api.Set({info:video.info, content:video.content}, {}, function(e,r) {
      Videos.refreshWaka()
    })
  });
}

Template.video.loadFromChain = function(loadComments, loadUsers) {
  steem.api.getContent(FlowRouter.getParam("author"), FlowRouter.getParam("permlink"), function(err, result) {
    var video = Videos.parseFromChain(result)
    if (!video) return;
    video.source = 'chainDirect'
    video._id += 'd'
    Videos.upsert({_id: video._id}, video)

    Waka.api.Set({info:video.info, content:video.content}, {}, function(e,r) {
      Videos.refreshWaka()
    })


    if (!loadComments) return
    Template.video.loadComments(FlowRouter.getParam("author"), FlowRouter.getParam("permlink"), true)
  });
}

Template.video.loadComments = function(author, permlink, loadUsers) {
  Session.set('loadingComments', true)
  steem.api.getContentReplies(author, permlink, function(err, result) {
    var oldVideo = Videos.findOne({'info.author': author, 'info.permlink': permlink, source: 'chainDirect'})
    oldVideo.comments = result
    Videos.upsert({_id: oldVideo._id}, oldVideo)

    var usernames = [oldVideo.info.author]
    for (var i = 0; i < oldVideo.comments.length; i++) {
      usernames.push(oldVideo.comments[i].author)
    }
    Session.set('loadingComments', false)
    if (!loadUsers) return
    ChainUsers.fetchNames(usernames)
  });
}

Template.video.pinFile = function(author, permlink, cb) {
  if (!Session.get('localIpfs')) return
  steem.api.getContent(author, permlink, function(e,video) {
    if (!video) return
    var video = Videos.parseFromChain(video)
    localIpfs.pin.add(video.info.snaphash, function(e,r) {
      console.log('pinned snap',e,r)
    })
    localIpfs.pin.add(video.content.videohash, function(e,r) {
      console.log('pinned video',e,r)
    })
  })
}
