Template.notificationdropdown.rendered = function() {
    $('.dropdownnotification').dropdown({
      action: function(text, value, e) {
          $('#notification').removeClass('disabled');
          $('#notificationcount').addclass('notificationdtubeactive').removeClass('notificationdtube');
          var user = Users.findOne({username: e.data('username')})
          steem.broadcast.claimRewardBalance(user.privatekey, user.username, user.reward_steem_balance, user.reward_sbd_balance, user.reward_vesting_balance, function(err, result) {
            Users.refreshUsers([user.username])
            toastr.success(translate('USERS_YOU_HAVE_CLAIMED') + ' ' + Template.users.formatRewards(user), translate('USERS_SUCCESS'))
          })
        }
    });
}

Template.notificationdropdown.helpers({
    userlist: function() {
      return Users.find()
    },
    mainUser: function() {
      return Users.findOne({username: Session.get('activeUsername')})
    },
    activeUser: function() {
      return Session.get('activeUsername')
    },
    hasRewards: function(user) {
      if (!user || !user.reward_sbd_balance || !user.reward_steem_balance || !user.reward_vesting_balance) return false
      if (user.reward_sbd_balance.split(' ')[0] > 0
        || user.reward_steem_balance.split(' ')[0] > 0
        || user.reward_vesting_balance.split(' ')[0] > 0)
        return true
    },
    displayRewards: function(user) {
      return Template.users.formatRewards(user)
    }
  });
  
  Template.notificationdropdown.formatRewards = function(user) {
    var rewards = []
    if (user.reward_sbd_balance.split(' ')[0] > 0)
      rewards.push(user.reward_sbd_balance)
    if (user.reward_steem_balance.split(' ')[0] > 0)
      rewards.push(user.reward_steem_balance)
    if (user.reward_vesting_balance.split(' ')[0] > 0)
      rewards.push(user.reward_vesting_steem.split(' ')[0]+' SP')
    return rewards.join(', ')
  }
  