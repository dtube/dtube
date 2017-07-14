Template.video.helpers({
  video: function() {
    var video = Videos.findOne({
      'info.author': FlowRouter.getParam("author"),
      'info.permlink': FlowRouter.getParam("permlink"),
      source: 'wakaArticles'
    })
    if (!video) {
      video = Videos.findOne({
        'info.author': FlowRouter.getParam("author"),
        'info.permlink': FlowRouter.getParam("permlink")
      })
    }
    // if (video && !video.content) {
    //   Waka.api.Search(video.info.title)
    // }
    if (video && video.source == 'wakaArticles') {
      steem.api.getContent(FlowRouter.getParam("author"), FlowRouter.getParam("permlink"), function(err, result) {
        var video = Videos.parseFromChain(result)
        video.source = 'chainDirect'
        Videos.upsert({_id: video._id}, video)
      });
    }
    if (video && !video.comments && !Session.get('loadingComments')) {
      Session.set('loadingComments', true)
      Session.set('replyingTo', {author:FlowRouter.getParam("author"), permlink:FlowRouter.getParam("permlink")})
      steem.api.getContentReplies(FlowRouter.getParam("author"), FlowRouter.getParam("permlink"), function(err, result) {
        var oldVideo = Videos.findOne({'info.author': FlowRouter.getParam("author"), 'info.permlink': FlowRouter.getParam("permlink")})
        oldVideo.comments = result
        Videos.upsert({_id: video._id}, oldVideo)

        var usernames = [oldVideo.info.author]
        for (var i = 0; i < oldVideo.comments.length; i++) {
          usernames.push(oldVideo.comments[i].author)
        }
        ChainUsers.fetchNames(usernames)
        Session.set('loadingComments', false)
      });
    }
    if (video && video.content &&
      (video.source == 'chainByCreated' || video.source == 'chainByHot' || video.source == 'chainByTrending' || video.source == 'chainDirect')) {
      Waka.api.Set({info:video.info, content:video.content}, {}, function(e,r) {
        //Videos.refreshWaka()
      })
    }
    return video
  }
})

Template.login.events({
  'click .upvote': function(event) {

  }
})
