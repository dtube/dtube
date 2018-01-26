Template.videosnapslider.events({
  'click .addwatchlater': function () {
    WatchLater.upsert({_id: this._id},this)
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

Template.videosnapslider.helpers({
  isInWatchLater: function() {
    return  WatchLater.find({_id: this._id}).fetch()
  },
  isOnWatchAgain: function() {
    return Session.get('isOnWatchAgain')
  }
})

Template.videosnapslider.rendered = function () {
  Template.settingsdropdown.nightMode();
  $(this.firstNode.nextSibling).find('#snapload').addClass('loaded');
  $('.retweet.icon.reblogged')
  .popup({
    inline     : true,
    hoverable  : true,
  })
;
}


