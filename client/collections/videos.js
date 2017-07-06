import moment from 'moment'

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
  steem.api.getDiscussionsByCreated({"tag": "dtube", "limit": 6}, function(err, result) {
    if (err === null) {
        var i, len = result.length;
        var videos = []
        for (i = 0; i < len; i++) {
            var video = Videos.parseFromChain(result[i])
            videos.push(video)
        }
        for (var i = 0; i < videos.length; i++) {
          videos[i].source = 'chainByCreated'
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
  steem.api.getDiscussionsByHot({"tag": "dtube", "limit": 6}, function(err, result) {
    if (err === null) {
        var i, len = result.length;
        var videos = []
        for (i = 0; i < len; i++) {
            var video = Videos.parseFromChain(result[i])
            videos.push(video)
        }
        for (var i = 0; i < videos.length; i++) {
          videos[i].source = 'chainByHot'
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
  steem.api.getDiscussionsByTrending({"tag": "dtube", "limit": 6}, function(err, result) {
    if (err === null) {
        var i, len = result.length;
        var videos = []
        for (i = 0; i < len; i++) {
            var video = Videos.parseFromChain(result[i])
            videos.push(video)
        }
        for (var i = 0; i < videos.length; i++) {
          videos[i].source = 'chainByTrending'
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
  var newVideo = JSON.parse(video.json_metadata).video
  newVideo.active_votes = video.active_votes
  newVideo.pending_payout_value = video.pending_payout_value
  newVideo.created = video.created
  newVideo.created = moment(video.created).fromNow()
  return newVideo;
}
