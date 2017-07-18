Template.video.helpers({
  video: function() {
    var videos = Videos.find({
      'info.author': FlowRouter.getParam("author"),
      'info.permlink': FlowRouter.getParam("permlink")
    }).fetch()

    for (var i = 0; i < videos.length; i++) {
      if (videos[i].source == 'chainDirect') return videos[i]
    }

    steem.api.getContent(FlowRouter.getParam("author"), FlowRouter.getParam("permlink"), function(err, result) {
      var video = Videos.parseFromChain(result)
      if (!video) return;
      video.source = 'chainDirect'
      video._id += 'd'
      Videos.upsert({_id: video._id}, video)

      Waka.api.Set({info:video.info, content:video.content}, {}, function(e,r) {
        Videos.refreshWaka()
      })

      Session.set('loadingComments', true)
      Session.set('replyingTo', {author:FlowRouter.getParam("author"), permlink:FlowRouter.getParam("permlink")})
      steem.api.getContentReplies(FlowRouter.getParam("author"), FlowRouter.getParam("permlink"), function(err, result) {
        var oldVideo = Videos.findOne({'info.author': FlowRouter.getParam("author"), 'info.permlink': FlowRouter.getParam("permlink"), source: 'chainDirect'})
        oldVideo.comments = result
        Videos.upsert({_id: video._id}, oldVideo)

        var usernames = [oldVideo.info.author]
        for (var i = 0; i < oldVideo.comments.length; i++) {
          usernames.push(oldVideo.comments[i].author)
        }
        ChainUsers.fetchNames(usernames)
        Session.set('loadingComments', false)
      });
    });

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

    // var video = Videos.findOne({
    //   'info.author': FlowRouter.getParam("author"),
    //   'info.permlink': FlowRouter.getParam("permlink"),
    //   source: 'wakaArticles'
    // })
    // if (!video) {
    //   video = Videos.findOne({
    //     'info.author': FlowRouter.getParam("author"),
    //     'info.permlink': FlowRouter.getParam("permlink")
    //   })
    // }
    // // if (video && !video.content) {
    // //   Waka.api.Search(video.info.title)
    // // }
    // if (video && video.source == 'wakaArticles') {
    //   steem.api.getContent(FlowRouter.getParam("author"), FlowRouter.getParam("permlink"), function(err, result) {
    //     var video = Videos.parseFromChain(result)
    //     if (!video) return;
    //     video.source = 'chainDirect'
    //     video._id += 'd'
    //     Videos.upsert({_id: video._id}, video)
    //   });
    // }
    // if (video && !video.comments && !Session.get('loadingComments')) {
    //   Session.set('loadingComments', true)
    //   Session.set('replyingTo', {author:FlowRouter.getParam("author"), permlink:FlowRouter.getParam("permlink")})
    //   steem.api.getContentReplies(FlowRouter.getParam("author"), FlowRouter.getParam("permlink"), function(err, result) {
    //     var oldVideo = Videos.findOne({'info.author': FlowRouter.getParam("author"), 'info.permlink': FlowRouter.getParam("permlink")})
    //     oldVideo.comments = result
    //     Videos.upsert({_id: video._id}, oldVideo)
    //
    //     var usernames = [oldVideo.info.author]
    //     for (var i = 0; i < oldVideo.comments.length; i++) {
    //       usernames.push(oldVideo.comments[i].author)
    //     }
    //     ChainUsers.fetchNames(usernames)
    //     Session.set('loadingComments', false)
    //   });
    // }
    // if (video && video.content &&
    //   (video.source == 'chainByCreated' || video.source == 'chainByHot' || video.source == 'chainByTrending' || video.source == 'chainDirect')) {
    //   Waka.api.Set({info:video.info, content:video.content}, {}, function(e,r) {
    //     //Videos.refreshWaka()
    //   })
    // }
    // console.log(video)
    // return video
  }
})

Template.login.events({
  'click .upvote': function(event) {

  }
})
