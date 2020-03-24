Template.sidebar.rendered = function () {
  //TrendingTags.loadTopTags(50);
  var query = {
    tag: FlowRouter.getParam("author"),
    limit: 100
  };
  // Videos.refreshWaka();
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
  subscribelength: function () {
    return Subs.find({ follower: Session.get('activeUsername') }).fetch()
  },
  subscribe: function () {
    if (Session.get('isSubscribesOpen'))
      return Subs.find({ follower: Session.get('activeUsername') }).fetch()
  },
  subsOpen: function () {
    return Session.get('isSubscribesOpen')
  },
  hasRewards: function(user) {
    if (!user || !user.reward_sbd_balance || !user.reward_steem_balance || !user.reward_vesting_balance) return false
    if (user.reward_sbd_balance.split(' ')[0] > 0
      || user.reward_steem_balance.split(' ')[0] > 0
      || user.reward_vesting_balance.split(' ')[0] > 0)
      return true
  },
});


Template.sidebar.events({
  'click .loadsubs': function () {
    if (!Session.get('isSubscribesOpen')) {
      Session.set('isSubscribesOpen', true)
      Subs.find({ follower: Session.get('activeUsername') }).fetch()
    }
    else Session.set('isSubscribesOpen', false)
  },
  'click .dtubesidebarmenu': function () {
    if (/Mobi/.test(navigator.userAgent)) {
      Template.sidebar.empty()
    }
    else {
      Template.sidebar.half()
    }

  },
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
  $('#golivesidebarmenu').removeClass('activemenu')
  $('#livesidebarmenu').removeClass('activemenu')
  $('#dtalksidebarmenu').removeClass('activemenu')
  $('#electionsidebarmenu').removeClass('activemenu')
  Template.settingsdropdown.nightMode();
}

Template.sidebar.selectMenu = function () {
  Template.sidebar.resetActiveMenu()
  switch (Session.get('currentMenu')) {
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
    case 9:
      $('#golivesidebarmenu').addClass('activemenu')
      break;
    case 10:
      $('#livesidebarmenu').addClass('activemenu')
      break;
    case 11:
      $('#dtalksidebarmenu').addClass('activemenu')
      break;
    case 12:
      $('#electionsidebarmenu').addClass('activemenu')
      break;
    default:
      break;
  }
}

Template.sidebar.half = function() {
  $('#sidebar').css("z-index", 10)
  $('.pusher').attr('style', 'transform: translate3d(105px, 0, 0) !important;')
  $("#sidebar")
    .sidebar('setting', 'dimPage', false)
    .sidebar('setting', 'closable', true)
    .sidebar('show')
}

Template.sidebar.full = function() {
  $('.pusher').attr('style', 'transform: translate3d(212px, 0, 0) !important')
  $("#sidebar")
    .sidebar('setting', 'dimPage', false)
    .sidebar('setting', 'closable', true)
    .sidebar('show')
}

Template.sidebar.empty = function() {
  $('.pusher').attr('style', '')
  $("#sidebar").sidebar('hide')
}

Template.sidebar.mobile = function() {
  $('.pusher').attr('style', 'transform: translate3d(0px, 0, 0) !important')
  $("#sidebar")
  .sidebar('setting', 'dimPage', true)
  .sidebar('setting', 'closable', true)
  .sidebar('toggle')
}
