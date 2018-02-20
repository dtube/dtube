Template.search.helpers({
  search: function () {
    return Session.get('search')
  }
})

Template.search.onRendered(function () {
  if (!Session.get('search')) {
    $('#dsearch').val(FlowRouter.getParam("query"))
    $('.searchForm').submit()
    Template.sidebar.resetActiveMenu()
    Template.settingsdropdown.nightMode();
    // $('.more.video.sgement ')
    // .visibility({
    //   once: false,
    //   // update size when new content loads
    //   observeChanges: true,
    //   // load content on bottom edge visible
    //   onBottomVisible: function() {
    //     // loads a max of 5 times
    //     window.loadFakeContent();
    //   }
    // });
  }
});