Videos = new Mongo.Collection(null)

firstLoad = setInterval(function() {
  if (!Videos) return
  if (!Waka) return
  // loading videos
  Videos.refreshWaka()
  Videos.refreshBlockchain()
  clearInterval(firstLoad)
}, 50)

Videos.refreshWaka = function() {
  Waka.db.Articles.find({}).fetch(function(r) {
    // articles we share
    for (var i = 0; i < r.length; i++) {
      r[i].source = 'wakaArticles'
      r[i]._id += 'w'
      try {
        Videos.upsert({_id: r[i]._id}, r[i])
      } catch(err) {
        console.log(err)
      }
    }
  })
  Waka.mem.Peers.find({},{}).fetch(function(res){
    // articles in our network
    var videos = []
    for (var i = 0; i < res.length; i++) {
      if (!res[i].index) continue
      for (var y = 0; y < res[i].index.length; y++) {
        var exists = false
        for (var v = 0; v < videos.length; v++) {
          if (videos[i].title == res[i].index[y].title) {
            videos[i].sharedBy++
            exists = true
          }
        }
        if (!exists) {
          res[i].index[y].sharedBy = 1
          videos.push(res[i].index[y])
        }
      }
    }

    for (var i = 0; i < videos.length; i++) {
      videos[i].source = 'wakaPeers'
      videos[i]._id += 'p'
      try {
        Videos.upsert({_id: videos[i]._id}, videos[i])
      } catch(err) {
        console.log(err)
      }
    }
  })
}

Videos.refreshBlockchain = function() {
  if (!steem) return;
  steem.api.getDiscussionsByCreated({"tag": "dtube", "limit": Meteor.settings.public.loadLimit}, function(err, result) {
    if (err === null) {
        var i, len = result.length;
        var videos = []
        for (i = 0; i < len; i++) {
            var video = Videos.parseFromChain(result[i])
            if (video) videos.push(video)
        }
        for (var i = 0; i < videos.length; i++) {
          videos[i].source = 'chainByCreated'
          videos[i]._id += 'c'
          try {
            Videos.upsert({_id: videos[i]._id}, videos[i])
          } catch(err) {
            console.log(err)
          }
        }
    } else {
        console.log(err);
    }
  });
  steem.api.getDiscussionsByHot({"tag": "dtube", "limit": Meteor.settings.public.loadLimit}, function(err, result) {
    if (err === null) {
        var i, len = result.length;
        var videos = []
        for (i = 0; i < len; i++) {
            var video = Videos.parseFromChain(result[i])
            if (!video) continue;
            videos.push(video)
        }
        for (var i = 0; i < videos.length; i++) {
          videos[i].source = 'chainByHot'
          videos[i]._id += 'h'
          try {
            Videos.upsert({_id: videos[i]._id}, videos[i])
          } catch(err) {
            console.log(err)
          }
        }
    } else {
        console.log(err);
    }
  });
  steem.api.getDiscussionsByTrending({"tag": "dtube", "limit": Meteor.settings.public.loadLimit}, function(err, result) {
    if (err === null) {
        var i, len = result.length;
        var videos = []
        for (i = 0; i < len; i++) {
            var video = Videos.parseFromChain(result[i])
            if (!video) continue;
            videos.push(video)
        }
        for (var i = 0; i < videos.length; i++) {
          videos[i].source = 'chainByTrending'
          videos[i]._id += 't'
          try {
            Videos.upsert({_id: videos[i]._id}, videos[i])
          } catch(err) {
            console.log(err)
          }
        }
    } else {
        console.log(err);
    }
  });
}

Videos.parseFromChain = function(video) {
  try {
    var newVideo = JSON.parse(video.json_metadata).video
  } catch(e) {}
  if (!newVideo && !video.parent_author) return
  if (!newVideo) newVideo = {}
  newVideo.active_votes = video.active_votes
  newVideo.author = video.author
  newVideo.body = video.body
  newVideo.total_payout_value = video.total_payout_value
  newVideo.pending_payout_value = video.pending_payout_value
  newVideo.permlink = video.permlink
  newVideo.created = video.created
  return newVideo;
}

Videos.commentsTree = function(content, rootAuthor, rootPermlink) {
  var rootVideo = content[rootAuthor+'/'+rootPermlink]
  var comments = []
  for (var i = 0; i < rootVideo.replies.length; i++) {
    var comment = Videos.parseFromChain(content[rootVideo.replies[i]])
    comment.comments = Videos.commentsTree(content, content[rootVideo.replies[i]].author, content[rootVideo.replies[i]].permlink)
    comments.push(comment)
  }
  return comments
}
