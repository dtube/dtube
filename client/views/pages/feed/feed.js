Template.feed.helpers({
    feedVideos: function () {
      return Videos.find({ source: 'chainByFeed-' + FlowRouter.getParam('username'), "json.hide": {$ne: 1} }).fetch()
    },
    username: function() {
      return FlowRouter.getParam('username')
    }
  })
  
  Template.feed.rendered = function () {
    $('.ui.infinite')
    .visibility({
      once: false,
      observeChanges: true,
      onBottomVisible: function() {
        $('.ui.infinite .loader').show()
        Videos.loadFeed(FlowRouter.getParam('username'), false, function() {
            $('.ui.infinite .loader').hide()
        })
      }
    });
  }
  