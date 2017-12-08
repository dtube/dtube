Template.videosnap.events({
  'click .addwatchlater': function () {
    WatchLater.upsert({_id: this._id},this)
    event.stopPropagation()
  },
  'click .watchlater': function () {
    WatchLater.remove(this._id)
    event.stopPropagation()
  },
  'click #remove': function () {
    var removeId = this._id
    WatchLater.remove({_id:removeId})
    event.stopPropagation()
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
  isInWatchLater: function() {
    return  WatchLater.find({_id: this._id}).fetch()
  }
})