var cheerio = require('cheerio')
var parse = require('url-parse')
const tus = require('tus-js-client')
const socketio = require('socket.io-client')
refreshUploadStatus = null

Template.upload.rendered = function () {
  Session.set('uploadToken', null)
  Session.set('uploadVideoProgress', null)
  Session.set('tempSubtitles', [])
  Session.set('searchedLink', null)
  Session.set('publishBurn', 0)
  Session.set('tempContent', null)
  Session.set('uploadEndpoint',null)
  $('.ui.sticky')
    .sticky({
      context: '#videouploadsteps'
    });
  $('#uploadEndpointSelection').dropdown({
    action: 'activate',
    onChange: (value,text) => {
      $('#uploadEndpointSelection').parent().children('.icon').removeClass('check').addClass('dropdown')
      // If uploader.oneloved.tube endpoint selected, check if user is in uploader whitelist
      if (value === 'uploader.oneloved.tube') {
        if (!Session.get('activeUsernameSteem')) { 
          $('#uploadEndpointSelection').dropdown('restore defaults')
          return toastr.error(translate('UPLOAD_ENDPOINT_ERROR_NO_STEEM_USERNAME'), translate('ERROR_TITLE'))
        }
        $('#uploadEndpointSelection').parent().addClass('loading')
        $.ajax({
          url: 'https://' + value + '/login?user=' + Session.get('activeUsernameSteem'),
          method: 'GET',
          success: (result) => {
            broadcast.steem.decrypt_memo(result.encrypted_memo,(err,decryptedMemo) => {
              if (err === 'LOGIN_ERROR_KEYCHAIN_NOT_INSTALLED') {
                $('#uploadEndpointSelection').dropdown('restore defaults')
                $('#uploadEndpointSelection').parent().removeClass('loading')
                return toastr.error(translate('LOGIN_ERROR_KEYCHAIN_NOT_INSTALLED'),translate('ERROR_TITLE'))
              } else if (err) {
                $('#uploadEndpointSelection').dropdown('restore defaults')
                $('#uploadEndpointSelection').parent().removeClass('loading')
                return toastr.error(err,translate('ERROR_TITLE'))
              }
              $.ajax({
                url: 'https://' + value + '/logincb',
                method: 'POST',
                contentType: 'text/plain',
                data: decryptedMemo,
                success: (result) => {
                  Session.set('uploadEndpoint',value)
                  Session.set('Upload token for ' + value,result.access_token)
                  console.log(result.access_token)
                  $('#uploadEndpointSelection').parent().removeClass('loading')
                  $('#uploadEndpointSelection').parent().children('.icon').removeClass('dropdown').addClass('check')
                },
                error: (req,status) => handleUploadEndpointCheckError(req,status)
              })
            })
          },
          error: (req,status) => handleUploadEndpointCheckError(req,status)
        })
      } else {
        Session.set('uploadEndpoint',null)
      }
    }
  })
}

