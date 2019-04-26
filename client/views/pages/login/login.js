Template.login.rendered = function() {
  $('.menu .item')
  .tab();
}

Template.login.success = function(activeUsername, noreroute) {
  Session.set('activeUsername', activeUsername)
  Users.refreshUsers([user.username])
  if (!UserSettings.get('voteWeight')) {
    UserSettings.set('voteWeight', 5)
  }
  Videos.loadFeed(activeUsername)
  if (!noreroute)
    FlowRouter.go('#!/')
  // DTalk.login(function() {
  //   Session.set('gunUser', gun.user().is)
  //   DTalk.checkInbox()
  // })
}