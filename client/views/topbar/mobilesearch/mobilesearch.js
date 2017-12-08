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
      AskSteem.suggestions({term: query}, function (err, suggestions) {
        if (suggestions.length > 0) $('.results').show()
        else $('.results').hide()
        Session.set('searchSuggestions', suggestions)
      })
    },
    'submit .searchForm': function(event) {
      event.preventDefault()
      $("#sidebar").sidebar('hide')
      $("#mobilesearchsidebar").sidebar('toggle')
      var query = event.target.search.value
      Session.set('search', {query: query})
      AskSteem.search({q: 'meta.video.info.title:* AND '+query, include: 'meta'}, function(err, response){
        Session.set('search', {query: query, response: response})
      })
      FlowRouter.go('/s/'+query)
    },
    'click .result': function(event) {
      $('#dsearchmobile').val(this)
      $('.searchForm').submit()
    },
  });