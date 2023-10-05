const tus = require('tus-js-client')
const socketio = require('socket.io-client')
refreshUploadStatus = null

Template.addvideo.rendered = function () {
    if (!Session.get('activeUsername') && !Session.get('activeUsernameSteem') && !Session.get('activeUsernameHive')  && !Session.get('activeUsernameBlurt')) {
        FlowRouter.go('/login')
        return
    }
    Template.settingsdropdown.nightMode()
    if (!Session.get('addVideoStep'))
        Session.set('addVideoStep', 'addvideoform')
    if (!Session.get('tmpVideo'))
        if (!UserSettings.get('tmpVideo'))
            Session.set('tmpVideo', {})
        else {
            Session.set('tmpVideo', UserSettings.get('tmpVideo'))
            if (Object.keys(Session.get('tmpVideo')).length == 0)
                Session.set('addVideoStep', 'addvideoform')
            else
                Session.set('addVideoStep', 'addvideopublish')
        }
}

Template.addvideo.tmpVid = function(data) {
    var tmpVideo = Session.get('tmpVideo')
    if (!tmpVideo.json) tmpVideo.json = {files: {}}
    Object.assign(tmpVideo.json, data)
    Session.set('tmpVideo', tmpVideo)
    UserSettings.set('tmpVideo', tmpVideo)
}

Template.addvideo.addFiles = function(tech, files) {
    var tmpVideo = Session.get('tmpVideo')
    if (!tmpVideo.json) tmpVideo.json = {files: {}}
    tmpVideo.json.files[tech] = files
    Session.set('tmpVideo', tmpVideo)
    UserSettings.set('tmpVideo', tmpVideo)
}

Template.addvideo.helpers({
    addVideoStep: function () {
      return Session.get('addVideoStep')
    }
})

Template.addvideoform.helpers({
    existsFiles: function() {
        var tmpVideo = Session.get('tmpVideo')
        if (!tmpVideo || !tmpVideo.json || !tmpVideo.json.files) return false
        if (Object.keys(tmpVideo.json.files).length > 0) return true
        return false
    }
})

Template.addvideoformfile.events({
    'click #dropzone': function (event) {
        $('#fileToUpload').click()
    },
    'change #fileToUpload': function (event) {
        Template.addvideoformfile.inputVideo(event.target)
    },
    'dropped #dropzone': function (event) {
        Template.addvideoformfile.inputVideo(event.originalEvent.dataTransfer)
    }
})

Template.addvideoformfile.inputVideo = function(dt) {
    if (!dt.files || dt.files.length == 0) {
        toastr.error(translate('UPLOAD_ERROR_UPLOAD_FILE'), translate('ERROR_TITLE'))
        return
    }
    var file = dt.files[0]
    if (file.type.split('/')[0] != 'video') {
        toastr.error(translate('UPLOAD_ERROR_WRONG_FORMAT'), translate('ERROR_TITLE'))
        return
    }

    Session.set('addVideoStep', 'addvideoformfileuploading')

    // checking best ipfs-uploader endpoint available
    Template.addvideoformfile.setBestUploadEndpoint(function () {
      // uploading to ipfs
      Template.addvideoformfile.uploadVideo(file, '#progressvideo', function (err, result) {
        if (err) {
          console.log(err)
          toastr.error(err, translate('UPLOAD_ERROR_IPFS_UPLOADING'))
          return
        } else {
          console.log('Uploaded video', result);
          if (result.skylink && Session.get('uploadEndpoint') === 'uploader.oneloveipfs.com')
              Template.addvideo.addFiles('sia',{ vid: { src: result.skylink }})
        }
      })
    });
}

