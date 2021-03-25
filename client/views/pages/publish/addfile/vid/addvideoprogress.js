Template.addvideoprogress.rendered = () => Template.settingsdropdown.nightMode()
Template.addvideoprogress.helpers({
    progress: function() {
      return Session.get('uploadVideoProgress')
    }
})

Template.addvideoprogress.rendered = function() {
  $('.initbar').progress();
}
Template.addvideoprogress.update = function() {
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
        Session.set('addVideoStep', 'addvideoformfileuploaded')

        setTimeout(function() {
          if (data.ipfsAddSourceVideo)
            $('input[name="vid.src"]').val(data.ipfsAddSourceVideo.hash)
          if (data.encodedVideos) {
            for (let i = 0; i < data.encodedVideos.length; i++) {
              switch(data.encodedVideos[i].ipfsAddEncodeVideo.encodeSize || data.encodedVideos[i].encode.encodeSize) {
                case '240p':
                  $('input[name="vid.240"]').val(data.encodedVideos[i].ipfsAddEncodeVideo.hash)
                  break;
                case '480p':
                  $('input[name="vid.480"]').val(data.encodedVideos[i].ipfsAddEncodeVideo.hash)
                  break;
                case '720p':
                  $('input[name="vid.720"]').val(data.encodedVideos[i].ipfsAddEncodeVideo.hash)
                  break;
                case '1080p':
                  $('input[name="vid.1080"]').val(data.encodedVideos[i].ipfsAddEncodeVideo.hash)
                  break;
              }
            }
          }
          $('input[name="gw"]').val('https://player.d.tube')
    
          if (data.sprite)
            $('input[name="img.spr"]').val(data.sprite.ipfsAddSprite.hash)
        }, 200)
  
        Session.set('uploadVideoProgress', null)
        $('#step1load').parent().addClass('completed')
      }
    }
  })
}
