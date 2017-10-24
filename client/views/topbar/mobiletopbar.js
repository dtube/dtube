Template.mobiletopbar.helpers({
    isLoggedOn: function() {
      return Session.get('activeUsername')
    }
  });
  
  Template.mobiletopbar.events({
    'click #mobilesearch': function(event, instance) {
      $("#sidebar").sidebar('hide')
      $("#mobilesearchsidebar").sidebar('toggle')
    },
    'click .dtube': function() {
      $('.dtube').addClass('loading')
      Videos.refreshBlockchain(function() {
        $('.dtube').removeClass('loading')
      })
    },
    'click #textlogomobile': function() {
      //window.history.pushState('', '', '/#!/');
      FlowRouter.go('/')
    }
  });
  
  