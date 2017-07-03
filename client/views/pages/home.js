Template.home.helpers({
  watchAgain: function() {
    return Videos.find({source: 'wakaArticles'}).fetch()
  },
  neighborhood: function() {
    return Videos.find({source: 'wakaPeers'}).fetch()
  },
  newVideos: function() {
    return Videos.find({source: 'chainByCreated'}).fetch()
  },
  hotVideos: function() {
    return Videos.find({source: 'chainByHot'}).fetch()
  },
  trendingVideos: function() {
    return Videos.find({source: 'chainByTrending'}).fetch()
  }
})
