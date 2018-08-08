import moment from 'moment'
import xss from 'xss'

Videos = new Mongo.Collection(null)

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
  if (!Session.get('lastHot'))
    Videos.getVideosBy('hot', null, function() {
      returnFn()
    })
  if (!Session.get('lastTrending'))
    Videos.getVideosBy('trending', null, function() {
      returnFn()
    })
  if (!Session.get('lastCreated'))
    Videos.getVideosBy('created', null, function() {
      returnFn()
    })
  var returnFn = function() {
    if (Session.get('lastHot') && Session.get('lastTrending') && Session.get('lastCreated'))
      cb()
  }
}

Videos.getVideosRelatedTo = function(author, permlink, days, cb) {
  var dateFrom = moment().subtract(days,'d').format('YYYY-MM-DD');
  var dateQuery = 'created:>='+dateFrom
  AskSteem.related({author: author, permlink: permlink, include: 'meta,payout', q:dateQuery+" AND meta.video.info.title:*"}, function(err, response) {
    var videos = []
    for (let i = 0; i < response.results.length; i++) {
      var video = Videos.parseFromAskSteemResult(response.results[i])
      if (video) videos.push(video)
    }
    for (let i = 0; i < videos.length; i++) {
      videos[i].source = 'askSteem'
      videos[i]._id += 'a'
      videos[i].relatedTo = author+'/'+permlink
      try {
        Videos.upsert({ _id: videos[i]._id }, videos[i])
      } catch (err) {
        cb(err)
      }
    }
    cb(null)
  })
}

Videos.getVideosByTags = function(page, tags, days, sort_by, order, maxDuration, cb) {
  var queries = []
  if (days) {
    dateTo = moment().format('YYYY-MM-DD');
    dateFrom = moment().subtract(days,'d').format('YYYY-MM-DD');
    queries.push('created:>='+dateFrom)
  }
  if (maxDuration && maxDuration < 99999)
    queries.push('meta.video.info.duration:<='+maxDuration)
  for (let i = 0; i < tags.length; i++)
    queries.push('meta.video.content.tags:'+tags[i])

  var query = queries.join(' AND ')

  AskSteem.search({
    q: query,
    include: 'meta,payout',
    sort_by: sort_by,
    pg: page,
    order: order,
    types: 'post'
  }, function(err, response) {
    var videos = []
    for (let i = 0; i < response.results.length; i++) {
      var video = Videos.parseFromAskSteemResult(response.results[i])
      if (video) videos.push(video)
    }
    for (let i = 0; i < videos.length; i++) {
      videos[i].source = 'askSteem'
      videos[i]._id += 'a'
      videos[i].askSteemQuery = {
        tags: tags.join('+'),
        byDays: days,
        sort_by: sort_by,
        order: order
      }
      try {
        Videos.upsert({ _id: videos[i]._id }, videos[i])
      } catch (err) {
        cb(err)
      }
    }
    cb(null)
  })
}

Videos.setLastBlog = function(channel, item) {
  var lastBlogs = Session.get('lastBlogs')
  lastBlogs[channel] = item
  Session.set('lastBlogs', lastBlogs)
} 

