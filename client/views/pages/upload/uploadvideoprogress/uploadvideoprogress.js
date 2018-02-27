Template.uploadvideoprogress.helpers({
    progress: function() {
      return Session.get('uploadVideoProgress')
    }
})

Template.uploadvideoprogress.rendered = function() {
  $('.initbar').progress();
}
Template.uploadvideoprogress.update = function() {
  var token = Session.get('uploadToken')
  var url = 'https://upldr'+Session.get('upldr')+'.d.tube/getProgressByToken/'+token
  $.getJSON(url, function( data ) {
    Session.set('uploadVideoProgress', data)

    // if upload is finished, we stop updating the progress
    
    var isCompleteUpload = true
    if (typeof data.finished === 'boolean' && data.finished === false) {
      isCompleteUpload = false
    } else if (typeof data.finished === 'undefined') {
      for (var i = data.encodedVideos.length-1; i >= 0; i--) {
        if (data.encodedVideos[i].encode.progress !== "100.00%") {
          isCompleteUpload = false;
          break;
        }
        if (data.encodedVideos[i].ipfsAddEncodeVideo.progress !== "100.00%") {
          isCompleteUpload = false;
          break;
        }
      }
      if (data.ipfsAddSourceVideo.progress !== "100.00%") {
        isCompleteUpload = false;
      }
    }

    if (isCompleteUpload) {
      clearInterval(refreshUploadStatus)

      if (data.ipfsAddSourceVideo)
        $('input[name="videohash"]').val(data.ipfsAddSourceVideo.hash)

      for (let i = 0; i < data.encodedVideos.length; i++) {
        switch(data.encodedVideos[i].ipfsAddEncodeVideo.encodeSize || data.encodedVideos[i].encode.encodeSize) {
          case 'F480p':
            $('input[name="video480hash"]').val(data.encodedVideos[i].ipfsAddEncodeVideo.hash)
            break;
          case 'F720p':
            $('input[name="video720hash"]').val(data.encodedVideos[i].ipfsAddEncodeVideo.hash)
            break;
          case 'F1080p':
            $('input[name="video1080hash"]').val(data.encodedVideos[i].ipfsAddEncodeVideo.hash)
            break;
        }
      }

      if (data.sprite)
        $('input[name="spritehash"]').val(data.sprite.ipfsAddSprite.hash)

      Session.set('uploadVideoProgress', null)
      $('#step1load').parent().addClass('completed')
    }
  })
}