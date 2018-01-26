refreshUploadStatus = null

Template.upload.rendered = function () {
  Session.set('uploadToken', null)
  Session.set('uploadVideoProgress', null)
  $('.ui.sticky')
    .sticky({
      context: '#videouploadsteps'
    });
}

Template.upload.createPermlink = function (length) {
  var text = "";
  var possible = "abcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

Template.upload.helpers({
  isOnMobile: function () {
    if (/Mobi/.test(navigator.userAgent)) {
      return true;
    }
  }
});

Template.upload.uploadBalancer = function () {
  //var uploaders = Session.get('remoteSettings').upldr
    var uploaders = [3,2]
    var tocompare = []
    var queuethreshold = 3;
    uploaders.every(function(uploader) {
      getUploaderStatus('https://upldr'+ uploader +'.d.tube/getStatus').then(function (response) {
        var waitings = response.currentWaitingInQueue.ipfsToAddInQueue + response.currentWaitingInQueue.spriteToCreateInQueue + response.currentWaitingInQueue.videoToEncodeInQueue
        if (waitings < queuethreshold) {
          Session.set('upldr', uploader)
          return true
        }
        else {
          tocompare.push([{name:uploader},{waiting:waitings}])
          if (tocompare.length == uploaders.length)
          {
            var i = 0;
            var smallestNumber = tocompare[0][1].waiting;
            for(i = 0; i < tocompare.length; i++) {
                if(tocompare[i][1].waiting < smallestNumber) {
                    smallestNumber = tocompare[i][0].waiting;
                    Session.set('upldr', tocompare[i][0].name)
                    console.log('Current uploader : ' + tocompare[i][0].name +' '+ ' ---  Waiting in queue : ' + tocompare[i][1].waiting)
                    return true
                }
            }
          }
          else return false
        }
    }
      , function (status) {
        console.log('Something went wrong.');
      });
      return !(uploader === 1);
  });
}

var getUploaderStatus = function (url) {
  return new Promise(function (resolve, reject) {
    var req = new XMLHttpRequest();
    req.open('get', url, true);
    req.overrideMimeType("application/json");
    req.onload = function () {
      var status = req.status;
      if (status == 200) {
        resolve(JSON.parse(req.responseText));
      } else {
        reject(status);
      }
    };
    req.send();
  });
};


// Template.upload.rendered = function () {
//   Template.upload.isOnTablet();
//   $(window).on('resize', Template.upload.isOnTablet)
// }

// Template.upload.isOnTablet = function () {
//   if ($(window).width() < 992) 
//      return true
//   else 
//      return false
// }

Template.upload.genBody = function (author, permlink, title, snaphash, videohash, description) {
  var body = '<center>'
  body += '<a href=\'https://d.tube/#!/v/' + author + '/' + permlink + '\'>'
  body += '<img src=\'https://ipfs.io/ipfs/' + Session.get('overlayHash') + '\'></a></center><hr>\n\n'
  body += description
  body += '\n\n<hr>'
  body += '<a href=\'https://d.tube/#!/v/' + author + '/' + permlink + '\'> ▶️ DTube</a><br />'
  body += '<a href=\'https://ipfs.io/ipfs/' + videohash + '\'> ▶️ IPFS</a>'
  return body
}

Template.upload.uploadVideo = function (file, progressid, cb) {
  var postUrl = 'https://upldr' + Session.get('upldr') + '.d.tube/uploadVideo?videoEncodingFormats=480p&sprite=true'
  var formData = new FormData();
  formData.append('files', file);
  $(progressid).progress({ value: 0, total: 1 })
  $(progressid).show();
  $.ajax({
    url: postUrl,
    type: "POST",
    data: formData,
    xhr: function () {
      var xhr = new window.XMLHttpRequest();
      xhr.upload.addEventListener("progress", function (evt) {
        if (evt.lengthComputable) {
          $(progressid).progress({ value: evt.loaded, total: evt.total });
          if (evt.loaded == evt.total) {
            $(progressid).progress({ value: evt.loaded, total: evt.total });
            $('#progressvideo > .label').html('File received. Requesting Token...')
          }
        }
      }, false);
      return xhr;
    },
    cache: false,
    contentType: false,
    processData: false,
    success: function (result) {
      $(progressid).hide()
      Session.set('uploadToken', result.token)
      refreshUploadStatus = setInterval(function () {
        Template.uploadvideoprogress.update()
      }, 1000)
      cb(null, result)
    },
    error: function (error) {
      $(progressid).hide()
      cb(error)
    }
  });
}

Template.upload.uploadImage = function (file, progressid, cb) {
  var postUrl = 'https://snap1.d.tube/uploadImage'
  var formData = new FormData();
  formData.append('files', file);
  $(progressid).progress({ value: 0, total: 1 })
  $(progressid).show();
  $.ajax({
    url: postUrl,
    type: "POST",
    data: formData,
    xhr: function () {
      var xhr = new window.XMLHttpRequest();
      xhr.upload.addEventListener("progress", function (evt) {
        if (evt.lengthComputable) {
          $(progressid).progress({ value: evt.loaded, total: evt.total });
          if (evt.loaded == evt.total) {
            $(progressid).progress({ value: evt.loaded, total: evt.total });
            $('#progressvideo > .label').html('Snap Received...')
          }
        }
      }, false);
      return xhr;
    },
    cache: false,
    contentType: false,
    processData: false,
    success: function (result) {
      $(progressid).hide()
      console.log(result)

      refreshUploadSnapStatus = setInterval(function () {
        var url = 'https://snap1.d.tube/getProgressByToken/' + result.token
        $.getJSON(url, function (data) {
          var isCompleteUpload = true
          if (data.ipfsAddSource.progress !== "100.00%") {
            isCompleteUpload = false;
          }
          if (data.ipfsAddOverlay.progress !== "100.00%") {
            isCompleteUpload = false;
          }
          if (isCompleteUpload) {
            clearInterval(refreshUploadSnapStatus)
            $('input[name="snaphash"]').val(data.ipfsAddSource.hash)
            Session.set('overlayHash', data.ipfsAddOverlay.hash)
            $('#step2load').hide()
            $('#step2load').parent().addClass('completed')
          }
        })
      }, 1000)
    },
    error: function (error) {
      $(progressid).hide()
      cb(error)
    }
  });
}

Template.upload.inputVideo = function (dt) {
  if (!dt.files || dt.files.length == 0) {
    toastr.error(translate('UPLOAD_ERROR_UPLOAD_FILE'), translate('ERROR_TITLE'))
    return
  }
  var file = dt.files[0]
  if (file.type.split('/')[0] != 'video') {
    toastr.error(translate('UPLOAD_ERROR_WRONG_FORMAT'), translate('ERROR_TITLE'))
    return
  }
  $('#videopreview').removeClass('dsp-non')
  $('#snappreview').removeClass('dsp-non')
  $('#dropzone').hide()
  $('#step1load').show()
  $('input[name="title"]').val(file.name.substring(0, file.name.lastIndexOf(".")))

  // displaying the preview
  var videoNode = document.querySelector('video')
  var fileURL = URL.createObjectURL(file)
  videoNode.addEventListener('durationchange', function () {
    if (videoNode.readyState) {
      $('input[name="duration"]').val(videoNode.duration)
    }
  })
  videoNode.src = fileURL

  // uploading to ipfs
  Template.upload.uploadVideo(file, '#progressvideo', function (err, result) {
    $('#step1load').hide()
    if (err) {
      console.log(err)
      toastr.error(err, translate('UPLOAD_ERROR_IPFS_UPLOADING'))
      return
    } else {
      console.log('Uploaded video', result);
    }
  })

  console.log(file)
  $('input[name="filesize"]').val(file.size)
  // Torrent.seed(file, function(torrent) {
  //   $('input[name="magnet"]').val(torrent.magnetURI)
  // })
}

Template.upload.events({
  'click #dropzone': function (event) {
    $('#fileToUpload').click()
  },
  'change #fileToUpload': function (event) {
    Template.upload.inputVideo(event.target)
  },
  'dropped #dropzone': function (event) {
    Template.upload.inputVideo(event.originalEvent.dataTransfer)
  },
  'click #snap': function (event) {
    var video = document.querySelector('video')
    var canvas = document.querySelector('canvas')
    var context = canvas.getContext('2d')
    var w, h, ratio

    // Calculate the ratio of the video's width to height
    ratio = video.videoWidth / video.videoHeight
    // Define the required width as 100 pixels smaller than the actual video's width
    w = video.videoWidth - 100
    // Calculate the height based on the video's width and the ratio
    h = parseInt(w / ratio, 10)
    // Set the canvas width and height to the values just calculated
    canvas.width = w
    canvas.height = h

    // Define the size of the rectangle that will be filled (basically the entire element)
    context.fillRect(0, 0, w, h)
    // Grab the image from the video
    context.drawImage(video, 0, 0, w, h)
    // Save snap to disk
    var dt = canvas.toDataURL('image/jpeg')
    $('#snap').attr('href', dt)
  },
  'change #snapFile': function (event) {
    var file = event.currentTarget.files[0];
    var ValidImageTypes = ["image/gif", "image/jpeg", "image/png"];
    if (file.type.split('/')[0] != 'image') {
      toastr.error(translate('UPLOAD_ERROR_NOT_IMAGE'), translate('ERROR_TITLE'))
      return
    }
    if (file.size > Session.get('remoteSettings').snapMaxFileSizeKB * 1000) {
      toastr.error(translate('UPLOAD_ERROR_REACH_MAX_SIZE') + ' ' + Session.get('remoteSettings').snapMaxFileSizeKB + ' KB', translate('ERROR_TITLE'))
      return
    }

    $('#step2load').show()

    // uploading to ipfs
    if (Session.get('ipfsUpload')) node = Session.get('ipfsUpload')
    //Template.upload.HTTP(node, file, '#progresssnap', function(err, result) {
    Template.upload.uploadImage(file, '#progresssnap', function (err, result) {
      $('#step2load').hide()
      if (err) {
        console.log(err)
        toastr.error(err, translate('UPLOAD_ERROR_IPFS_UPLOADING'))
        return
      } else {
        $('#step2load').parent().addClass('completed')
        console.log('Uploaded Snap', result)
        $('input[name="snaphash"]').val(result.Hash)
      }
    })
  }
})
