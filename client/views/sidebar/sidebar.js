Template.sidebar.rendered = function () {
  Template.sidebar.OnSidebarToogled();
  var query = {
    tag: FlowRouter.getParam("author"),
    limit: 100
  };
  Videos.refreshWaka();
}

Template.sidebar.helpers({
  activeUser: function () {
    return Session.get('activeUsername')
  },
  isOnMobile: function () {
    if (/Mobi/.test(navigator.userAgent)) {
      return true;
    }
  },
  subscribe: function () {
    return Subs.find({ follower: Session.get('activeUsername') }).fetch()
  }, watchAgain: function () {
    return Videos.find({ source: 'wakaArticles' }, { limit: Session.get('remoteSettings').loadLimit }).fetch()
  }
});

// Template.sidebar.OnSidebarToogled = function () {
//   $("#sidebar").sidebar('setting', 'onShow', function () {
//     //  if ($(window).innerWidth() > 1367) {
//     //    $('.article').addClass('mainsided');
//     //  }
//     //  else {
//     //    $('.article').addClass('mainsided');
//     //  }
//   })
//   $("#sidebar").sidebar('setting', 'onHide', function () {
//     //  if ($(window).innerWidth() > 1367) {
//     //    $('.article').removeClass('mainsided');
//     //  }
//     //  else {
//     //    $('.article').removeClass('mainsided');
//     //  }
//   })
// }

Template.sidebar.events({
  'click #help': function (event, instance) {
    //$('.ui.modal').modal('show')
  }
});

Template.sidebar.resetActiveMenu = function () {
  $('#homesidebarmenu').removeClass('activemenu')
  $('#channelsidebarmenu').removeClass('activemenu')
  $('#trendingsidebarmenu').removeClass('activemenu')
  $('#watchagainsidebarmenu').removeClass('activemenu')
  $('#uploadsidebarmenu').removeClass('activemenu')
}

Template.sidebar.activeSidebarHome = function () {
  Template.sidebar.resetActiveMenu()
  $('#homesidebarmenu').addClass('activemenu')
}

Template.sidebar.activeSidebarChannel = function () {
  Template.sidebar.resetActiveMenu()
  $('#channelsidebarmenu').addClass('activemenu')
}

Template.sidebar.activeSidebarTrending = function () {
  Template.sidebar.resetActiveMenu()
  $('#trendingsidebarmenu').addClass('activemenu')
}

Template.sidebar.activeSidebarWatchAgain = function () {
  Template.sidebar.resetActiveMenu()
  $('#watchagainsidebarmenu').addClass('activemenu')
}

Template.sidebar.activeSidebarUpload = function () {
  Template.sidebar.resetActiveMenu()
  $('#uploadsidebarmenu').addClass('activemenu')
}