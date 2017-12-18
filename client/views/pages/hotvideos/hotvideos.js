Template.hotvideos.helpers({
  isOnMobile: function () {
    if (/Mobi/.test(navigator.userAgent)) { 
        return true;
    }
  },
  hotVideos: function () {
    return Videos.find({ source: 'chainByHot' }, { limit: 25 }).fetch()
  }
})

Template.hotvideos.rendered = function () {
  Template.sidebar.activeSidebarHot();
  Template.settingsdropdown.nightMode();
}
