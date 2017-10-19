Template.trendingvideos.helpers({
  trendingVideos: function () {
    return Videos.find({ source: 'chainByTrending' }, { limit: 25 }).fetch()
  }
})

Template.trendingvideos.rendered = function () {
  $(".ui.sidebar").sidebar('show')
  Videos.getVideosBy("trending", 26)
}