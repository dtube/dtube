Template.mobiletopbar.helpers({
    isLoggedOn: function() {
      return Session.get('activeUsername')
    }
  });
  
  Template.mobiletopbar.events({
    'click .sidebartoggleicon': function(event, instance) {
      $("#sidebar").sidebar('setting', 'transition', 'overlay').sidebar('toggle') 
    },
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
    'click #textlogo': function() {
      //window.history.pushState('', '', '/#!/');
      FlowRouter.go('/')
    }
  });
  
  