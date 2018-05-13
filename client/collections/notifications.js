Notifications = new Mongo.Collection(null)
notificationsObserver = new PersistentMinimongo2(Notifications, 'notifications');
var moment = require('moment')

Notifications.ws = new WebSocket('wss://api.busy.org/')

Notifications.ws.onmessage = function (event) {
  var data = JSON.parse(event.data)
  if (data && data.result && data.result.length > 0) {
    for (let i = 0; i < data.result.length; i++)
      if (data.result[i].block > UserSettings.get('notifications_highblock'))
        Notifications.insert(data.result[i])

    UserSettings.set('notifications_highblock', data.result[0].block)
  }
  if (data && data.notification) {
    notif = data.notification
    Notifications.insert(notif)
    message = ''
    switch (notif.type) {
      case 'follow':
        message += notif.follower+' subscribed to your channel'
        break;

      case 'reply':
        message += notif.author+' commented on your content'
        break;

      case 'transfer':
        message += notif.from+' sent you '+notif.amount
        break;

      case 'mention':
        message += notif.author+' mentioned you'
        break;
  
      default:
        break;
    }
    toastr.info(message)
  }
}

Notifications.getCentralized = function () {
  Notifications.ws.onopen = function() {
    Notifications.ws.send(JSON.stringify({method:'get_notifications', params: [Session.get('activeUsername')]}))
    Notifications.ws.send(JSON.stringify({method:'subscribe', params: [Session.get('activeUsername')]}))
  }
}

Notifications.purge = function(nMax) {
  var notifs = Notifications.find({}, {limit:nMax, sort: {block: -1}}).fetch()
  if (notifs[nMax-1]) {
    Notifications.remove({block: {$lt: notifs[nMax-1].block}})
  }
}
setInterval(function() {
  Notifications.purge(200)
}, 60000)