Template.addvideoformfile.setBestUploadEndpoint = function (cb) {
    if (Session.get('uploadEndpoint') === 'uploader.oneloveipfs.com') return cb()
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

  Template.addvideoformfile.uploadVideo = function (file, progressid, cb) {
    var postUrl = (Session.get('remoteSettings').localhost == true)
      ? 'http://localhost:5000/uploadVideo?videoEncodingFormats=240p,480p,720p,1080p&sprite=true'
      : 'https://'+Session.get('upldr')+'.d.tube/uploadVideo?videoEncodingFormats=240p,480p,720p,1080p&sprite=true'
    let formData = new FormData()

    if (Session.get('uploadEndpoint') !== 'uploader.oneloveipfs.com')
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
    if (Session.get('uploadEndpoint') === 'uploader.oneloveipfs.com') {
      let uplStat = socketio.connect('https://uploader.oneloveipfs.com/uploadStat')
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
        endpoint: 'https://tusd.oneloveipfs.com/files',
        retryDelays: [0,3000,5000,10000,20000],
        parallelUploads: (/iPad|iPhone|iPod/.test(navigator.userAgent || navigator.vendor || window.opera) && !window.MSStream) ? 1 : 10,
        headers: {
          'Authorization': 'Bearer '+window.btoa(JSON.stringify({keychain: true})).replace(/={1,2}$/, '')+'.'+Session.get('Upload token for uploader.oneloveipfs.com'),
        },
        metadata: {
          type: 'videos',
          createSprite: 'true'
        },
        onError: (e) => {
          $(progressid).hide()
          cb(e)
        },
        onProgress: (bu,bt) => {
          $(progressid).progress({ value: bu, total: bt})
        },
        onSuccess: () => {
          let idurl = tusVideoUpload.url.toString().split('/')
          uplStat.emit('registerid',{
            id: idurl[idurl.length - 1],
            type: 'videos',
            access_token: Session.get('Upload token for uploader.oneloveipfs.com'),
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

Template.addvideoform.events({
    'click .button.uploadtype': function (event) {
        var type = event.target.dataset.uploadtype
        console.log(event.target)
        Session.set('addVideoStep', 'addvideoform'+type)
    },

    // 'click #addvideonext': function () {
    //     var options = $('input[type=radio]')
    //     var checked = null
    //     for (let i = 0; i < options.length; i++)
    //         if (options[i].checked)
    //             checked = options[i].value
    //     if (checked)
    //         Session.set('addVideoStep', 'addvideoform'+checked)

    // },
    'click #addvideoback': function() {
        Session.set('addVideoStep', 'addvideopublish')
    }
})

Template.addvideoformp2p.events({
    'click .button.uploadp2p': function (event) {
        var type = event.target.dataset.uploadtype
        if (type)
            Session.set('addVideoStep', 'addvideoformp2p'+type)
        if (type == 'btfs' || type == 'ipfs')
            setTimeout(function() {
                $('#gwoinfo').popup({
                    inline: true,
                    content: translate('DEFAULT_GATEWAY_OVERWRITE_INFO')
                })
            }, 200)
    },
    'click #addvideonext': function () {
        var options = $('input[type=radio]')
        var checked = null
        for (let i = 0; i < options.length; i++)
            if (options[i].checked)
                checked = options[i].value
        if (checked)
            Session.set('addVideoStep', 'addvideoformp2p'+checked)
        if (checked == 'btfs' || checked == 'ipfs')
            setTimeout(function() {
                $('#gwoinfo').popup({
                    inline: true,
                    content: translate('DEFAULT_GATEWAY_OVERWRITE_INFO')
                })
            }, 200)
    }
})

Template.addvideoformp2pbtfs.rendered = function() {
    var tmpVideo = Session.get('tmpVideo')
    if (!tmpVideo.json || !tmpVideo.json.files || !tmpVideo.json.files.btfs)
        return
    var files = tmpVideo.json.files.btfs
    if (files.vid && files.vid["src"])
        $('input[name="vid.src"]')[0].value = files.vid["src"]
    if (files.vid && files.vid["240"])
        $('input[name="vid.240"]')[0].value = files.vid["240"]
    if (files.vid && files.vid["480"])
        $('input[name="vid.480"]')[0].value = files.vid["480"]
    if (files.vid && files.vid["720"])
        $('input[name="vid.720"]')[0].value = files.vid["720"]
    if (files.vid && files.vid["1080"])
        $('input[name="vid.1080"]')[0].value = files.vid["1080"]
    if (files.img && files.img["spr"])
        $('input[name="img.spr"]')[0].value = files.img["spr"]
    if (files.gw)
        $('input[name="gw"]')[0].value = files.gw
}
Template.addvideoformp2pipfs.rendered = function() {
    var tmpVideo = Session.get('tmpVideo')
    if (!tmpVideo.json || !tmpVideo.json.files || !tmpVideo.json.files.ipfs)
        return
    var files = tmpVideo.json.files.ipfs
    if (files.vid && files.vid["src"])
        $('input[name="vid.src"]')[0].value = files.vid["src"]
    if (files.vid && files.vid["240"])
        $('input[name="vid.240"]')[0].value = files.vid["240"]
    if (files.vid && files.vid["480"])
        $('input[name="vid.480"]')[0].value = files.vid["480"]
    if (files.vid && files.vid["720"])
        $('input[name="vid.720"]')[0].value = files.vid["720"]
    if (files.vid && files.vid["1080"])
        $('input[name="vid.1080"]')[0].value = files.vid["1080"]
    if (files.img && files.img["spr"])
        $('input[name="img.spr"]')[0].value = files.img["spr"]
    if (files.gw)
        $('input[name="gw"]')[0].value = files.gw
}
Template.addvideoformp2psia.rendered = function() {
    var tmpVideo = Session.get('tmpVideo')
    if (!tmpVideo.json || !tmpVideo.json.files || !tmpVideo.json.files.sia)
        return
    var files = tmpVideo.json.files.sia
    if (files.vid && files.vid["src"])
        $('input[name="vid.src"]')[0].value = files.vid["src"]
    if (files.vid && files.vid["240"])
        $('input[name="vid.240"]')[0].value = files.vid["240"]
    if (files.vid && files.vid["480"])
        $('input[name="vid.480"]')[0].value = files.vid["480"]
    if (files.vid && files.vid["720"])
        $('input[name="vid.720"]')[0].value = files.vid["720"]
    if (files.vid && files.vid["1080"])
        $('input[name="vid.1080"]')[0].value = files.vid["1080"]
    if (files.img && files.img["spr"])
        $('input[name="img.spr"]')[0].value = files.img["spr"]
    if (files.gw)
        $('input[name="gw"]')[0].value = files.gw
}

Template.addvideoformp2pbtfs.events({
    'click #addvideofinish': function () {
        var files = Template.addvideohashes.fillHashes()
        if (files) {
            Template.addvideo.addFiles('btfs', files)
            Session.set('addVideoStep', 'addvideopublish')
        }

    }
})
Template.addvideoformp2pipfs.events({
    'click #addvideofinish': function () {
        var files = Template.addvideohashes.fillHashes()
        if (files) {
            Template.addvideo.addFiles('ipfs', files)
            Session.set('addVideoStep', 'addvideopublish')
        }
    }
})
Template.addvideoformp2psia.events({
    'click #addvideofinish': function () {
        var files = Template.addvideohashes.fillHashes()
        if (files) {
            Template.addvideo.addFiles('sia', files)
            Session.set('addVideoStep', 'addvideopublish')
        }
    }
})
Template.addvideoformfileuploaded.events({
    'click #addvideofinish': function () {
        var files = Template.addvideohashes.fillHashes()
        if (files) {
            Template.addvideo.addFiles('ipfs', files)
            Session.set('addVideoStep', 'addvideopublish')
        }
    }
})

Template.addvideoformp2p.events({
    'click #addvideoback': function () {
        Session.set('addVideoStep', 'addvideoform')
    }
})
Template.addvideoformp2pbtfs.events({
    'click #addvideoback': function () {
        Session.set('addVideoStep', 'addvideoformp2p')
    }
})
Template.addvideoformp2pipfs.events({
    'click #addvideoback': function () {
        Session.set('addVideoStep', 'addvideoformp2p')
    }
})
Template.addvideoformp2psia.events({
    'click #addvideoback': function () {
        Session.set('addVideoStep', 'addvideoformp2p')
    }
})
Template.addvideoformp2ptorrent.events({
    'click #addvideoback': function () {
        Session.set('addVideoStep', 'addvideoformp2p')
    }
})

Template.addvideoformfile.events({
    'click #addvideoback': function () {
        Session.set('addVideoStep', 'addvideoform')
    }
})

Template.addvideoformfile.rendered = function() {
    $('#uploadEndpointSelection').dropdown({
        action: 'activate',
        onChange: (value,text) => {
          $('#uploadEndpointSelection').parent().children('.icon').removeClass('check').addClass('dropdown')
          // If uploader.oneloveipfs.com endpoint selected, check if user is in uploader whitelist
          if (value === 'uploader.oneloveipfs.com') {
            if (!Session.get('activeUsernameHive') && !Session.get('activeUsername')) {
              $('#uploadEndpointSelection').dropdown('restore defaults')
              return toastr.error(translate('UPLOAD_ENDPOINT_ERROR_NO_USERNAME'), translate('ERROR_TITLE'))
            }
            $('#uploadEndpointSelection').parent().addClass('loading')
            let net = Session.get('activeUsernameHive') ? 'hive' : 'dtc'
            $.ajax({
              url: 'https://' + value + '/login?user=' + (Session.get('activeUsernameHive') || Session.get('activeUsername')) + '&needscredits=true&network=' + net,
              method: 'GET',
              success: (result) => {
                if (net == 'hive')
                  broadcast.hive.decrypt_memo(result.encrypted_memo,(err,decryptedMemo) => uploadEndpointAuthCb(err,value,decryptedMemo))
                else
                  broadcast.avalon.decrypt_memo(result.encrypted_memo,(err,decryptedMemo) => uploadEndpointAuthCb(err,value,decryptedMemo))
              },
              error: (req,status) => handleUploadEndpointCheckError(req,status)
            })
          } else {
            Session.set('uploadEndpoint',null)
          }
        }
    })
}

function uploadEndpointAuthCb(err,endpoint,decryptedMemo) {
  if (err)
    return handleUploadEndpointCheckError(null,null,err)
  $.ajax({
    url: 'https://' + endpoint + '/logincb',
    method: 'POST',
    contentType: 'text/plain',
    data: decryptedMemo,
    success: (result) => {
      Session.set('uploadEndpoint',endpoint)
      Session.set('Upload token for ' + endpoint,result.access_token)
      console.log(result.access_token)
      $('#uploadEndpointSelection').parent().removeClass('loading')
      $('#uploadEndpointSelection').parent().children('.icon').removeClass('dropdown').addClass('check')
    },
    error: (req,status) => handleUploadEndpointCheckError(req,status)
  })
}

function handleUploadEndpointCheckError(req,status,mainerror) {
    $('#uploadEndpointSelection').dropdown('restore defaults')
    $('#uploadEndpointSelection').parent().removeClass('loading')
    if (mainerror)
      return toastr.error(mainerror, translate('ERROR_TITLE'))

    if (req.status === 403) {
      return toastr.error(translate('UPLOAD_ENDPOINT_ERROR_ACCESS_DENIED'), translate('ERROR_TITLE'))
    } else if (req.status === 402 && req.responseJSON && req.responseJSON.needs) {
      return toastr.error(translate('UPLOAD_ENDPOINT_ERROR_INSUFFICIENT_CREDITS',req.responseJSON.needs), translate('ERROR_TITLE'))
    } else if (req.responseJSON && req.responseJSON.error) {
      return toastr.error(translate('UPLOAD_ENDPOINT_ERROR_AUTH_OTHER') + req.responseJSON.error, translate('ERROR_TITLE'))
    } else {
      return toastr.error(translate('UPLOAD_ENDPOINT_ERROR_AUTH_UNKNOWN', req.status), translate('ERROR_TITLE'))
    }
}

function getUploaderStatus (upldr) {
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
}

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j]; 1
      array[j] = temp;
    }
}