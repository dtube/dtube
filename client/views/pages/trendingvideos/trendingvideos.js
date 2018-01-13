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
      observeChanges: true,
      onBottomVisible: function() {
        $('.ui.infinite .loader').show()
        Videos.getVideosBy('trending', 50, function(err){
          if (err) console.log(err)
          $('.ui.infinite .loader').hide()
        })
      }
    });
}
