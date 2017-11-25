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
  'keyup #dsearch': function(evt) {
    console.log(evt)
    var query = evt.target.value
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
    AskSteem.search(event.target.search.value)
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
    window.history.pushState('', '', '/#!/');
    FlowRouter.go('/')
  },
  'click #clickupload': function() {
    window.history.pushState('', '', '/#!/');
    var random = Math.floor((Math.random() * 100) + 1);
    console.log(random);
    if (random > 80)
    {
      FlowRouter.go('/newupload')
    }
    else
    {
      FlowRouter.go('/upload')
    }
  }
});

