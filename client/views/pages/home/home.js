var moment = require('moment')
var sliderMaxSize = 12

CarouselVideoSliderType = ""
var LayoutID = null 

Template.home.helpers({
  watchAgain: function () {
    CarouselVideoSliderType = "watchAgain_4"
    if (!Session.get('watchAgainLoaded')) return []
    return WatchAgain.find({}, {limit: sliderMaxSize}).fetch()
  },
  genres: function () {
    CarouselVideoSliderType = "genres"
    return Videos.getGenres()
  },
  newVideos: function () {
    CarouselVideoSliderType = "newVideos_3"
    return Videos.find({ source: 'chainByCreated', "json.hide": {$ne: 1} }, {limit: sliderMaxSize}).fetch()
  },
  hotVideos: function () {
    CarouselVideoSliderType = "hotVideos_1"
    return Videos.find({ source: 'chainByHot', "json.hide": {$ne: 1} }, {limit: sliderMaxSize}).fetch()
  },
  trendingVideos: function () {
    CarouselVideoSliderType = "trendingVideos_2"
    return Videos.find({ source: 'chainByTrending', "json.hide": {$ne: 1} }, {limit: sliderMaxSize}).fetch()
  },
  feedVideos: function () {
    CarouselVideoSliderType = "feedVideos_0"
    return Videos.find({ source: 'chainByFeed-' + Session.get('activeUsername'), "json.hide": {$ne: 1} }, {limit: sliderMaxSize}).fetch()
  },
  getLayoutID: function() {
    return LayoutID;
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

  },
  'click .grid.layout': function(event) {
    if (LayoutID == null)
      LayoutID = true
    else 
      LayoutID = null
  },
  'click .list.ol': function(event) {
    if (LayoutID == null)
      LayoutID = true
    else 
      LayoutID = null
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
