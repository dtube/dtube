Template.pusher.helpers({
    isOnMobile: function () {
        if (/Mobi/.test(navigator.userAgent)) {
            return true;
        }
    }
});

Template.pusher.rendered = function () {
  if (Session.get('isSidebarOpen'))
  {
    $(".ui.desktop.sidebar").sidebar('setting', 'dimPage', false).sidebar('setting', 'closable', false)
    .sidebar('setting', 'transition', 'overlay').sidebar('toggle')
  console.log("isopen")
}
    else
    {
      Session.set('isSidebarOpen', false)
    }
    Template.pusher.setScreenMode();
    $(window).on('resize', Template.pusher.setScreenMode)
    Notifications.startListening();
}

Template.pusher.setScreenMode = function () {
   if ($(window).width() < 992) {
       $('.ui.maingrid').removeClass('computergrid').addClass('tabletgrid').removeClass('grid').removeClass('container');
   }
   else {
       $('.ui.maingrid').addClass('computergrid').addClass('container');
   }
}
