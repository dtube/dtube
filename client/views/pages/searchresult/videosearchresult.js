Template.videosearchresult.rendered = function () {
  $(this.firstNode.nextSibling).find('img').visibility({
    type       : 'image',
    transition : 'fade in',
    duration   : 1000
  })
  Template.settingsdropdown.nightMode();
}

Template.videosearchresult.helpers({
  currentTag: function () {
      return FlowRouter.getParam("tag")
  },
  tagVideos: function() {
      var sort = {}
      sort[Session.get('tagSortBy')] = -1
      return Videos.find({
          source: 'askSteem',
          'askSteemQuery.tags': FlowRouter.getParam("tag")
      }, {
          sort: sort
      }).fetch()
  },
  isOnMobile: function () {
      if (/Mobi/.test(navigator.userAgent)) { 
          return true;
      }
  }
})
