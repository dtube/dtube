Template.watchlater.rendered = () => {
  Template.settingsdropdown.nightMode()
  Session.set('loadedWatchLater',WatchLater.find({},{ limit: 20 }).fetch())

  $('.ui.infinite').visibility({
    once: false,
    observeChanges: true,
    onBottomVisible: function() {
      $('.ui.infinite .loader').show()
      let currentWatchLater = Session.get('loadedWatchLater')
      let next50 = WatchLater.find({},{ limit: 20, skip: currentWatchLater.length }).fetch()
      for (let i in next50)
        currentWatchLater.push(next50[i])
      Session.set('loadedWatchLater',currentWatchLater)
      if (next50.length == 0)
        $('.ui.infinite .loader').hide()
    }
  })
}

Template.watchlater.helpers({
  watchLater: function () {  
      return Session.get('loadedWatchLater')
  }
})
