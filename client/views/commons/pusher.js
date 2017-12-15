Template.pusher.helpers({
  isOnMobile: function () {
    if (/Mobi/.test(navigator.userAgent)) {
      return true;
    }
  }
});

Template.pusher.rendered = function () {
  if (Session.get('isSidebarOpen')) {
    $(".ui.desktop.sidebar").sidebar('setting', 'dimPage', false).sidebar('setting', 'closable', false)
      .sidebar('setting', 'transition', 'overlay').sidebar('toggle')
    console.log("isopen")
  }
  else {
    Session.set('isSidebarOpen', false)
  }
  // Notifications.startListening();
}

