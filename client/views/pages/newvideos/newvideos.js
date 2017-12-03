Template.newvideos.helpers({
  isOnMobile: function () {
    if (/Mobi/.test(navigator.userAgent)) { 
        return true;
    }
  },
  newVideos: function () {
    return Videos.find({ source: 'chainByCreated' }).fetch().sort(function (a, b) {
      return moment(b.created) - moment(a.created)
    })
  }
})

