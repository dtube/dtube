var moment = require('moment')

Template.newvideos.helpers({
  isOnMobile: function () {
    if (/Mobi/.test(navigator.userAgent)) { 
        return true;
    }
  },
  newVideos: function () {
    return Videos.find({ source: 'chainByCreated' }).fetch()
      // a quoi ca sert ?
      // .sort(function (a, b) {
      //   return moment(b.created) - moment(a.created)
      // })
  }
})

Template.newvideos.rendered = function () {
  Template.sidebar.activeSidebarNew();

  $('.ui.infinite')
  .visibility({
    once: false,
    observeChanges: true,
    onBottomVisible: function() {
      $('.ui.infinite .loader').show()
      Videos.getVideosBy('created', 10, function(err){
        if (err) console.log(err)
        $('.ui.infinite .loader').hide()
        setTimeout(function() {
          if (document.body.scrollHeight <= document.body.clientHeight) {
            console.log(this)
          }
        },300)
      })
    }
  });
}
