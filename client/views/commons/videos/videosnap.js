Template.videosnap.events({
  'click .addwatchlater': function () {
    WatchLaterCollection.upsert({ _id: this._id }, this)
    event.preventDefault()
  },
  'click .watchlater': function () {
    WatchLaterCollection.remove(this._id)
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
  isInWatchLaterCollection: function () {
    return WatchLaterCollection.find({ _id: this._id }).fetch()
  }
})