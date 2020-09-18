Template.topbar.rendered = function(){
  
}

Template.topbar.helpers({
  searchSuggestions: function () {
    return Session.get('searchSuggestions')
  },
  isLoggedOn: function () {
    if (Session.get('activeUsername') || Session.get('activeUsernameSteem') || Session.get('activeUsernameHive'))
      return true
    return false
  },
  isSearchingMobile: function() {
    return Session.get('isSearchingMobile')
  }, mainUser: function() {
    return Users.findOne({username: Session.get('activeUsername'), network: 'avalon'})
  }
});

Template.topbar.events({
  'click .sidebartoggleicon': function (event, instance) {
    //Session.set('isSidebarOpen', !$('#sidebar').sidebar('is visible'))
    if ($('#sidebar').sidebar('is visible')) {
      Template.sidebar.empty()
    } else {
      if (FlowRouter.current().route.name == 'video') {
        Template.sidebar.full()
      } else {
        Template.sidebar.half()
      }
        
    }
  },
  'touchend .sidebartoggleicon': function (event, instance) {
    //Session.set('isSidebarOpen', !$('#sidebar').sidebar('is visible'))
    if ($('#sidebar').sidebar('is visible')) {
      Template.sidebar.empty()
    } else {
      if (FlowRouter.current().route.name == 'video') {
        Template.sidebar.full()
      } else {
        Template.sidebar.half()
      }
        
    }
  },
  'keyup #dsearch': function (evt) {
    var query = evt.target.value
    if (query.length < 1) {
      $('.results').hide()
      return
    }
    // AskSteem.suggestions({term: query}, function (err, suggestions) {
    //   if (suggestions.length > 0) $('.results').show()
    //   else $('.results').hide()
    //   Session.set('searchSuggestions', suggestions)
    // })
  },
  'submit .searchForm': function (event) {
    event.preventDefault()
    var query = event.target.search.value
    Session.set('search', {query: query})
    // AskSteem.search({q: 'meta.video.info.title:* AND '+query, include: 'meta,payout'}, function(err, response){
    //   Session.set('search', {query: query, response: response})
    // })
    Search.text(query, null,null, function(err, response){
      console.log(response)
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
    FlowRouter.go('/')
  },
  'touchend #textlogo': function (event, instance) {
    FlowRouter.go('/')
  },
  'click #mobilesearch': function() {
    Session.set('isSearchingMobile', true)
  },
});

