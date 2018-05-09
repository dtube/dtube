Template.video.rendered = function() {
  Session.set('isSearchingMobile', false)
}

Template.mobiletopbar.helpers({
  isLoggedOn: function() {
    return Session.get('activeUsername')
  },
  isSearchingMobile: function() {
    return Session.get('isSearchingMobile')
  }
});
  
Template.mobiletopbar.events({
  'click .sidebartoggleicon': function(event, instance) {
    $("#sidebar")
    .sidebar('setting', 'dimPage', true)
    .sidebar('setting', 'closable', true)
    .sidebar('toggle')
    $('.pusher').attr('style', 'transform: translate3d(0px, 0, 0) !important')
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
  
  