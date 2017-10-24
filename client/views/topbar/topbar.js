Template.topbar.helpers({
  searchSuggestions: function() {
    return Session.get('searchSuggestions')
  },
  isLoggedOn: function() {
    return Session.get('activeUsername')
  }
});

Template.topbar.events({
  'click .sidebartoggleicon': function(event, instance) {
    $("#sidebar").sidebar('setting', 'dimPage', false).sidebar('setting', 'closable', false)
    .sidebar('setting', 'transition', 'overlay').sidebar('toggle') 
  },
  'click #mobilesearch': function(event, instance) {
    $("#mobilesearchsidebar").sidebar('toggle')
  },
  'keyup #dsearch': function(event) {
    var query = event.target.value
    if (query.length < 1) {
      $('.results').hide()
      return
    }
    $.get("https://api.asksteem.com/suggestions?term="+query, function(rawSuggestions) {
      var suggestions = []
      for (var i = 0; i < rawSuggestions.length; i++) {
        if (rawSuggestions[i].startsWith("tags:dtube and ")) {
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
    $.get("https://api.asksteem.com/search?include=meta&q=meta.video.info.title:* AND "+query, function(response) {
      Session.set('search', {query: query, response: response})
    });
    FlowRouter.go('/s/'+query)
  },
  'click .result': function(event) {
    $('#dsearch').val(this)
    $('.searchForm').submit()
  },
  'click .dtube': function() {
    $('.dtube').addClass('loading')
    Videos.refreshBlockchain(function() {
      $('.dtube').removeClass('loading')
    })
  },
  'click #textlogo': function() {
    //window.history.pushState('', '', '/#!/');
    FlowRouter.go('/')
  }
});

