Template.history.rendered = function () {
  $('.dtube').removeClass('loading')
  Template.settingsdropdown.nightMode();
}

Template.history.helpers({
  watchAgain: function () {
    return WatchAgain.find().fetch()
  }
})
