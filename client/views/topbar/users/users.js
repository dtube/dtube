Template.users.rendered = function() {
  $('.dropdownusers').dropdown({
    action: function(text, value, e) {
      var e = $(e)
      if (e.hasClass('logIn')) {
        Session.set('activeUsername', e.data('username'))
        Videos.loadFeed(e.data('username'))
      } else if (e.hasClass('logOut')) {
        Waka.db.Users.findOne({username: e.data('username')}, function(user) {
          if (user) {
            Waka.db.Users.remove(user._id, function(result) {
              Users.remove({})
              Users.refreshLocalUsers()
              Waka.db.Users.findOne({}, function(user) {
                if (user) {
                  Session.set('activeUsername', user.username)
                  Videos.loadFeed(user.username)
                }
                else Session.set('activeUsername', null)
              })
            })
          } else {
            Users.remove({username: e.data('username')})
            var newUser = Users.findOne()
            if (newUser) Session.set('activeUsername', newUser.username)
            else Session.set('activeUsername', null)
          }
        })
      } else if (e.hasClass('claimRewards')) {
        var user = Users.findOne({username: e.data('username')})
        broadcast.claimRewardBalance(user.username, user.reward_steem_balance, user.reward_sbd_balance, user.reward_vesting_balance, function(err, result) {
          Users.refreshUsers([user.username])
          toastr.success(translate('USERS_YOU_HAVE_CLAIMED') + ' ' + Template.users.formatRewards(user), translate('USERS_SUCCESS'))
        })
      }
    }
  })
}

Template.users.helpers({
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

Template.users.formatRewards = function(user) {
  var rewards = []
  if (user.reward_sbd_balance.split(' ')[0] > 0)
    rewards.push(user.reward_sbd_balance)
  if (user.reward_steem_balance.split(' ')[0] > 0)
    rewards.push(user.reward_steem_balance)
  if (user.reward_vesting_balance.split(' ')[0] > 0)
    rewards.push(user.reward_vesting_steem.split(' ')[0]+' SP')
  return rewards.join(', ')
}
