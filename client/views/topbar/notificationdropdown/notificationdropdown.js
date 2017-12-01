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
    },


  //   <div class="ui positive message">
  //   <i class="close icon"></i>
  //   <div class="header">
  //    (voter blablabla)
  //   </div>
  //   <p>permalink see now.</p>
  // </div>


//   <div class="card">
//   <div class="content">
//     <img class="right floated mini ui image" src="/images/avatar/large/elliot.jpg">
//     <div class="header">
//       Elliot Fu
//     </div>
//     <div class="meta">
//       Friends of Veronika
//     </div>
//     <div class="description">
//       Elliot requested permission to view your contact details
//     </div>
//   </div>
//   <div class="extra content">
//     <div class="ui two buttons">
//       <div class="ui basic green button">Approve</div>
//       <div class="ui basic red button">Decline</div>
//     </div>
//   </div>
// </div>


//     addNotification: function() {
//       var menu = '\
//       Test \
//       <i class="dropdown icon"></i> \
//       \
//         <a class="item" href="http://google.com">Google</a> \
//         <a class="item" href="http://amazon.com">Amazon</a> \
//        \
// ';
    
//     $("#notificationmenu").append(menu)
//       $('.dropdownnotification').dropdown()
//     }
  })
  
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

  // Template.notificationdropdown.addNotification = function(type,user,permalink){
  //   $('#notificationmenu').append(" <div class="/item/">Button" + '(++count)' + "</div>");
  // }

  
  