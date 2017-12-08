Template.videosnap.events({
  'click .addwatchlater': function () {
    WatchLaterCollection.upsert({_id: this._id},this)
    event.stopPropagation()
},
'click .watchlater': function () {
  WatchLaterCollection.remove(this._id)
  event.stopPropagation()
},
  'click #remove': function () {
    var removeId = this._id
    WatchLaterCollection.remove({_id:removeId})
    event.stopPropagation()
  }
})
  
Template.videosnap.helpers({
  isInWatchLaterCollection: function() {
    return  WatchLaterCollection.find({_id: this._id}).fetch()
  }
})