Videos.getVideosByBlog = function(author, limit, cb) {
  var query = {
    tag: author,
    limit: Session.get('remoteSettings').loadLimit,
    truncate_body: 1
  };

  if (limit) query.limit = limit

  if (Session.get('lastBlogs')[author]) {
    query.start_author = Session.get('lastBlogs')[author].author
    query.start_permlink = Session.get('lastBlogs')[author].permlink
  }

  steem.api.getDiscussionsByBlog(query, function (err, result) {
    if (err === null || err === '') {
      Videos.setLastBlog(author, result[result.length-1])
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
          cb(err)
        }
      }
      cb(null)
    } else {
      cb(err);
    }
  });
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
        if (Session.get('lastTrending')) {
          query.start_author = Session.get('lastTrending').author
          query.start_permlink = Session.get('lastTrending').permlink
        }
        steem.api.getDiscussionsByTrending(query, function(err, result) {
          if (err === null || err === '') {
              Session.set('lastTrending', result[result.length-1])
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
        if (Session.get('lastHot')) {
          query.start_author = Session.get('lastHot').author
          query.start_permlink = Session.get('lastHot').permlink
        }
        steem.api.getDiscussionsByHot(query, function(err, result) {
          if (err === null || err === '') {
              Session.set('lastHot', result[result.length-1])
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
        if (Session.get('lastCreated')) {
          query.start_author = Session.get('lastCreated').author
          query.start_permlink = Session.get('lastCreated').permlink
        }
        steem.api.getDiscussionsByCreated(query, function(err, result) {
          Session.set('lastCreated', result[result.length-1])
          if (err === null || err === '') {
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
    case 'createdLive':
        steem.api.getDiscussionsByCreated(query, function(err, result) {
          if (err === null || err === '') {
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
  console.log('Loading notifications for '+username)
  Notifications.getCentralized()

  console.log('Loading feed for '+username)
  steem.api.getDiscussionsByFeed({"tag": username, "limit": 100, "truncate_body": 1}, function(err, result) {
    if (err === null || err === '') {
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

Videos.parseFromChain = function(video, isComment) {
  try {
    var newVideo = JSON.parse(video.json_metadata).video
  } catch(e) {}
  if (!isComment && !newVideo) return
  if (!isComment && !newVideo.info) return
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
  
  // xss attack fix
  if (newVideo.content && newVideo.content.tags) {
    var xssTags = []
    for (let i = 0; i < newVideo.content.tags.length; i++) {
      xssTags.push(xss(newVideo.content.tags[i], {
        whiteList: [],
        stripIgnoreTag: true,
        stripIgnoreTagBody: ['script']
      }))
    }
    newVideo.content.tags = xssTags
  }

  if (!newVideo._id) newVideo._id = newVideo.author+'_'+newVideo.permlink
  return newVideo;
}

Videos.parseFromAskSteemResult = function(result) {
  try {
    var newVideo = result.meta.video
  } catch(e) {
    console.log(e)
  }
  if (!newVideo) return
  newVideo.active_votes = result.net_votes
  newVideo.author = result.author
  newVideo.permlink = result.permlink
  newVideo.created = result.created
  newVideo.pending_payout_value = result.payout+' SBD'
  newVideo.total_payout_value = '0.000 SBD'
  newVideo.curator_payout_value = '0.000 SBD'
  if (!newVideo._id) newVideo._id = newVideo.author+'_'+newVideo.permlink
  return newVideo;
}

Videos.commentsTree = function(content, rootAuthor, rootPermlink) {
  var rootVideo = content[rootAuthor+'/'+rootPermlink]
  var comments = []
  for (var i = 0; i < rootVideo.replies.length; i++) {
    var comment = Videos.parseFromChain(content[rootVideo.replies[i]], true)
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

Videos.getContent = function (author, permlink, loadComments, loadUsers) {
  steem.api.getContent(author, permlink, function (err, result) {
    var video = Videos.parseFromChain(result)
    if (!video) return;
    video.source = 'chainDirect'
    video._id += 'd'
    Videos.upsert({ _id: video._id }, video)
    if (!loadComments) return
    Template.video.loadComments(author, permlink, false)
  });
}

Videos.loadComments = function (author, permlink, loadUsers) {
  Session.set('loadingComments', true)
  steem.api.getContentReplies(author, permlink, function (err, result) {
    var oldVideo = Videos.findOne({ 'info.author': author, 'info.permlink': permlink, source: 'chainDirect' })
    oldVideo.comments = result
    Videos.upsert({ _id: oldVideo._id }, oldVideo)
    Session.set('loadingComments', false)

    if (!loadUsers) return
    var usernames = [oldVideo.info.author]
    for (var i = 0; i < oldVideo.comments.length; i++) {
      usernames.push(oldVideo.comments[i].author)
    }
    ChainUsers.fetchNames(usernames)
  })
}
