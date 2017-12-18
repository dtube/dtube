Template.history.rendered = function () {
  Template.sidebar.activeSidebarWatchAgain()
  $('.dtube').removeClass('loading')
  Template.settingsdropdown.nightMode();
}

Template.history.helpers({
  watchAgain: function () {
    return Videos.find({ source: 'wakaArticles' }, { limit: 100 }).fetch()
  }, 
  isOnMobile: function () {
    if (/Mobi/.test(navigator.userAgent)) { 
        return true;
    }
  }
})
