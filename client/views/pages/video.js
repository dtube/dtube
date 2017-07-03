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
    if (!video) {

    }
    if (video && !video.content) {
      Waka.api.Search(video.info.title)
    }
    if (video && video.content && video.source == 'chainByCreated') {
      Waka.api.Set(video, {}, function(e,r) {
        Videos.refreshWaka()
      })
    }
    return video
  }
})
