refreshUploadStatus = null

Template.upload.rendered = function () {
  Session.set('uploadToken', null)
  Session.set('uploadVideoProgress', null)
  Session.set('tempSubtitles', [])
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

function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j]; 1
    array[j] = temp;
  }
}

Template.upload.setBestUploadEndpoint = function (cb) {
  if (Session.get('remoteSettings').localhost == true) {cb(); return}
  if (Session.get('upldr')) {cb();return}
  var uploaders = Session.get('remoteSettings').upldr
  shuffleArray(uploaders)
  console.log(uploaders)
  var results = []
  var queuethreshold = 3;
  var finished = false;
  for (let i = 0; i < uploaders.length; i++) {
    getUploaderStatus(uploaders[i]).then(function (response) {
      var upldr = response.upldr
      var totalQueueSize = 0;
      if (response.version == '0.6.6' || response.currentWaitingInQueue.version) {
        totalQueueSize += response.currentWaitingInQueue.ipfsToAddInQueue
        totalQueueSize += response.currentWaitingInQueue.spriteToCreateInQueue
        totalQueueSize += response.currentWaitingInQueue.videoToEncodeInQueue
      } else {
        totalQueueSize += response.currentWaitingInQueue.audioCpuToEncode
        totalQueueSize += response.currentWaitingInQueue.videoGpuToEncode
        totalQueueSize += response.currentWaitingInQueue.audioVideoCpuToEncode
        totalQueueSize += response.currentWaitingInQueue.spriteToCreate
        totalQueueSize += response.currentWaitingInQueue.ipfsToAdd
      }

      results.push({
        upldr: upldr,
        totalQueueSize: totalQueueSize
      })

      if (totalQueueSize < queuethreshold && !finished) {
        Session.set('upldr', upldr)
        console.log('upldr' + upldr + ' ' + ' ---  totalQueueSize: ' + totalQueueSize)
        finished = true
        cb()
      } else if (results.length == uploaders.length && !finished) {
        var bestEndpoint = results.sort(function (a, b) {
          return a.totalQueueSize - b.totalQueueSize
        })[0]
        Session.set('upldr', bestEndpoint.upldr)
        console.log('upldr' + bestEndpoint.upldr + ' ' + ' ---  totalQueueSize: ' + bestEndpoint.totalQueueSize)
        finished = true
        cb()
      }
    }, function (upldr) {
      results.push({ upldr: upldr, error: true })
    });
  }
}

var getUploaderStatus = function (upldr) {
  var url = (Session.get('remoteSettings').localhost == true)
    ? 'http://localhost:5000/getStatus'
    : 'https://'+upldr+'.d.tube/getStatus'
  return new Promise(function (resolve, reject) {
    var req = new XMLHttpRequest();
    req.open('get', url, true);
    req.overrideMimeType("application/json");
    req.onload = function () {
      var status = req.status;
      if (status == 200) {
        var jsonResult = JSON.parse(req.responseText)
        jsonResult.upldr = upldr
        resolve(jsonResult);
      } else {
        reject(upldr);
      }
    };
    req.send();
  });
};

Template.upload.genBody = function (author, permlink, title, snaphash, videohash, description) {
  if (FlowRouter.current().route.name == 'golive')
    return Template.upload.genBodyLivestream(author, permlink, title, snaphash, description)
  else {
    var body = '<center>'
    body += '<a href=\'https://d.tube/#!/v/' + author + '/' + permlink + '\'>'
    body += '<img src=\'https://ipfs.io/ipfs/' + Session.get('overlayHash') + '\'></a></center><hr>\n\n'
    body += description
    body += '\n\n<hr>'
    body += '<a href=\'https://d.tube/#!/v/' + author + '/' + permlink + '\'> ▶️ DTube</a><br />'
    body += '<a href=\'https://ipfs.io/ipfs/' + videohash + '\'> ▶️ IPFS</a>'
    return body
  }
}

