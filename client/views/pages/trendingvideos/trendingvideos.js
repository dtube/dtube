Template.trendingvideos.helpers({
  isOnMobile: function () {
    if (/Mobi/.test(navigator.userAgent)) { 
        return true;
    }
  },
  trendingVideos: function () {
    return Videos.find({ source: 'chainByTrending' }, { limit: 25 }).fetch()
  }
})

Template.trendingvideos.rendered = function () {
  $("#sidebar").sidebar('show')
  Videos.getVideosBy("trending", 26)
}