Template.videosettingsdropdown.rendered = function() {
    $('.dropdownvideosettings').dropdown({});
}
    
Template.videosettingsdropdown.events({
  'click .item.copylink': function () {
    var text = document.getElementById('permalink').value;
    console.log(text)
    if (window.clipboardData && window.clipboardData.setData) {
      return clipboardData.setData("Text", text);
    } else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
      var textarea = document.createElement("textarea");
      textarea.textContent = text;
      textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in MS Edge.
      document.body.appendChild(textarea);
      textarea.select();
      try {
        return document.execCommand("copy");  // Security exception may be thrown by some browsers.      
      } catch (ex) {
        toastr.error('VIDEO_LINK_ERROR')
        return false;
      } finally {
        toastr.success(translate('VIDEO_PERMA_LINK_COPIED'))
        document.body.removeChild(textarea);
      }
    }
  },
  'click .item.copyembed': function () {
    var text = document.getElementById('embedlink').value;
    console.log(text)
    if (window.clipboardData && window.clipboardData.setData) {
      return clipboardData.setData("Text", text);
    } else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
      var textarea = document.createElement("textarea");
      textarea.textContent = text;
      textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in MS Edge.
      document.body.appendChild(textarea);
      textarea.select();
      try {
        return document.execCommand("copy");  // Security exception may be thrown by some browsers.
      } catch (ex) {
        toastr.error('VIDEO_LINK_ERROR')
        return false;
      } finally {
        toastr.success(translate('VIDEO_EMBED_LINK_COPIED'))
        document.body.removeChild(textarea);
      }
    }
  },
  'click .addvideotowatchlater': function () {
    WatchLater.upsert({ _id: this._id }, this)
    event.stopPropagation()
  },
  'click .resteem': function() {
    var author = FlowRouter.getParam("author")
    var permlink = FlowRouter.getParam("permlink")
    broadcast.avalon.reblog(author, permlink, function (err, result) {
      if (err) toastr.error(Meteor.blockchainError(err), translate('ERROR_TITLE'))
      else toastr.success(translate('GLOBAL_ERROR_RESTEEMED', author + '/' + permlink))
    });
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