Template.upload.createPermlink = function (length) {
  var text = "";
  var possible = "abcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

Template.upload.inputVideo = function (dt) {
  $('#uploadSeparator').hide()
  $('#uploadLinkForm').hide()
  $('#uploadDetails').show()
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

  Session.set('tempContent', 'file')
  Template.upload.burnRange(function(){})

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

Template.upload.setBestUploadEndpoint = function (cb) {
  if (Session.get('uploadEndpoint') === 'uploader.oneloved.tube') return cb()
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

Template.upload.uploadVideo = function (file, progressid, cb) {
  var postUrl = (Session.get('remoteSettings').localhost == true)
    ? 'http://localhost:5000/uploadVideo?videoEncodingFormats=240p,480p,720p,1080p&sprite=true'
    : 'https://'+Session.get('upldr')+'.d.tube/uploadVideo?videoEncodingFormats=240p,480p,720p,1080p&sprite=true'
  let formData = new FormData()

  if (Session.get('uploadEndpoint') !== 'uploader.oneloved.tube')
    formData.append('files',file)

  if ($(progressid).length) {
    $(progressid).progress({ value: 0, total: 1 })
    $(progressid).show();
  } else {
    setTimeout(function() {
      $(progressid).progress({ value: 0, total: 1 })
      $(progressid).show();
    }, 150)
  }

  // Use resumable upload API for OneLoveIPFS service
  if (Session.get('uploadEndpoint') === 'uploader.oneloved.tube') {
    let uplStat = socketio.connect('https://uploader.oneloved.tube/uploadStat')
    uplStat.on('result',(result) => {
      Session.set('addVideoStep', 'addvideoformfileuploaded')
      setTimeout(() => {
        if (result.ipfshash)
          $('input[name="vid.src"]').val(result.ipfshash)
        if (result.spritehash)
          $('input[name="img.spr"]').val(result.spritehash)
        $('input[name="gw"]').val('https://video.oneloveipfs.com')
        cb(null, result)
      }, 200)
    })

    let tusVideoUpload = new tus.Upload(file,{
      endpoint: 'https://tusd.oneloved.tube/files',
      retryDelays: [0,3000,5000,10000,20000],
      parallelUploads: 10,
      metadata: {
        access_token: Session.get('Upload token for uploader.oneloved.tube'),
        keychain: true,
        type: 'videos'
      },
      onError: (e) => {
        $(progressid).hide()
        cb(error)
      },
      onProgress: (bu,bt) => {
        $(progressid).progress({ value: bu, total: bt})
      },
      onSuccess: () => {
        let idurl = tusVideoUpload.url.toString().split('/')
        uplStat.emit('registerid',{
          id: idurl[idurl.length - 1],
          type: 'videos',
          access_token: Session.get('Upload token for uploader.oneloved.tube'),
          keychain: 'true'
        })
      }
    })

    tusVideoUpload.findPreviousUploads().then((p) => {
      if (p.length > 0)
        tusVideoUpload.resumeFromPreviousUpload(p[0])
      tusVideoUpload.start()
    })
    return
  }
  
  // Default BTFS upload clusters
  var credentials = Session.get('upldr') == 'cluster' ? true : false
  let ajaxVideoUpload = {
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
        Template.addvideoprogress.update()
      }, 1000)
      cb(null, result)
    },
    error: function (error) {
      $(progressid).hide()
      cb(error)
    }
  }

  $.ajax(ajaxVideoUpload)
}

