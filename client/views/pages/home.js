var moment=require('moment')

Template.home.helpers({
  watchAgain: function() {
    return Videos.find({source: 'wakaArticles'}, {limit: Meteor.settings.public.remote.loadLimit}).fetch()
  },
  neighborhood: function() {
    return Videos.find({source: 'wakaPeers'}).fetch()
  },
  newVideos: function() {
    return Videos.find({source: 'chainByCreated'}).fetch().sort(function(a,b) {
      return moment(b.created) - moment(a.created)
    })
  },
  hotVideos: function() {
    return Videos.find({source: 'chainByHot'}).fetch()
  },
  trendingVideos: function() {
    return Videos.find({source: 'chainByTrending'}).fetch()
  },
  feedVideos: function() {
    return Videos.find({source: 'chainByFeed'}).fetch()
  }
})
