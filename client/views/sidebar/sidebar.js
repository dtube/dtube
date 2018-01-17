Template.sidebar.rendered = function () {
  TrendingTags.loadTopTags(50);
  var query = {
    tag: FlowRouter.getParam("author"),
    limit: 100
  };
  Videos.refreshWaka();
  Template.settingsdropdown.nightMode();
  $('.subscribers.accordion').accordion({
    selector: {
      trigger: '.title'
    }
  });
  Session.set('isSubscribesOpen', false)
  Template.sidebar.selectMenu();
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
  subscribelength: function () {
    return Subs.find({ follower: Session.get('activeUsername') }).fetch()
  },
  subscribe: function () {
    if (Session.get('isSubscribesOpen'))
      return Subs.find({ follower: Session.get('activeUsername') }).fetch()
  },
  watchAgain: function () {
    return Videos.find({ source: 'wakaArticles' }, { limit: Session.get('remoteSettings').loadLimit }).fetch()
  },
  tags: function () {
    return TrendingTags.find({}, { sort: { count: -1 }, limit: 15 }).fetch()
  },
  subsOpen: function () {
    return Session.get('isSubscribesOpen')
  }
});


Template.sidebar.events({
  'click .loadsubs': function () {
    if (!Session.get('isSubscribesOpen')) {
      Session.set('isSubscribesOpen', true)
      Subs.find({ follower: Session.get('activeUsername') }).fetch()
    }
    else Session.set('isSubscribesOpen', false)
  }
})

Template.sidebar.resetActiveMenu = function () {
  $('#homesidebarmenu').removeClass('activemenu')
  $('#channelsidebarmenu').removeClass('activemenu')
  $('#trendingsidebarmenu').removeClass('activemenu')
  $('#watchagainsidebarmenu').removeClass('activemenu')
  $('#uploadsidebarmenu').removeClass('activemenu')
  $('#hotsidebarmenu').removeClass('activemenu')
  $('#newsidebarmenu').removeClass('activemenu')
  $('#watchlatersidebarmenu').removeClass('activemenu')
  Template.settingsdropdown.nightMode();
}

Template.sidebar.selectMenu = function () {
  Template.sidebar.resetActiveMenu()
  switch (Session.get('currentSidebarMenu')) {
    case 1:
      $('#homesidebarmenu').addClass('activemenu')
      break;
    case 2:
      $('#channelsidebarmenu').addClass('activemenu')
      break;
    case 3:
      $('#uploadsidebarmenu').addClass('activemenu')
      break;
    case 4:
      $('#hotsidebarmenu').addClass('activemenu')
      break;
    case 5:
      $('#trendingsidebarmenu').addClass('activemenu')
      break;
    case 6:
      $('#newsidebarmenu').addClass('activemenu')
      break;
    case 7:
      $('#watchlatersidebarmenu').addClass('activemenu')
      break;
    case 8:
      $('#watchagainsidebarmenu').addClass('activemenu')
      break;
  }
}