Template.upload.uploadImage = function (file, progressid, cb) {
  if (typeof refreshUploadSnapStatus !== 'undefined') clearInterval(refreshUploadSnapStatus)
  $('#uploadSnap').addClass('disabled')
  $('#uploadSnap > i').removeClass('file image red')
  $('#uploadSnap > i').addClass('asterisk loading')
  $('#uploadSnap > i').css('background', 'transparent')
  var postUrl = (Session.get('remoteSettings').localhost == true)
    ? 'http://localhost:5000/uploadImage'
    : 'https://snap1.d.tube/uploadImage'
  var formData = new FormData();
  
  if (Session.get('uploadEndpoint') === 'uploader.oneloved.tube') {
    postUrl = 'https://uploader.oneloved.tube/uploadImage?type=thumbnails&access_token=' + Session.get('Upload token for uploader.oneloved.tube')
    formData.append('image',file)
  } else {
    formData.append('files', file)
  }
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

      if (Session.get('uploadEndpoint') === 'uploader.oneloved.tube') {
        $('input[name="snaphash"]').val(result.imghash)
        Session.set('overlayHash',result.imghash)
        $('#uploadSnap').removeClass('disabled')
        $('#uploadSnap > i').addClass('checkmark green')
        $('#uploadSnap > i').removeClass('asterisk loading')
        $('#uploadSnap > i').css('background', 'white')
        return cb(null,result.imghash)
      }

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
            cb(null, data.ipfsAddSource.hash, data.ipfsAddOverlay.hash)
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

Template.upload.burnRange = function(cb) {
  if (!Session.get('activeUsername')) {
    if (cb) cb()
    return
  }
    
  var balance = Users.findOne({username: Session.get('activeUsername'), network: 'avalon'}).balance
  var step = Math.pow(10, balance.toString().length - 1)/100
  if (step<1) step = 1
  setTimeout(function() {
    $('#burn-range').range({
      min: 0,
      max: 100,
      start: Session.get('publishBurn'),
      onChange: function(val) { 
        Session.set('publishBurn', logSlider(parseInt(val), balance))
      }
    });
    if (cb) cb()
  }, 100)
}

Template.upload.helpers({
  tempContent: function () {
    return Session.get('tempContent')
  },
  searchedLink: function () {
    return Session.get('searchedLink')
  },
  publishBurn: function () {
    return Session.get('publishBurn')
  }
})

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
        $('input[name="snaphash"]').val(result)
        var tempContent = Session.get('tempContent')
        if (tempContent && tempContent != 'file') {
          tempContent.thumbnailUrl = 'https://snap1.d.tube/ipfs/'+result
          Session.set('tempContent', tempContent)
        }
      }
    })
  },
  'submit .form': function (event) {
    event.preventDefault()
  },
  'click #remotelinkbutton': function(event) {
    $('#uploadSeparator').hide()
    $('#dropzone').hide()
    $("#uploadEndpointSelection").parent().hide()
    var url = $('#remotelink').val()
    if (url == Session.get('searchedLink')) return
    Session.set('tempContent', null)
    Session.set('searchedLink', url)
    grabData(url, function(content) {
      Session.set('tempContent', content)
      if (!content || !content.providerName || content.providerName == 'Unknown Provider') {
        setTimeout(function() {
          $(".uploadsubmit").addClass('disabled')
        }, 250)
        toastr.warning('This url is not a valid video')
        return
      }
      $(".uploadsubmit").removeClass('disabled')
      setTimeout(function() {
        if (content.title) $('#uploadTitle').val(content.title)
        if (content.description) $('#uploadDescription').val(content.description)
      }, 250)
      
      Template.upload.burnRange(function() {})
    })
  },
  'click .uploadsubmit': function(event) {
    $(".uploadsubmit").addClass('disabled')
    $(".uploadsubmit > i.checkmark").addClass('dsp-non')
    $(".uploadsubmit > i.fire").addClass('dsp-non')
    $(".uploadsubmit > i.loading").removeClass('dsp-non')
    var tag = ''
    if ($('#tagDropdown').val()) tag = $('#tagDropdown').val().trim().toLowerCase()
    if (tag.indexOf(' ') > -1) {
      toastr.warning('Only a single tag is allowed')
      $(".uploadsubmit").removeClass('disabled')
      $(".uploadsubmit > i.loading").addClass('dsp-non')
      $(".uploadsubmit > i.checkmark").removeClass('dsp-non')
      $(".uploadsubmit > i.fire").removeClass('dsp-non')
      return
    }
    var content = Session.get('tempContent')
    if (content == 'file') {
      content = Template.uploadform.generateVideo()
    } else if (content) {
      content.title = $('#uploadTitle').val()
      content.description = $('#uploadDescription').val()
    }

    if (!content || content == 'file') {
      toastr.error('There is no content to publish')
      return
    }
    
    var burn = parseInt(Session.get('publishBurn'))
    if (burn > 0) {
      broadcast.multi.comment(null, null, null, null, null, null, null, content, tag, burn, function(err, res) {
        console.log(err, res)
        $(".uploadsubmit").removeClass('disabled')
        $(".uploadsubmit > i.loading").addClass('dsp-non')
        $(".uploadsubmit > i.checkmark").removeClass('dsp-non')
        $(".uploadsubmit > i.fire").removeClass('dsp-non')
        if (err) toastr.error(Meteor.blockchainError(err))
        else FlowRouter.go('/v/' + res[0])
      })
    } else {
      broadcast.multi.comment(null, null, null, null, null, null, null, content, tag, null, function(err, res) {
        console.log(err, res)
        $(".uploadsubmit").removeClass('disabled')
        $(".uploadsubmit > i.loading").addClass('dsp-non')
        $(".uploadsubmit > i.checkmark").removeClass('dsp-non')
        $(".uploadsubmit > i.fire").removeClass('dsp-non')
        if (err) toastr.error(Meteor.blockchainError(err))
        else {
          FlowRouter.go('/v/' + res[0])
          
        }
      })
    }
  },
})

