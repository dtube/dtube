Template.videosnap.events({
  'click .remove': function() {
    var removeId = this._id
    Waka.db.Articles.remove(removeId.substring(0, removeId.length-1), function(r) {
      Videos.remove({_id: removeId}, function(r) {
        Videos.refreshWaka()
      })
    })
    event.preventDefault()
  }
})
