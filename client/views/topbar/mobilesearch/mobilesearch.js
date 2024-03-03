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
    if (event.key == 'Enter') return
    var query = event.target.value
    if (query.length < 1) {
      $('.results').hide()
      return
    }
    if (query != Template.mobilesearch.query) {
      Search.users(query, function (err, response) {
        var users = response.results
        if (users.length > 0) $('.results').show()
        else $('.results').hide()
        var suggestions = []
        for (let i = 0; i < users.length; i++) {
          suggestions.push(users[i].name)
        }
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
    Search.text(query, null,null, function(err, response){
      Session.set('search', {query: query, response: response})
    })
    Session.set('searchSuggestions', null)
    FlowRouter.go('/s/'+query)
  },
  'click #searchIconMobile': function(event) {
    var query = $('#dsearchmobile').val()
    Session.set('search', {query: query})
    Search.text(query, null,null, function(err, response){
      Session.set('search', {query: query, response: response})
    })
    Session.set('searchSuggestions', null)
    FlowRouter.go('/s/'+query)
  },
  'click .result': function(event) {
    FlowRouter.go('/c/'+this)
  },
  'click .angle.left.icon': function() {
    Session.set('isSearchingMobile', false)
  }
});