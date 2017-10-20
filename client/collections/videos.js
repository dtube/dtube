Videos = new Mongo.Collection(null)

firstLoad = setInterval(function() {
  if (!Videos) return
  if (!Waka) return
  // loading videos

  Videos.refreshBlockchain(function() {
    Videos.refreshWaka()
  })
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

Videos.refreshBlockchain = function(cb) {
  var nbCompleted = 0;
  Videos.getVideosBy('hot', null, function() {
    returnFn()
  })
  Videos.getVideosBy('trending', null, function() {
    returnFn()
  })
  Videos.getVideosBy('created', null, function() {
    returnFn()
  })
  var returnFn = function() {
    nbCompleted++
    if (nbCompleted == 3)
      cb()
  }
}

Videos.getVideosBy = function(type, limit, cb) {
  var query = {
    "tag": "dtube",
    "limit": Session.get('remoteSettings').loadLimit,
    "truncate_body": 1
  }

  if (limit) query.limit = limit

  switch(type) {
    case 'trending':
        steem.api.getDiscussionsByTrending(query, function(err, result) {
          if (err === null) {
              var i, len = result.length;
              var videos = []
              for (i = 0; i < len; i++) {
                  var video = Videos.parseFromChain(result[i])
                  if (video) videos.push(video)
              }
              for (var i = 0; i < videos.length; i++) {
                videos[i].source = 'chainByTrending'
                videos[i]._id += 't'
                try {
                  Videos.upsert({_id: videos[i]._id}, videos[i])
                } catch(err) {
                  console.log(err)
                  cb(err)
                }
              }
              cb(null)
          } else {
              console.log(err);
              cb(err)
          }
        });
        break;
    case 'hot':
        steem.api.getDiscussionsByHot(query, function(err, result) {
          if (err === null) {
              var i, len = result.length;
              var videos = []
              for (i = 0; i < len; i++) {
                  var video = Videos.parseFromChain(result[i])
                  if (video) videos.push(video)
              }
              for (var i = 0; i < videos.length; i++) {
                videos[i].source = 'chainByHot'
                videos[i]._id += 'h'
                try {
                  Videos.upsert({_id: videos[i]._id}, videos[i])
                } catch(err) {
                  console.log(err)
                  cb(err)
                }
              }
              cb(null)
          } else {
              console.log(err);
              cb(err)
          }
        });
        break;
    case 'created':
        steem.api.getDiscussionsByCreated(query, function(err, result) {
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
                  cb(err)
                }
              }
              cb(null)
          } else {
              console.log(err);
              cb(err)
          }
        });
        break;
    default:
        console.log('Error getVideosBy type unknown')
  }
}

Videos.loadFeed = function(username) {
  console.log('Loading feed for '+username)
  steem.api.getDiscussionsByFeed({"tag": username, "limit": 100, "truncate_body": 1}, function(err, result) {
    if (err === null) {
        var i, len = result.length;
        var videos = []
        for (i = 0; i < len; i++) {
            //console.log(result[i].author, result[i].reblogged_by)
            var video = Videos.parseFromChain(result[i])
            if (!video) continue;
            videos.push(video)
        }
        for (var i = 0; i < videos.length; i++) {
          videos[i].source = 'chainByFeed-'+username
          videos[i]._id += 'f'
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
  newVideo.curator_payout_value = video.curator_payout_value
  newVideo.pending_payout_value = video.pending_payout_value
  newVideo.permlink = video.permlink
  newVideo.created = video.created
  newVideo.net_rshares = video.net_rshares
  newVideo.reblogged_by = video.reblogged_by
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
  comments = comments.sort(function(a,b) {
    var diff = parseInt(b.total_payout_value.split(' ')[0].replace('.',''))
      +parseInt(b.curator_payout_value.split(' ')[0].replace('.',''))
      +parseInt(b.pending_payout_value.split(' ')[0].replace('.',''))
      -parseInt(a.total_payout_value.split(' ')[0].replace('.',''))
      -parseInt(a.curator_payout_value.split(' ')[0].replace('.',''))
      -parseInt(a.pending_payout_value.split(' ')[0].replace('.',''))
    if (diff == 0) {
      return new Date(b.created) - new Date(a.created)
    } return diff
  })
  return comments
}
