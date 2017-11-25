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
  
  