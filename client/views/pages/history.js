Template.history.helpers({
  watchAgain: function() {
    return Videos.find({source: 'wakaArticles'}, {limit: 100}).fetch()
  }
})
