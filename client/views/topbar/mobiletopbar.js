Template.mobiletopbar.helpers({
  isLoggedOn: function() {
    return Session.get('activeUsername')
  },
  isSearchingMobile: function() {
    return Session.get('isSearchingMobile')
  },
  isLargeEnoughForLogo: function() {
    if ($(window).width() > 346)
      return true
    return false
  },
  isLargeEnoughForMiniLogo: function() {
    if ($(window).width() > 280)
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
  
  