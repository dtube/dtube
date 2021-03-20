Template.history.rendered = function () {
  $('.dtube').removeClass('loading')
  Template.settingsdropdown.nightMode();
  Session.set('loadedHistory',WatchAgain.find({},{ limit: 20, sort: { last_viewed: -1 } }).fetch())

  $('.ui.infinite').visibility({
    once: false,
    observeChanges: true,
    onBottomVisible: function() {
      $('.ui.infinite .loader').show()
      let currentHistory = Session.get('loadedHistory')
      let next50 = WatchAgain.find({},{ limit: 20, sort: { last_viewed: -1 }, skip: currentHistory.length }).fetch()
      for (let i in next50)
        currentHistory.push(next50[i])
      Session.set('loadedHistory',currentHistory)
      if (next50.length == 0)
        $('.ui.infinite .loader').hide()
    }
  })
}

Template.history.helpers({
  watchAgain: function () {
    $('.ui.infinite .loader').hide()
    return Session.get('loadedHistory')
  }
})