Template.upload.genBodyLivestream = function (author, permlink, title, snaphash, description) {
  var body = '<center>'
  body += '<a href=\'https://d.tube/#!/v/' + author + '/' + permlink + '\'>'
  body += '<img src=\'https://ipfs.io/ipfs/' + Session.get('overlayHash') + '\'></a></center><hr>\n\n'
  body += description
  body += '\n\n<hr>'
  body += '<a href=\'https://d.tube/#!/v/' + author + '/' + permlink + '\'> ▶️ DTube</a><br />'
  return body
}

Template.upload.uploadVideo = function (file, progressid, cb) {
  var postUrl = (Session.get('remoteSettings').localhost == true)
    ? 'http://localhost:5000/uploadVideo?videoEncodingFormats=240p,480p,720p,1080p&sprite=true'
    : 'https://'+Session.get('upldr')+'.d.tube/uploadVideo?videoEncodingFormats=240p,480p,720p,1080p&sprite=true'
  var formData = new FormData();
  formData.append('files', file);
  $(progressid).progress({ value: 0, total: 1 })
  $(progressid).show();
  var credentials = Session.get('upldr') == 'cluster' ? true : false
  $.ajax({
    cache: false,
    contentType: false,
    data: formData,
    processData: false,
    type: "POST",
    url: postUrl,
    xhrFields: {
      withCredentials: credentials
    },
    xhr: function () {
      // listen for progress events on the upload
      var xhr = new window.XMLHttpRequest();
      xhr.upload.addEventListener("progress", function (evt) {
        if (evt.lengthComputable) {
          $(progressid).progress({ value: evt.loaded, total: evt.total });
          if (evt.loaded == evt.total) {
            $(progressid).progress({ value: evt.loaded, total: evt.total });
          }
        }
      }, false);
      return xhr;
    },
    success: function (result) {
      if (typeof result === 'string')
        result = JSON.parse(result)

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
  if (typeof refreshUploadSnapStatus !== 'undefined') clearInterval(refreshUploadSnapStatus)
  $('#uploadSnap').addClass('disabled')
  $('#uploadSnap > i').removeClass('cloud upload red')
  $('#uploadSnap > i').addClass('asterisk loading')
  $('#uploadSnap > i').css('background', 'transparent')
  var postUrl = (Session.get('remoteSettings').localhost == true)
    ? 'http://localhost:5000/uploadImage'
    : 'https://snap1.d.tube/uploadImage'
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
          }
        }
      }, false);
      return xhr;
    },
    cache: false,
    contentType: false,
    processData: false,
    success: function (result) {
      if (typeof result === 'string')
        result = JSON.parse(result)
      $(progressid).hide()

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
            $('#uploadSnap').removeClass('disabled')
            $('#uploadSnap > i').addClass('checkmark green')
            $('#uploadSnap > i').removeClass('asterisk loading')
            $('#uploadSnap > i').css('background', 'white')
            cb(null, data.ipfsAddSource)
          }
        })
      }, 1000)
    },
    error: function (error) {
      $(progressid).hide()
      cb(error)
      $('#uploadSnap').removeClass('disabled')
      $('#uploadSnap > i').addClass('cloud upload red')
      $('#uploadSnap > i').removeClass('asterisk loading')
      $('#uploadSnap > i').css('background', 'white')
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

  // checking best ipfs-uploader endpoint available
  Template.upload.setBestUploadEndpoint(function () {
    // uploading to ipfs
    Template.upload.uploadVideo(file, '#progressvideo', function (err, result) {
      if (err) {
        console.log(err)
        toastr.error(err, translate('UPLOAD_ERROR_IPFS_UPLOADING'))
        return
      } else {
        console.log('Uploaded video', result);
      }
    })
  });


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


    // uploading to ipfs
    if (Session.get('ipfsUpload')) node = Session.get('ipfsUpload')
    //Template.upload.HTTP(node, file, '#progresssnap', function(err, result) {
    Template.upload.uploadImage(file, '#progresssnap', function (err, result) {
      if (err) {
        console.log(err)
        toastr.error(err, translate('UPLOAD_ERROR_IPFS_UPLOADING'))
        return
      } else {
        console.log('Uploaded Snap', result)
        $('input[name="snaphash"]').val(result.Hash)
      }
    })
  }
})
