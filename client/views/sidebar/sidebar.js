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
  }
});

Template.sidebar.helpers({
  subscribe: function () {
    return Subs.find({ follower: Session.get('activeUsername') }).fetch()
  }
});

Template.sidebar.helpers({
  watchAgain: function () {
    return Videos.find({ source: 'wakaArticles' }, { limit: Session.get('remoteSettings').loadLimit }).fetch()
  }
});

Template.sidebar.OnSidebarToogled = function () {
  $(".ui.sidebar").sidebar('setting', 'onShow', function () {
    if ($(window).innerWidth() > 1280) {
      $('main').addClass('mainsided').removeClass('main');
    }
    else {
      $('main').removeClass('mainsided').addClass('main');
    }
  })
  $(".ui.sidebar").sidebar('setting', 'onHide', function () {
    if ($(window).innerWidth() > 1280) {
      $('main').removeClass('mainsided').addClass('main');
    }
    else {
      $('main').removeClass('mainsided').addClass('main');
    }
  })
}

Template.sidebar.events({
  'click #help': function (event, instance) {
    $('.ui.modal').modal('show')
  },
  'click #homesidebarmenu': function () {
    Template.sidebar.resetActiveMenu()
    $('#homesidebarmenu').addClass('activemenu');
    FlowRouter.go('/')
  },
  'click #channelsidebarmenu': function () {
    Template.sidebar.resetActiveMenu()
    $('#channelsidebarmenu').addClass('activemenu');
    FlowRouter.go("/c/" + Session.get('activeUsername'))
  },
  'click #trendingsidebarmenu': function () {
    Template.sidebar.resetActiveMenu()
    $('#trendingsidebarmenu').addClass('activemenu');
    FlowRouter.go('/trendingvideos')
  },
  'click #watchagainsidebarmenu': function () {
    Template.sidebar.resetActiveMenu()
    FlowRouter.go('/history')
    $('#watchagainsidebarmenu').addClass('activemenu');
  }
});

Template.sidebar.resetActiveMenu = function () {
  $('#homesidebarmenu').removeClass('activemenu');
  $('#channelsidebarmenu').removeClass('activemenu');
  $('#trendingsidebarmenu').removeClass('activemenu');
  $('#watchagainsidebarmenu').removeClass('activemenu');
}

