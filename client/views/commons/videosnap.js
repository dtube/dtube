Template.videosnap.events({
  'click .remove': function() {
    var removeId = this._id
    Waka.db.Articles.remove(removeId, function(r) {
      Videos.remove({_id: removeId}, function(r) {
        Videos.refreshWaka()
      })
    })
    event.preventDefault()
  }
})
