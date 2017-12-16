Template.tags.helpers({
    currentTag: function () {
        return FlowRouter.getParam("tag")
    },
    tagVideos: function() {
        return Videos.find({
            source: 'askSteem',
            byTags: FlowRouter.getParam("tag")
        }).fetch()
    },
    isOnMobile: function () {
        if (/Mobi/.test(navigator.userAgent)) { 
            return true;
        }
    },
    thisWeek: function () {
      Videos.getVideosByTags(FlowRouter.getParam("tag"), 30, function(err, response) {
      console.log(response)
    }
  )}
})

Template.tags.onRendered(function () {
    Template.sidebar.resetActiveMenu()
});
