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
  }
})
    

Template.videosettingsdropdown.helpers({
  isInWatchLater: function () {
    return WatchLater.find({
      author: FlowRouter.getParam("author"),
      permlink: FlowRouter.getParam("permlink")
    }).count()
  }
})