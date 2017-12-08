
Template.watchlater.helpers({
  watchLater: function () {  
      return WatchLaterCollection.find().fetch()
    
  }, 
  isOnMobile: function () {
    if (/Mobi/.test(navigator.userAgent)) { 
        return true;
    }
  }
})
