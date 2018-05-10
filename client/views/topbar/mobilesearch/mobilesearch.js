Template.mobilesearch.query = ''

Template.mobilesearch.helpers({
    searchSuggestions: function() {
      return Session.get('searchSuggestions')
    },
    isLoggedOn: function() {
      return Session.get('activeUsername')
    }
  });
  
Template.mobilesearch.events({
  'keyup #dsearchmobile': function(event) {
    var query = event.target.value
    if (query.length < 1) {
      $('.results').hide()
      return
    }
    if (query != Template.mobilesearch.query) {
      AskSteem.suggestions({term: query}, function (err, suggestions) {
        if (suggestions.length > 0) $('.results').show()
        else $('.results').hide()
        Session.set('searchSuggestions', suggestions)
      })
      Template.mobilesearch.query = query
    }
  },
  'submit .searchForm': function(event) {
    event.preventDefault()
    Template.sidebar.empty()
    var query = event.target.search.value
    Session.set('search', {query: query})
    AskSteem.search({q: 'meta.video.info.title:* AND '+query, include: 'meta,payout'}, function(err, response){
      Session.set('search', {query: query, response: response})
      $('.results').hide()
    })
    FlowRouter.go('/s/'+query)
  },
  'click .result': function(event) {
    $('#dsearchmobile').val(this)
    $('.searchForm').submit()
  },
  'click .angle.left.icon': function() {
    Session.set('isSearchingMobile', false)
  }
});