Template.topbar.helpers({
  searchSuggestions: function () {
    return Session.get('searchSuggestions')
  },
  isLoggedOn: function () {
    return Session.get('activeUsername')
  }
});

Template.topbar.events({
  'click .sidebartoggleicon': function (event, instance) {
    if (!Session.get('isSidebarOpen'))
    {
      Session.set('isSidebarOpen', true)
      if ($('.article').innerWidth() > 943) {
      $("#sidebar").sidebar('setting', 'dimPage', false).sidebar('setting', 'closable', false).sidebar('toggle')
      $('.article').addClass('mainsided');
      }
      else{
        $("#sidebar").sidebar('setting', 'dimPage', false).sidebar('setting', 'closable', false).sidebar('toggle')
      }
    }
    else
    {
      $('.article').removeClass('mainsided');
      Session.set('isSidebarOpen', false)
      $("#sidebar").sidebar('setting', 'dimPage', false).sidebar('setting', 'closable', false).sidebar('toggle')
    }
  },
  'click #mobilesearch': function (event, instance) {
    $("#mobilesearchsidebar").sidebar('toggle')
  },
  'keyup #dsearch': function (evt) {
    var query = evt.target.value
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
  'submit .searchForm': function (event) {
    event.preventDefault()
    var query = event.target.search.value
    Session.set('search', {query: query})
    AskSteem.search({q: 'meta.video.info.title:* AND '+query, include: 'meta,payout'}, function(err, response){
      Session.set('search', {query: query, response: response})
    })
    FlowRouter.go('/s/'+query)
  },
  'click .result': function (event) {
    $('#dsearch').val(this)
    $('.searchForm').submit()
  },
  'click .dtube': function () {
    // $('.dtube').addClass('loading')
    Videos.refreshBlockchain(function () {
      // $('.dtube').removeClass('loading')
    })
  },
  'click #textlogo': function () {
    window.history.pushState('', '', '/#!/');
    FlowRouter.go('/')
  }
});

