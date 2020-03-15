var moment = require('moment')

Template.home.helpers({
  watchAgain: function () {
    if (!Session.get('watchAgainLoaded')) return []
    return WatchAgain.find({}, {limit: 25}).fetch()
  },
  newVideos: function () {
    return Videos.find({ source: 'chainByCreated', "json.hide": {$ne: 1} }, {limit: 25}).fetch()
  },
  hotVideos: function () {
    return Videos.find({ source: 'chainByHot', "json.hide": {$ne: 1} }, {limit: 25}).fetch()
  },
  trendingVideos: function () {
    return Videos.find({ source: 'chainByTrending', "json.hide": {$ne: 1} }, {limit: 25}).fetch()
  },
  feedVideos: function () {
    return Videos.find({ source: 'chainByFeed-' + Session.get('activeUsername'), "json.hide": {$ne: 1} }).fetch()
  }
})

Template.home.events({
  'click .addwatchlater': function () {
    WatchLater.upsert({_id: this._id},this)
    event.preventDefault()
  },
  'click .watchlater': function () {
    WatchLater.remove(this._id)
    event.preventDefault()
  },
  'click #remove': function (event) {
    var removeId = this._id
    WatchAgain.remove({_id: removeId.substring(0, removeId.length - 1)})
    event.preventDefault()

  }
})

Template.home.rendered = function () {
  Videos.refreshBlockchain(function() {})
  Template.settingsdropdown.nightMode();
  if (/Mobi/.test(navigator.userAgent)) {
    Template.sidebar.empty()
  }
  else {
    Template.sidebar.half()
  }
}
