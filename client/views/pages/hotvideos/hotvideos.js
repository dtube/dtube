Template.hotvideos.helpers({
  hotVideos: function () {
    return Videos.find({ source: 'chainByHot', "json.hide": {$ne: 1} }).fetch()
  }
})

Template.hotvideos.rendered = function () {
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
