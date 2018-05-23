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
  var url = (Session.get('remoteSettings').localhost == true)
    ? 'http://localhost:5000/getProgressByToken/'+token
    : 'https://'+Session.get('upldr')+'.d.tube/getProgressByToken/'+token
  var credentials = Session.get('upldr') == 'cluster' ? true : false
  $.ajax({
    cache: false,
    contentType: false,
    processData: false,
    url: url,
    type: 'GET',
    xhrFields: {
      withCredentials: credentials
    },
    success: function(data) {
      console.log(data)
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
  
        if (data.encodedVideos) {
          for (let i = 0; i < data.encodedVideos.length; i++) {
            switch(data.encodedVideos[i].ipfsAddEncodeVideo.encodeSize || data.encodedVideos[i].encode.encodeSize) {
              case '240p':
                $('input[name="video240hash"]').val(data.encodedVideos[i].ipfsAddEncodeVideo.hash)
                break;
              case '480p':
                $('input[name="video480hash"]').val(data.encodedVideos[i].ipfsAddEncodeVideo.hash)
                break;
              case '720p':
                $('input[name="video720hash"]').val(data.encodedVideos[i].ipfsAddEncodeVideo.hash)
                break;
              case '1080p':
                $('input[name="video1080hash"]').val(data.encodedVideos[i].ipfsAddEncodeVideo.hash)
                break;
            }
          }
        }
        
  
        if (data.sprite)
          $('input[name="spritehash"]').val(data.sprite.ipfsAddSprite.hash)
  
        Session.set('uploadVideoProgress', null)
        $('#step1load').parent().addClass('completed')
      }
    }
  })
  // $.getJSON(url, {
  //     xhrFields: { withCredentials:true },
  //     crossDomain: true
  //   }, function( data ) {

  //   }
  // })
}
