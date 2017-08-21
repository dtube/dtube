Template.upload.createPermlink = function(length) {
  var text = "";
  var possible = "abcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

Template.upload.IPFS = function(node, buffer, cb) {
  // native ipfs way
  // var filePair = {
  //   path: file.name,
  //   content: new ipfs.types.Buffer(buffer)
  // }
  // ipfs.files.add([filePair], function(err, res) {
  //   console.log('Succesfully added file', res)
  // })

  // through an existing node
  var ipfsCon = IpfsApi(node)
  ipfsCon.add(new ipfsCon.Buffer(buffer), function(err, res) {
    cb(err, res)
  })
}

Template.upload.uploadVideo = function(dt) {
  if (!dt.files || dt.files.length == 0) {
    toastr.error('Please select a file for upload', 'Error')
    return
  }
  var file = dt.files[0]

  if (file.type.split('/')[0] != 'video') {
    toastr.error('The file you are trying to upload is not a video', 'Error')
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
  var reader = new window.FileReader()
  reader.onload = function(event) {
    var node = Meteor.settings.public.remote.uploadNodes[0]
    if (Session.get('ipfsUpload')) node = Session.get('ipfsUpload')
    Template.upload.IPFS(node, event.target.result, function(e, r) {
      $('#step1load').hide()
      if (e) {
        toastr.error(e, 'IPFS Error while uploading')
        return
      } else {
        $('#step1load').parent().addClass('completed')
        console.log('Uploaded video', r);
        $('input[name="videohash"]').val(r[0].hash)
      }
    })
  }
  reader.readAsArrayBuffer(file);
}

Template.upload.genBody = function(author, permlink, title, snaphash, videohash, description) {
  var body = '<center>'
  body += '<a href=\'https://dtube.video/v/'+author+'/'+permlink+'\'>'
  body += '<img src=\'https://ipfs.io/ipfs/'+snaphash+'\'>'
  body += '<h2>Watch '+title+' video on DTube</h2></a></center><hr>'
  body += description
  return body
}

Template.upload.helpers({
  mainUser: function() {
    return Users.findOne({username: Session.get('activeUsername')})
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
    // var dt = event.originalEvent.dataTransfer
    // var file = dt.files[0]
    //
    // if (file.type.split('/')[0] != 'video') {
    //   toastr.error('The file you are trying to upload is not a video', 'Error')
    //   return
    // }
    //
    // $('#dropzone').hide()
    // $('input[name="title"]').val(file.name)
    //
    // // displaying the preview
    // var videoNode = document.querySelector('video')
    // var fileURL = URL.createObjectURL(file)
    // videoNode.src = fileURL
    //
    // // uploading to ipfs
    // var reader = new window.FileReader()
    // reader.onload = function(event) {
    //   var node = Meteor.settings.public.remote.uploadNodes[0]
    //   if (Session.get('ipfsUpload')) node = Session.get('ipfsUpload')
    //   Template.upload.IPFS(node, event.target.result, function(e, r) {
    //     if (e) console.log(e)
    //     console.log('Uploaded video', r);
    //     $('input[name="videohash"]').val(r[0].hash)
    //   })
    // }
    // reader.readAsArrayBuffer(file);
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
      toastr.error('The file you are trying to upload is not an image', 'Error')
      return
    }

    $('#step2load').show()

    var reader = new FileReader();
    reader.onload = function(event) {
      var node = Meteor.settings.public.remote.uploadNodes[0]
      if (Session.get('ipfsUpload')) node = Session.get('ipfsUpload')
      Template.upload.IPFS(node, event.target.result, function(e, r) {
        $('#step2load').hide()
        if (e) {
          console.log(e)
          toastr.error(e, 'IPFS Error while uploading')
          return
        } else {
          $('#step2load').parent().addClass('completed')
          console.log('Uploaded Snap', r)
          $('input[name="snaphash"]').val(r[0].hash)
        }
      })
    };
    reader.readAsArrayBuffer(file);
  },
  'submit .form': function(event) {
    event.preventDefault()
    var tags = ['dtube']
    for (var i = 0; i < event.target.tags.value.split(' ').length; i++) {
      if (i > 3) break
      if (event.target.tags.value.split(' ')[i] == 'nsfw') tags.push('nsfw')
      tags.push('dtube-'+event.target.tags.value.split(' ')[i])
    }
    tags = tags.slice(0,5)
    var article = {
      info: {
        title: event.target.title.value,
        snaphash: event.target.snaphash.value,
        author: Users.findOne({username: Session.get('activeUsername')}).username,
        permlink: Template.upload.createPermlink(8)
      },
      content: {
        videohash: event.target.videohash.value,
        description: event.target.description.value,
        tags: tags
      }
    }
    if (!article.info.title) {
      toastr.error('Title is required', 'Error')
      return
    }
    if (!article.info.snaphash) {
      toastr.error('Please upload a snap picture', 'Error')
      return
    }
    if (!article.info.author) {
      toastr.error('Please login before uploading', 'Error')
      return
    }
    if (!article.content.videohash) {
      toastr.error('Please upload a video before submitting', 'Error')
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
                weight: Meteor.settings.public.remote.dfees
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
            if (e.payload) toastr.error(e.payload.error.data.stack[0].format, 'Error')
            else toastr.error('Error while submitting to the blockchain.', 'Error')
          } else {
            FlowRouter.go('/v/'+author+'/'+permlink)
          }
        }
      )

      // no fees
      // steem.broadcast.comment(wif, '', tags[0], author, permlink, title, body, jsonMetadata, function(err, result) {
      //   console.log(err, result);
      // });

    })
  }
})
