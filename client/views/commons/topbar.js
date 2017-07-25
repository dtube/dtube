Template.topbar.helpers({
  searchSuggestions: function() {
    return Session.get('searchSuggestions')
  },
  isLoggedOn: function() {
    return Session.get('activeUsername')
  }
});

Template.topbar.events({
  'click .launch': function(event, instance) {
    console.log('click')
    $('.ui.sidebar').sidebar('toggle');
  },
  'keyup #dsearch': function(event) {
    var query = event.target.value
    if (query.length < 3) {
      $('.results').hide()
      return
    }
    $.get("https://api.asksteem.com/suggestions?term=tags:dtube &amp;&amp; "+query, function(rawSuggestions) {
      var suggestions = []
      for (var i = 0; i < rawSuggestions.length; i++) {
        if (rawSuggestions[i].startsWith("tags:dtube &amp;&amp; ")) {
          suggestions.push(rawSuggestions[i].substr(15))
        }
      }
      if (suggestions.length > 0) $('.results').show()
      else $('.results').hide()
      Session.set('searchSuggestions', suggestions)
    });
  },
  'submit .searchForm': function(event) {
    event.preventDefault()
    var query = event.target.search.value;
    Session.set('search', {query: query})
    $.get("https://api.asksteem.com/search?q=tags:dtube &amp;&amp; "+query, function(response) {
      Session.set('search', {query: query, response: response})
    });
    FlowRouter.go('/s/'+query)
    $('.results').hide()
  }
});
