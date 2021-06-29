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
  },
  topbarAvatarUrl: () => {
    if (Session.get('activeUsername')) return javalon.config.api + '/image/avatar/' + Session.get('activeUsername')
    else if (Session.get('activeUsernameHive')) return 'https://images.hive.blog/u/' + Session.get('activeUsernameHive') + '/avatar'
    else if (Session.get('activeUsernameSteem')) return 'https://steemitimages.com/u/' + Session.get('activeUsernameSteem') + '/avatar'
    else return javalon.config.api + '/image/avatar/null'
  },
  topbarUsername: () => {
    if (Session.get('activeUsername')) return Session.get('activeUsername')
    else if (Session.get('activeUsernameHive')) return Session.get('activeUsernameHive')
    else if (Session.get('activeUsernameSteem')) return Session.get('activeUsernameSteem')
    else return ''
  },
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
    if (evt.key == 'Enter') return
    var query = evt.target.value
    if (query.length < 1) {
      $('.results').hide()
      return
    }
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
  },
  'submit .searchForm': function (event) {
    event.preventDefault()
    var query = event.target.search.value
    Session.set('search', {query: query})
    Search.text(query, null,null, function(err, response){
      Session.set('search', {query: query, response: response})
    })
    Session.set('searchSuggestions', null)
    FlowRouter.go('/s/'+query)
  },
  'click #searchIcon': function(event) {
    var query = $('#dsearch').val()
    Session.set('search', {query: query})
    Search.text(query, null,null, function(err, response){
      Session.set('search', {query: query, response: response})
    })
    Session.set('searchSuggestions', null)
    FlowRouter.go('/s/'+query)
  },
  'click .result': function (event) {
    FlowRouter.go('/c/'+this)
  },
  'click .dtube': function () {
    // $('.dtube').addClass('loading')
    Videos.refreshBlockchain(function () {
      // $('.dtube').removeClass('loading')
    })
  },
  'click #logintopbarmenu': function() {
      if(Session.get('activeUsername')) {
        $('.menu .item.'+Session.get('currentTab')).removeClass('active');
        $('.ui.bottom.attached.tab.'+Session.get('currentTab')).removeClass('active');
        Session.set('currentTab', 'videos')
        $('.menu .item.videos').addClass('active');
        $('.ui.bottom.attached.tab.videos').addClass('active');
        FlowRouter.go('/c/' + Session.get('activeUsername'))
      } else {
        FlowRouter.go('/login')
      }
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

