var moment = require('moment')

Template.newvideos.helpers({
  newVideos: function () {
    return Videos.find({ source: 'chainByCreated', "json.hide": {$ne: 1} }).fetch()
  }
})

Template.newvideos.rendered = function () {
  $('.ui.infinite')
    .visibility({
      once: false,
      observeChanges: true,
      onBottomVisible: function () {
        $('.ui.infinite .loader').show()
        Videos.getVideosBy('created', 50, function (err) {
          if (err) console.log(err)
          $('.ui.infinite .loader').hide()
        })
      }
    });
}
