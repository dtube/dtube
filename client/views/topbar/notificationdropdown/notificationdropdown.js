Template.notificationdropdown.rendered = function() {
  $('.dropdownnotification').dropdown()
}

Template.notificationdropdown.helpers({
    notificationsUnseen: function() {
      return Notifications.find({u: Session.get('activeUsername'), seen: {$exists: false}}).count()
    },
    getTitle: function(author,permlink) {
      var video = Videos.findOne({ 'info.author': author, 'info.permlink': permlink })
      if (video)
      return video.info.title;
    },
    getOwnTitle: function(permlink) {
      var video = Videos.findOne({ 'info.author': Session.get('activeUser'), 'info.permlink': permlink })
      if (video)
      return video.info.title;
    },
    getSnap: function(author,permlink) {
      var video = Videos.findOne({ 'info.author': author, 'info.permlink': permlink })
      if (video)
      return video.info.snaphash;
    }
  })

  Template.notificationdropdown.events({
    'click .remove.icon': function () {
      var notif = Notifications.findOne({_id: this._id})
      Notifications.remove(this._id)
      // if (notif.block > UserSettings.get('notifications_highblock'))
      //   UserSettings.set('notifications_highblock', notif.block)
    },
    'click .dropdownnotification, touchstart .dropdownnotification': function(e) {
      if (/Mobi/.test(navigator.userAgent)) {
        Session.set('selectortype', 'notifications')
        Template.mobileselector.revealMenu('bottom')
      }
      Notifications.update({}, {$set: {seen: true}}, {multi: true})
    }
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
