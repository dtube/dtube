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
  }
})
  
Template.videosnap.helpers({
  isInWatchLater: function() {
    return  WatchLater.find({_id: this._id}).fetch()
  }
})