Template.upload.rendered = function() {
  Session.set('bitrate', 0)
}

Template.upload.createPermlink = function(length) {
  var text = "";
  var possible = "abcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

Template.upload.HTTP = function(node, file, progressid, cb) {
  //var postUrl = 'http://localhost:5000/uploadVideo'
  var postUrl = node.protocol+'://'+node.host+':'+node.port+'/api/v0/add?stream-channels=true'
  var formData = new FormData();
  formData.append('files', file);
  $(progressid).progress({value: 0, total: 1})
  $(progressid).show();
  $.ajax({
    url: postUrl,
    type: "POST",
    data: formData,
    xhr: function() {
      var xhr = new window.XMLHttpRequest();
      xhr.upload.addEventListener("progress", function(evt) {
        if (evt.lengthComputable) {
          $(progressid).progress({ value: evt.loaded, total: evt.total });
          if (evt.loaded == evt.total) {
            $(progressid).progress({ value: evt.loaded, total: evt.total });
            $('#progressvideo > .label').html('File received. Adding to IPFS Datastore...')
          }
        }
      }, false);
      return xhr;
    },
    cache: false,
    contentType: false,
    processData: false,
    success: function(result) {
      $(progressid).hide()
      cb(null, result)
    },
    error: function(error) {
      $(progressid).hide()
      cb(error)
    }
  });
}

Template.upload.IPFS = function(node, file, cb) {
  console.log(node,file)
  var reader = new window.FileReader()
  reader.onload = function(event) {
    var ipfsCon = IpfsApi(node)
    ipfsCon.add(new ipfsCon.Buffer(event.target.result), function(err, res) {
      cb(err, res)
    })
  }
  reader.readAsArrayBuffer(file);
}

Template.upload.uploadVideo = function(dt) {
  if (!dt.files || dt.files.length == 0) {
    toastr.error(translate('UPLOAD_ERROR_UPLOAD_FILE'), translate('ERROR_TITLE'))
    return
  }
  var file = dt.files[0]
  if (file.type.split('/')[0] != 'video') {
    toastr.error(translate('UPLOAD_ERROR_WRONG_FORMAT'), translate('ERROR_TITLE'))
    return
  }

  $('#step1load').show()

  $('#dropzone').hide()
  $('input[name="title"]').val(file.name.substring(0, file.name.lastIndexOf(".")))

  // displaying the preview
  var videoNode = document.querySelector('video')
  var fileURL = URL.createObjectURL(file)
  videoNode.src = fileURL

  // uploading to ipfs
  node = Session.get('ipfsUpload')
  Template.upload.HTTP(node, file, '#progressvideo', function(err, result) {
    $('#step1load').hide()
    if (err) {
      console.log(err)
      toastr.error(err, translate('UPLOAD_ERROR_IPFS_UPLOADING'))
      return
    } else {
      $('#step1load').parent().addClass('completed')
      console.log('Uploaded video', result);
      $('input[name="videohash"]').val(result.Hash)
    }
  })

  console.log(file)
  $('input[name="filesize"]').val(file.size)
  Torrent.seed(file, function(torrent) {
    $('input[name="magnet"]').val(torrent.magnetURI)
  })
}

Template.upload.genBody = function(author, permlink, title, snaphash, videohash, description) {
  var body = '<center>'
  body += '<a href=\'https://d.tube/#!/v/'+author+'/'+permlink+'\'>'
  body += '<img src=\''+Meteor.getIpfsSrc(snaphash)+'\'></a></center><hr>'
  body += description
  body += '<hr>'
  body += '<a href=\'https://d.tube/#!/v/'+author+'/'+permlink+'\'▶️ '+translate('UPLOAD_WATCH_ON_DTUBE')+' DTube</a><br />'
  body += '<a href=\''+Meteor.getIpfsSrc(videohash)+'\'▶️ '+translate('UPLOAD_WATCH_SOURCE_IPFS')+'</a>'
  return body
}

Template.upload.helpers({
  mainUser: function() {
    return Users.findOne({username: Session.get('activeUsername')})
  },
  bitrate: function() {
    return Session.get('bitrate')
  }
})

Template.upload.events({
  'click #dropzone': function(event) {
    $('#fileToUpload').click()
  },
  'change #fileToUpload': function(event) {
    Template.upload.uploadVideo(event.target)
  },
  'dropped #dropzone': function(event) {
    Template.upload.uploadVideo(event.originalEvent.dataTransfer)
  },
  'click #snap': function(event) {
  	var video = document.querySelector('video')
  	var canvas = document.querySelector('canvas')
  	var context = canvas.getContext('2d')
  	var w,h,ratio

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
  'change #snapFile': function(event) {
    var file = event.currentTarget.files[0];
    var ValidImageTypes = ["image/gif", "image/jpeg", "image/png"];
    if (file.type.split('/')[0] != 'image') {
      toastr.error(translate('UPLOAD_ERROR_NOT_IMAGE'), translate('ERROR_TITLE'))
      return
    }
    if (file.size > Session.get('remoteSettings').snapMaxFileSizeKB*1000) {
      toastr.error(translate('UPLOAD_ERROR_REACH_MAX_SIZE')+' '+Session.get('remoteSettings').snapMaxFileSizeKB+' KB', translate('ERROR_TITLE'))
      return
    }

    $('#step2load').show()

    // uploading to ipfs
    if (Session.get('ipfsUpload')) node = Session.get('ipfsUpload')
    Template.upload.HTTP(node, file, '#progresssnap', function(err, result) {
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
  },
  'submit .form': function(event) {
    event.preventDefault()
    var tags = ['dtube']
    for (var i = 0; i < event.target.tags.value.split(' ').length; i++) {
      if (i > 3) break
      if (event.target.tags.value.split(' ')[i].toLowerCase() == 'nsfw') tags.push('nsfw')
      tags.push('dtube-'+event.target.tags.value.split(' ')[i])
    }
    tags = tags.slice(0,5)
    var article = {
      info: {
        title: event.target.title.value,
        snaphash: event.target.snaphash.value,
        author: Users.findOne({username: Session.get('activeUsername')}).username,
        permlink: Template.upload.createPermlink(8),
        duration: document.querySelector('video').duration,
        filesize: event.target.filesize.value
      },
      content: {
        videohash: event.target.videohash.value,
        magnet: event.target.magnet.value,
        description: event.target.description.value,
        tags: tags
      }
    }
    if (!article.info.title) {
      toastr.error(translate('UPLOAD_ERROR_TITLE_REQUIRED'), translate('ERROR_TITLE'))
      return
    }
    if (!article.info.snaphash) {
      toastr.error(translate('UPLOAD_ERROR_UPLOAD_SNAP_FILE'), translate('ERROR_TITLE'))
      return
    }
    if (!article.info.author) {
      toastr.error(translate('UPLOAD_ERROR_LOGIN_BEFORE_UPLOADING'), translate('ERROR_TITLE'))
      return
    }
    if (!article.content.videohash) {
      toastr.error(translate('UPLOAD_ERROR_UPLOAD_VIDEO_BEFORE_SUBMITTING'), translate('ERROR_TITLE'))
      return
    }
    $('#step3load').show()
    Waka.api.Set(article, {}, function(e,r) {
      Videos.refreshWaka()
      // publish on blockchain !!
      var wif = Users.findOne({username: Session.get('activeUsername')}).privatekey
      var author = r.article.info.author
      var permlink = r.article.info.permlink
      var title = r.article.info.title
      var body = Template.upload.genBody(author, permlink, title, r.article.info.snaphash, r.article.content.videohash, r.article.content.description)
      var jsonMetadata = {
        video: r.article,
        tags: article.content.tags,
        app: Meteor.settings.public.app
      }

      var operations = [
        ['comment',
          {
            parent_author: '',
            parent_permlink: tags[0],
            author: author,
            permlink: permlink,
            title: title,
            body: body,
            json_metadata : JSON.stringify(jsonMetadata)
          }
        ],
        ['comment_options', {
          author: author,
          permlink: permlink,
          max_accepted_payout: '1000000.000 SBD',
          percent_steem_dollars: 10000,
          allow_votes: true,
          allow_curation_rewards: true,
          extensions: [
            [0, {
              beneficiaries: [{
                account: Meteor.settings.public.beneficiary,
                weight: Session.get('remoteSettings').dfees
              }]
            }]
          ]
        }]
      ];
      $('#step3load').show()
      console.log(operations)
      steem.broadcast.send(
        { operations: operations, extensions: [] },
        { posting: wif },
        function(e, r) {
          $('#step3load').hide()
          if (e) {
            if (e.payload) toastr.error(e.payload.error.data.stack[0].format, translate('ERROR_TITLE'))
            else toastr.error(translate('UPLOAD_ERROR_SUBMIT_BLOCKCHAIN'), translate('ERROR_TITLE'))
          } else {
            window.open('/#!/v/'+author+'/'+permlink, '_blank');
            FlowRouter.go('/torrentStats')
          }
        }
      )
    })
  }
})
