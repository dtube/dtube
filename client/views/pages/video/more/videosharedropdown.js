Template.videosharedropdown.rendered = function() {
    $('.dropdownvideoshare').dropdown({});
}
    
Template.videosharedropdown.events({
  'click .item.copylink': function () {
    var text = document.getElementById('permalink').value;
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
        toastr.error('VIDEO_LINK_COPY_ERROR')
        return false;
      } finally {
        toastr.success(translate('VIDEO_PERMA_LINK_COPIED'))
        document.body.removeChild(textarea);
      }
    }
  },
  'click .item.copyembed': function () {
    var text = document.getElementById('embedlink').value;
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
        toastr.error('VIDEO_EMBED_LINK_COPY_ERROR')
        return false;
      } finally {
        toastr.success(translate('VIDEO_EMBED_LINK_COPIED'))
        document.body.removeChild(textarea);
      }
    }
  }
})

Template.videosharedropdown.helpers({
  video: function () {
    var videos = Videos.find({
      'author': FlowRouter.getParam("author"),
      'link': FlowRouter.getParam("permlink")
    }).fetch();

    for (var i = 0; i < videos.length; i++) {
      if (videos[i].source == 'chainDirect') {
        var title = '';
        if (videos[i].title) title = videos[i].title;
        if (videos[i].json) title = videos[i].json.title;
        Session.set("pageTitle", title);
        return videos[i];
      }
    }

    for (var i = 0; i < videos.length; i++) {
      if (videos[i].source == 'chainByBlog') return videos[i];
      if (videos[i].source == 'chainByHot') return videos[i];
      if (videos[i].source == 'chainByCreated') return videos[i];
      if (videos[i].source == 'chainByTrending') return videos[i];
    }

    if (videos && videos[0]) return videos[0];
    return;
  },
  jsoun: (json) => {
    return Template.player.toJsoun(json)
  }
})
