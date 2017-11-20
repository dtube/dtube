Template.videosettingsdropdown.rendered = function() {
    $('.dropdownvideosettings').dropdown({});
    $('.dropdownvideoshare').dropdown({});
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
  }
})
    