Template.trendingvideos.helpers({
  trendingVideos: function () {
    return Videos.find({ source: 'chainByTrending', "json.hide": {$ne: 1} }).fetch()
  }
})

Template.trendingvideos.rendered = function () {
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
