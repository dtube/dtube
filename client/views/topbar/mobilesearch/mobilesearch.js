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
      AskSteem.getSearchSuggestions(query, function(err, suggestions) {
        if (suggestions.length > 0) $('.results').show()
        else $('.results').hide()
        Session.set('searchSuggestions', suggestions)
      })
    },
    'submit .searchForm': function(event) {
      event.preventDefault()
      $("#sidebar").sidebar('hide')
      $("#mobilesearchsidebar").sidebar('toggle')
      AskSteem.search(event.target.search.value)
    },
    'click .result': function(event) {
      $('#dsearchmobile').val(this)
      $('.searchForm').submit()
    },
  });