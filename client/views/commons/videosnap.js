Template.videosnap.events({
  'click .remove': function() {
    Waka.db.Articles.remove(this._id, function(r) {
      Videos.remove({}, function(r) {
        Videos.refreshWaka()
      })
    })
    event.preventDefault()
  }
})
