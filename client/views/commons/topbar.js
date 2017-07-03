Template.topbar.helpers({
  isLoggedOn: function() {
    return Session.get('activeUsername')
  }
});

Template.topbar.events({
  'click .launch'(event, instance) {
    console.log('click')
    $('.ui.sidebar').sidebar('toggle');
  }
});
