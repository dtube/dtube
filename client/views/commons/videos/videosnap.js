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
    WatchAgain.remove(this._id)
    event.preventDefault()
  }
})

Template.videosnap.helpers({
  isInWatchLater: function () {
    return WatchLater.find({ _id: this._id }).fetch()
  },
  votesLength: function() {
    if (!this || !this.votes)
      return 0
    return this.votes.length
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
}

Template.videosnap.fallback = (elem) => {
  let newsrc = UI._globalHelpers.fallbackThumbnailUrl(elem.src)
  if (newsrc)
    elem.src = newsrc
  else
    elem.onerror = null
}