var getUploaderStatus = function (upldr) {
  var url = (Session.get('remoteSettings').localhost == true)
    ? 'http://localhost:5000/getStatus'
    : 'https://'+upldr+'.d.tube/getStatus'
  if (Session.get('scot')) {
    var scotUpldr = Session.get('scot').token.toLowerCase()+'.upldr.dtube.top'
    url = url.replace('cluster.d.tube', scotUpldr)
  }
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

function handleUploadEndpointCheckError(req,status) {
  $('#uploadEndpointSelection').dropdown('restore defaults')
  $('#uploadEndpointSelection').parent().removeClass('loading')
  if (req.responseJSON.error === 'Looks like you do not have access to the uploader!') {
    return toastr.error(translate('UPLOAD_ENDPOINT_ERROR_ACCESS_DENIED'), translate('ERROR_TITLE'))
  } else if (req.responseJSON && req.responseJSON.error) {
    return toastr.error(translate('UPLOAD_ENDPOINT_ERROR_AUTH_OTHER' + req.responseJSON.error), translate('ERROR_TITLE'))
  } else {
    return toastr.error(translate('UPLOAD_ENDPOINT_ERROR_AUTH_UNKNOWN' + status, translate('ERROR_TITLE')))
  }
}

function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j]; 1
    array[j] = temp;
  }
}

function grabData(url, cb) {
  var urlInfo = parse(url, true)
  switch (urlInfo.host) {
    case 'www.youtube.com':
    case 'm.youtube.com':
    case 'music.youtube.com':
    case 'youtu.be':
      getYoutubeVideoData(url, function(content) {
        cb(content)
      })
      break;

    case 'www.instagram.com':
    case 'www.dailymotion.com':
    case 'clips.twitch.tv':
    case 'vimeo.com':
      getOEmbedData(url, function(content) {
        cb(content)
      })
      break;

    case 'www.twitch.tv':
    case 'twitch.tv':
      if (urlInfo.pathname.split('/')[2] == 'clip')
        getOEmbedData(url, function(content) {
          cb(content)
        })
      else if (urlInfo.pathname.split('/')[1] == 'videos')
        getOEmbedData(url, function(content) {
          cb(content)
        })
      else
        getOpenGraphData(url, function(content) {
          cb(content)
        })
      break;  

    case 'www.facebook.com':
    default:
      getOpenGraphData(url, function(content) {
        cb(content)
      })
      break;
  }
}

function getOpenGraphData(url, callback) {
  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
      let video = JSON.parse(this.responseText).data;
      callback(sanitizeVideo(video, url));
    }
  }
  xhr.open("GET", 'https://avalon.d.tube/opengraph/'+encodeURIComponent(url));
  //xhr.setRequestHeader("User-Agent", "Mozilla/5.0 (X11; Linux x86_64; rv:42.0) Gecko/20100101 Firefox/42.0")
  xhr.send();
}

function getOEmbedData(url, callback) {
  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
      let video = JSON.parse(this.responseText);
      callback(sanitizeVideo(video, url));
    }
  }
  xhr.open("GET", 'https://avalon.d.tube/oembed/'+encodeURIComponent(url));
  //xhr.setRequestHeader("User-Agent", "Mozilla/5.0 (X11; Linux x86_64; rv:42.0) Gecko/20100101 Firefox/42.0")
  xhr.send();
}

function getYoutubeVideoData(url, callback) {
  var videoId = ''
  if (url.indexOf('v=') == -1)
    videoId = url.split('/')[url.split('/').length-1]
  else {
    videoId = url.split('v=')[1]
    var ampersandPosition = videoId.indexOf('&')
    if(ampersandPosition != -1)
      videoId = videoId.substring(0, ampersandPosition);
  }

  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
      let video = JSON.parse(this.responseText);
      // like gmail
      function decodeHtml(html) {
        var txt = document.createElement("textarea");
        txt.innerHTML = html;
        return txt.value;
      }
      video.description = decodeHtml(video.description)
      video.description = video.description.replace(/<style([\s\S]*?)<\/style>/gi, '');
      video.description = video.description.replace(/<script([\s\S]*?)<\/script>/gi, '');
      video.description = video.description.replace(/<\/div>/ig, '\n');
      video.description = video.description.replace(/<\/li>/ig, '\n');
      video.description = video.description.replace(/<li>/ig, '  *  ');
      video.description = video.description.replace(/<\/ul>/ig, '\n');
      video.description = video.description.replace(/<\/p>/ig, '\n');
      video.description = video.description.replace(/<br\s*[\/]?>/gi, "\n");
      video.description = video.description.replace(/<[^>]+>/ig, '');
      callback(sanitizeVideo(video, url));
    }
  }
  xhr.open("GET", 'https://avalon.d.tube/youtube/'+videoId);
  //xhr.setRequestHeader("User-Agent", "Mozilla/5.0 (X11; Linux x86_64; rv:42.0) Gecko/20100101 Firefox/42.0")
  xhr.send();
}

