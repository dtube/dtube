Template.videosnap.events({
  'click .addwatchlater': function () {
    WatchLater.upsert({ _id: this._id }, this)
    event.preventDefault()
  },
  'click .watchlater': function () {
    WatchLater.remove(this._id)
    event.preventDefault()
  },
  'click #remove': function () {
    var removeId = this._id
    Waka.db.Articles.remove(removeId.substring(0, removeId.length - 1), function (r) {
      Videos.remove({ _id: removeId }, function (r) {
      })
    })
    event.preventDefault()
  }
})

Template.videosnap.helpers({
  isInWatchLater: function () {
    return WatchLater.find({ _id: this._id }).fetch()
  },
  isOnWatchAgain: function () {
    return Session.get('isOnWatchAgain')
  }
})

Template.videosnap.rendered = function () {
  $(this.firstNode.nextSibling).find('img').visibility({
    type: 'image',
    transition: 'fade in',
    duration: 1000
  })
  Template.settingsdropdown.nightMode();
  $(this.firstNode.nextSibling).find('#snapload').addClass('loaded');
  $('.ui.infinite')
    .visibility({
      once: false,
      observeChanges: true,
      onBottomVisible: function () {
        $('.ui.infinite .loader').show()
        Videos.getVideosBy('trending', 50, function (err) {
          if (err) console.log(err)
          $('.ui.infinite .loader').hide()
        })
      }
    });

}


