Template.trendingvideos.helpers({
  isOnMobile: function () {
    if (/Mobi/.test(navigator.userAgent)) { 
        return true;
    }
  },
  trendingVideos: function () {
    return Videos.find({ source: 'chainByTrending' }).fetch()
  }
})

Template.trendingvideos.rendered = function () {
  Template.sidebar.activeSidebarTrending();

  $('.ui.infinite')
    .visibility({
      once: false,
      // update size when new content loads
      observeChanges: true,
      // load content on bottom edge visible
      onBottomVisible: function() {
        // loads a max of 5 times
        $('.ui.infinite .loader').show()
        Videos.getVideosBy('trending', 25, function(err){
          if (err) console.log(err)
          $('.ui.infinite .loader').hide()
        })
      }
    });
}
