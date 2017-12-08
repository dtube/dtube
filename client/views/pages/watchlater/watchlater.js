
Template.watchlater.helpers({
  watchLater: function () {  
    WatchLaterCollection.find().fetch(function(r) 
    {console.log(r)})
    // WatchLaterCollection.find().fetch(function(r) {
    //   for (var i = 0; i < WatchLaterCollection.find().fetch().length; i++) {
    //     console.log(r[i])
    //   }})
  }, 
  isOnMobile: function () {
    if (/Mobi/.test(navigator.userAgent)) { 
        return true;
    }
  }
})

Template.watchlater.rendered = function () {
  WatchLaterCollection.find().fetch(function(r) {console.log(r)})
} 
