var moment = require('moment')

Template.home.helpers({
  watchAgain: function () {
    return Videos.find({ source: 'wakaArticles' }, { limit: Session.get('remoteSettings').loadLimit }).fetch()
  },
  neighborhood: function () {
    return Videos.find({ source: 'wakaPeers' }).fetch()
  },
  newVideos: function () {
    return Videos.find({ source: 'chainByCreated' }).fetch().sort(function (a, b) {
      return moment(b.created) - moment(a.created)
    })
  },
  hotVideos: function () {
    return Videos.find({ source: 'chainByHot' }).fetch()
  },
  trendingVideos: function () {
    return Videos.find({ source: 'chainByTrending' }, {limit: 50}).fetch()
  },
  feedVideos: function () {
    return Videos.find({ source: 'chainByFeed-' + Session.get('activeUsername') }).fetch()
  },
  isOnMobile: function () {
    if (/Mobi/.test(navigator.userAgent)) {
      return true;
    }
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
  'click #remove': function () {
    var removeId = this._id
    Waka.db.Articles.remove(removeId.substring(0, removeId.length - 1), function (r) {
      Videos.remove({ _id: removeId }, function (r) {
        Videos.refreshWaka()
        Template.videoslider.refreshSlider()
      })
    })
    event.preventDefault()

  }
})

Template.home.rendered = function () {
  Template.sidebar.activeSidebarHome();
  Template.settingsdropdown.nightMode();
}