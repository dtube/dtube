Template.topbar.helpers({
  searchSuggestions: function () {
    return Session.get('searchSuggestions')
  },
  isLoggedOn: function () {
    return Session.get('activeUsername')
  },
  isSearchingMobile: function() {
    return Session.get('isSearchingMobile')
  }
});

Template.topbar.events({
  'click .sidebartoggleicon': function (event, instance) {
    //Session.set('isSidebarOpen', !$('#sidebar').sidebar('is visible'))
    if ($('#sidebar').sidebar('is visible')) {
      $('.pusher').attr('style', '')
      $("#sidebar").sidebar('hide')
    } else {
      if (FlowRouter.current().route.name == 'video') {
        $("#sidebar")
        .sidebar('setting', 'dimPage', false)
        .sidebar('setting', 'closable', true)
        .sidebar('show')
        $('.pusher').attr('style', 'transform: translate3d(210px, 0, 0) !important')
      } else {
        $("#sidebar")
          .sidebar('setting', 'dimPage', false)
          .sidebar('setting', 'closable', true)
          .sidebar('show')
        $('.pusher').attr('style', 'transform: translate3d(105px, 0, 0) !important')
      }
        
    }
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
  },
  'click #mobilesearch': function() {
    Session.set('isSearchingMobile', true)
  },
});

