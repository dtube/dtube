Template.trendingvideos.helpers({
    trendingVideos: function() {
      return Videos.find({source: 'chainByTrendingPage'}).fetch()
    }
  })