Template.videosettingsdropdown.rendered = function() {
    $('.dropdownvideosettings').dropdown({});
}
    
Template.videosettingsdropdown.events({
  'click .addvideotowatchlater': function () {
    WatchLater.upsert({ _id: this._id }, this)
    event.stopPropagation()
  },
  'click .showStats': function() {
    Template.video.popularityChart()
  },
  'click .mirrorlink': function() {
    Template.player.changeProvider(this.disp)
    $('.embed>iframe').hover(function(){
      if ($('.mirrors').is(':animated'))
        $('.mirrors').stop(true, true)
      $('.mirrors').show()
      clearTimeout(Template.video.isGonnaCloseMirrors)
    },function(){
      Template.video.isGonnaCloseMirrors = setTimeout(function() {
        $('.mirrors').fadeOut(2500)
      }, 1000)
    })
  },
})
    

Template.videosettingsdropdown.helpers({
  isInWatchLater: function () {
    return WatchLater.find({
      author: FlowRouter.getParam("author"),
      permlink: FlowRouter.getParam("permlink")
    }).count()
  },
  availProviders: function() {
    var provDisp = Providers.available(Template.video.__helpers[" video"]().json)
    var provs = []
    for (let i = 0; i < provDisp.length; i++) {
      provs.push({
        disp: provDisp[i],
        logo: Providers.dispToLogo(provDisp[i])
      })
    }
    if (provs.length <= 1)
      return []
    return provs
  },
})