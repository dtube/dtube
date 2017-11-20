Template.uploadvideoprogress.helpers({
    progress: function() {
      return Session.get('uploadVideoProgress')
    }
})

Template.uploadvideoprogress.update = function() {
  var token = Session.get('uploadToken')
  var url = 'https://upldr1.d.tube/getProgressByToken/'+token
  $.getJSON(url, function( data ) {
    Session.set('uploadVideoProgress', data)


    // if upload is finished, we stop updating the progress
    var isCompleteUpload = true
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
    if (isCompleteUpload) {
      clearInterval(refreshUploadStatus)

      $('input[name="videohash"]').val(data.ipfsAddSourceVideo.hash)
      $('input[name="video480hash"]').val(data.encodedVideos[0].ipfsAddEncodeVideo.hash)
      $('input[name="spritehash"]').val(data.sprite.ipfsAddSprite.hash)

      Session.set('uploadVideoProgress', null)
      $('#step1load').parent().addClass('completed')
    }
  })
}