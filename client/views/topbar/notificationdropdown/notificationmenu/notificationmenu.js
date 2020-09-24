Template.notificationmenu.helpers({
  hasRewards: function(user) {
    if (!user || !user.reward_sbd_balance || !user.reward_steem_balance || !user.reward_vesting_balance) return false
    if (user.reward_sbd_balance.split(' ')[0] > 0
      || user.reward_steem_balance.split(' ')[0] > 0
      || user.reward_vesting_balance.split(' ')[0] > 0)
      return true
  },
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
    if (user.balance >= 10000 && (!user.approves || user.approves.length == 0))
      return true
    return false
  }
})