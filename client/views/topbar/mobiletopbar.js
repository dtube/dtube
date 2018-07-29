Template.video.rendered = function() {
  Session.set('isSearchingMobile', false)
}

Template.mobiletopbar.helpers({
  isLoggedOn: function() {
    return Session.get('activeUsername')
  },
  isSearchingMobile: function() {
    return Session.get('isSearchingMobile')
  },
  isLargeEnoughForLogo: function() {
    if (!Session.get('activeUsername') && $(window).width() > 350)
      return true
    if ($(window).width() > 393)
      return true
    return false
  }
});
  
Template.mobiletopbar.events({
  'click .sidebartoggleicon': function(event, instance) {
    Template.sidebar.mobile()
  },
  'click #mobilesearchbis': function() {
    Session.set('isSearchingMobile', true)
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
  
  