Template.history.rendered = function () {
  Session.set('isOnWatchAgain', true)
  $('.dtube').removeClass('loading')
  Template.settingsdropdown.nightMode();
}

Template.history.helpers({
  watchAgain: function () {
    return Videos.find({ source: 'wakaArticles' }, { limit: 100 }).fetch()
  }
})
