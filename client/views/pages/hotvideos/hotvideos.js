Template.hotvideos.helpers({
  isOnMobile: function () {
    if (/Mobi/.test(navigator.userAgent)) { 
        return true;
    }
  },
  hotVideos: function () {
    return Videos.find({ source: 'chainByHot' }).fetch()
  }
})

Template.hotvideos.rendered = function () {
  Template.sidebar.activeSidebarHot();

  $('.ui.infinite')
  .visibility({
    once: false,
    observeChanges: true,
    onBottomVisible: function() {
      $('.ui.infinite .loader').show()
      Videos.getVideosBy('hot', 50, function(err){
        if (err) console.log(err)
        $('.ui.infinite .loader').hide()
      })
    }
  });
}
