Notifications = new Mongo.Collection(null)
notificationsObserver = new PersistentMinimongo2(Notifications, 'notifications');

// Notifications.ws = new WebSocket('wss://api.todo.org/')

// Notifications.ws.onmessage = function (event) {
//   var data = JSON.parse(event.data)
//   if (data && data.result && data.result.length > 0) {
//     for (let i = 0; i < data.result.length; i++)
//       if (data.result[i].block > UserSettings.get('notifications_highblock'))
//         if (!Notifications.findOne(data.result[i])) {
//           var notif = data.result[i]
//           notif.user = Session.get('activeUsername')
//           Notifications.insert(data.result[i])
//         }

//     UserSettings.set('notifications_highblock', data.result[0].block)
//   }
//   if (data && data.notification) {
//     notif = data.notification
//     notif.user = Session.get('activeUsername')
//     Notifications.insert(notif)
//     message = ''
//     switch (notif.type) {
//       case 'follow':
//         message += notif.follower+' subscribed to your channel'
//         break;

//       case 'reply':
//         message += notif.author+' commented on your content'
//         break;

//       case 'transfer':
//         message += notif.from+' sent you '+notif.amount
//         break;

//       case 'mention':
//         message += notif.author+' mentioned you'
//         break;

//       case 'reblog':
//         message += notif.author+' resteemed your content'
//         break;
  
//       default:
//         break;
//     }
//     //toastr.info(message)
//   }
// }

Notifications.getDecentralized = function () {
  if (!Session.get('activeUsername')) return
  avalon.getNotifications(Session.get('activeUsername'), function(err, notifications) {
    if (!notifications || notifications.length === 0)
      return
    for (let i = 0; i < notifications.length; i++) {
      var notif = notifications[i]
      if (notif.ts <= UserSettings.get('notifications_highblock'))
        break
      var message = ''
      switch (notif.tx.type) {
        case 7:
          message += notif.tx.sender+' subscribed to your channel'
          break;
  
        case 4:
          if (notif.tx.data.pa == Session.get('activeUsername'))
            message += notif.tx.sender+' commented on your content'
          else
            message += notif.tx.sender+' mentioned you'

          break;
  
        case 3:
          // var user = Users.findOne({username: Session.get('activeUsername')})
          // user.vt.v = avalon.votingPower(user)
          // user.bw.v = avalon.bandwidth(user)
          // user.vt.t = new Date().getTime()
          // user.bw.t = new Date().getTime()
          // user.balance += notif.tx.data.amount
          // Users.update({username: user.username}, user)
          message += notif.tx.sender+' sent you '+Blaze._globalHelpers['displayMoney'](notif.tx.data.amount, 0, 'DTC')
          break;

        case 5:
          message += notif.tx.sender+' voted on your content'
          break;
    
        default:
          break;
      }
      notif.message = message
      if (!Notifications.findOne({_id: notif._id}))
        Notifications.insert(notif)
    }
    if (notifications[0])
      UserSettings.set('notifications_highblock', notifications[0].ts)
  })
}

// Notifications.purge = function(nMax) {
//   var notifs = Notifications.find({}, {limit:nMax, sort: {block: -1}}).fetch()
//   if (notifs[nMax-1]) {
//     Notifications.remove({block: {$lt: notifs[nMax-1].block}})
//   }
// }
// setInterval(function() {
//   Notifications.purge(200)
// }, 60000)

setInterval(function() {
  Notifications.getDecentralized()
}, 10000)