function parseVideoInfo (body, videoId) {
  function extractValue ($, attribute) {
    if ($ && $.length) {
      return $.attr(attribute) || undefined
    }
    return undefined
  }
  
  function parseDuration (raw) {
    var m = /^[a-z]*(?:(\d+)M)?(\d+)S$/i.exec(raw)
    if (!m) return
  
    var minutes = m[1] ? parseInt(m[1], 10) : 0
    var seconds = m[2] ? parseInt(m[2], 10) : 0
    return minutes * 60 + seconds
  }
  
  function parseVotes (raw) {
    var rawCleaned = raw.split(',').join('')
    return parseInt(rawCleaned, 10)
  }

  var $ = cheerio.load(body)

  var url = extractValue($('.watch-main-col link[itemprop="url"]'), 'href')
  var title = extractValue(
    $('.watch-main-col meta[itemprop="name"]'),
    'content'
  )
  var descriptionHtml = $('.watch-main-col #eow-description').html()
  descriptionHtml = descriptionHtml.replace(/\<br\\?>/g, "\n")
  var description = jQuery("<div>"+descriptionHtml+"</div>").text();
  var owner = $('.yt-user-info > a').text()
  var channelId = extractValue(
    $('.watch-main-col meta[itemprop="channelId"]'),
    'content'
  )
  var thumbnailUrl = extractValue(
    $('.watch-main-col link[itemprop="thumbnailUrl"]'),
    'href'
  )
  var embedURL = extractValue(
    $('.watch-main-col link[itemprop="embedURL"]'),
    'href'
  )
  var datePublished = extractValue(
    $('.watch-main-col meta[itemprop="datePublished"]'),
    'content'
  )
  var genre = extractValue(
    $('.watch-main-col meta[itemprop="genre"]'),
    'content'
  )

  var paid = extractValue(
    $('.watch-main-col meta[itemprop="paid"]'),
    'content'
  )
  paid = paid ? paid === 'True' : undefined

  var unlisted = extractValue(
    $('.watch-main-col meta[itemprop="unlisted"]'),
    'content'
  )
  unlisted = unlisted ? unlisted === 'True' : undefined

  var isFamilyFriendly = extractValue(
    $('.watch-main-col meta[itemprop="isFamilyFriendly"]'),
    'content'
  )
  isFamilyFriendly = isFamilyFriendly && isFamilyFriendly === 'True'

  var duration = extractValue(
    $('.watch-main-col meta[itemprop="duration"]'),
    'content'
  )
  duration = duration ? parseDuration(duration) : undefined

  var regionsAllowed = extractValue(
    $('.watch-main-col meta[itemprop="regionsAllowed"]'),
    'content'
  )
  regionsAllowed = regionsAllowed ? regionsAllowed.split(',') : undefined

  var views = extractValue(
    $('.watch-main-col meta[itemprop="interactionCount"]'),
    'content'
  )
  views = views ? parseInt(views, 10) : undefined

  var dislikeCount = $(
    '.like-button-renderer-dislike-button-unclicked span'
  ).text()
  dislikeCount = dislikeCount ? parseVotes(dislikeCount) : undefined

  var likeCount = $('.like-button-renderer-like-button-unclicked span').text()
  likeCount = likeCount ? parseVotes(likeCount) : undefined

  var channelThumbnailUrl =  $('.yt-user-photo .yt-thumb-clip img').data('thumb')

  return {
    videoId: videoId,
    url: url,
    title: title,
    description: description,
    owner: owner,
    channelId: channelId,
    thumbnailUrl: thumbnailUrl,
    // embedURL: embedURL,
    datePublished: datePublished,
    genre: genre,
    // paid: paid,
    // unlisted: unlisted,
    isFamilyFriendly: isFamilyFriendly,
    duration: duration,
    // views: views,
    regionsAllowed: regionsAllowed,
    // dislikeCount: dislikeCount,
    // likeCount: likeCount,
    channelThumbnailUrl: channelThumbnailUrl
  }
}

