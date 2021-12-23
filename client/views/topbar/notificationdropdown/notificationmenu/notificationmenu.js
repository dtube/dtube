Template.notificationmenu.helpers({
  notifications: function() {
    return Notifications.find(
      {u: Session.get('activeUsername')},
      {sort: { ts: -1 }, limit: 200})
      .fetch()
  },
  mainUser: function() {
    return Users.findOne({username: Session.get('activeUsername')})
  },
  shouldParticipateInGovernance: function() {
    // if user balance is >= 100 DTC and user is not voting for leaders
    // then show notification about it
    var user = Users.findOne({username: Session.get('activeUsername')})
    if (user && user.balance >= 10000 && (!user.approves || user.approves.length == 0))
      return true
    return false
  }
})

Template.notificationmenu.events({
  'click #notificationclear': () => {
    Notifications.remove({})
  }
})