function sanitizeVideo(video, url) {
  console.log(video)
  var newVid = {
    videoId: video.videoId || video.video_id,
    url: video.url || video.ogUrl,
    title: video.title || video.ogTitle,
    description: video.description || video.ogDescription,
    owner: video.owner || video.curator_name || video.author_name,
    ownerUrl: video.owner_url || video.author_url,
    channelId: video.channelId,
    thumbnailUrl: video.thumbnailUrl || video.thumbnail_url,
    thumbnailWidth: video.thumbnail_width || video.width,
    thumbnailHeight: video.thumbnail_height || video.height,
    datePublished: video.datePublished || video.upload_date,
    genre: video.genre,
    game: video.game,
    isFamilyFriendly: video.isFamilyFriendly,
    duration: video.duration || video.video_length,
    channelThumbnailUrl: video.channelThumbnailUrl,
    providerName: video.provider_name,
    providerUrl: video.provider_url,
    twitch_type: video.twitch_type
  }
  if (video.ogImage) {
    newVid.thumbnailUrl = video.ogImage.url
    newVid.thumbnailWidth = video.ogImage.width
    newVid.thumbnailHeight = video.ogImage.height
  }
  if (video.twitterImage && video.twitterImage.url && !newVid.thumbnailUrl)
    newVid.thumbnailUrl = video.twitterImage.url
  for (var f in newVid) { 
    if (newVid[f] === null || newVid[f] === undefined) {
      delete newVid[f];
    }
  }
  if (!newVid.url) newVid.url = url
  if (!newVid.videoId) newVid.videoId = videoIdFromUrl(newVid, url)
  if (!newVid.providerName) newVid.providerName = providerNameFromUrl(url)
  newVid.app = Meteor.settings.public.app || 'dtube'
  return newVid
}

function videoIdFromUrl(video, url) {
  var urlInfo = parse(url, true)
  switch (urlInfo.host) {
    case "www.twitch.tv":
    case "clips.twitch.tv":
    case "twitch.tv":
      if (video.twitch_type == 'clip')
        return urlInfo.pathname.split('/')[3]
      else if (urlInfo.pathname.split('/')[2] == 'clip')
        return urlInfo.pathname.split('/')[3]
      else if (urlInfo.pathname.split('/')[1] == 'videos')
        return urlInfo.pathname.split('/')[2]
      else
        return urlInfo.pathname.split('/')[1]
      break;

    case "www.dailymotion.com":
      return urlInfo.pathname.replace('/video/', '')
      break;

    case "www.instagram.com":
      return urlInfo.pathname.replace('/p/', '').replace('/', '')
      break;

    case "www.facebook.com":
      // https://www.facebook.com/zap.magazine/videos/278373702868688/
      // https://www.facebook.com/watch/?v=1371488622995266
      return urlInfo.query.v || urlInfo.pathname.split('/')[3]
      break;

    case "www.liveleak.com":
      return urlInfo.query.t
      break;
  
    default:
      break;
  }
  console.log(urlInfo)
}

function providerNameFromUrl(url) {
  var urlInfo = parse(url, true)
  switch (urlInfo.host) {
    case "www.liveleak.com":
      return 'LiveLeak'
      break;

    case "www.facebook.com":
      return 'Facebook'
      break;

    case "www.youtube.com":
    case 'm.youtube.com':
    case 'music.youtube.com':
    case 'youtu.be':
      return 'YouTube'
      break;

    case "www.twitch.tv":
    case "clips.twitch.tv":
    case "twitch.tv":
      return 'Twitch'
      break;
  
    default:
      return 'Unknown Provider'
      break;
  }
}

function logSlider(position, maxburn) {
  if (position == 0) return 0
  // position will be between 1 and 100
  var minp = 0;
  var maxp = 100;

  // The result should be between 1 and maxburn
  var minv = Math.log(1);
  var maxv = Math.log(maxburn);

  // calculate adjustment factor
  var scale = (maxv-minv) / (maxp-minp);

  return Math.round(Math.exp(minv + scale*(position-minp)))
}