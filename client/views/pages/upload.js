Template.upload.rendered = function() {

}

Template.upload.createPermlink = function(length) {
  var text = "";
  var possible = "abcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

Template.upload.IPFS = function(nodeUrl, buffer, cb) {
  // native ipfs way
  // var filePair = {
  //   path: file.name,
  //   content: new ipfs.types.Buffer(buffer)
  // }
  // ipfs.files.add([filePair], function(err, res) {
  //   console.log('Succesfully added file', res)
  // })

  // through our own ipfs node
  var ipfsApi = IpfsApi(nodeUrl, '5001')
  ipfsApi.add(new ipfs.types.Buffer(buffer), function(err, res) {
    cb(err, res)
  })
}

Template.upload.helpers({
  mainUser: function() {
    return Users.findOne({username: Session.get('activeUsername')})
  }
})

Template.upload.events({
  'dropped #dropzone': function(event) {
    $('#dropzone').hide()

    var dt = event.originalEvent.dataTransfer
    var file = dt.files[0]
    $('input[name="title"]').val(file.name)

    // displaying the preview
    var videoNode = document.querySelector('video')
    var fileURL = URL.createObjectURL(file)
    videoNode.src = fileURL

    // uploading to ipfs
    var reader = new window.FileReader()
    reader.onload = function(event) {
      var nodeUrl = Meteor.settings.public.uploadNodes[0].ip
      if (Session.get('ipfsUpload')) nodeUrl = Session.get('ipfsUpload')
      Template.upload.IPFS(nodeUrl, event.target.result, function(e, r) {
        if (e) console.log(e)
        console.log('Uploaded video', r);
        $('input[name="videohash"]').val(r[0].hash)
      })
    }
    reader.readAsArrayBuffer(file);
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
    var reader = new FileReader();
    reader.onload = function(event) {
      var nodeUrl = Meteor.settings.public.uploadNodes[0].ip
      if (Session.get('ipfsUpload')) nodeUrl = Session.get('ipfsUpload')
      Template.upload.IPFS(nodeUrl, event.target.result, function(e, r) {
        if (e) console.log(e)
        console.log('Uploaded Snap', r)
        $('input[name="snaphash"]').val(r[0].hash)
      })
    };
    reader.readAsArrayBuffer(file);
  },
  'submit .form': function(event) {
    event.preventDefault()
    var tags = ['dtube']
    for (var i = 0; i < event.target.tags.value.split(' ').length; i++) {
      if (i > 3) break
      tags.push('dtube-'+event.target.tags.value.split(' ')[i])
    }
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
    console.log(article)
    Waka.api.Set(article, {}, function(e,r) {
      Videos.refreshWaka()
      console.log('Test')
      // publish on blockchain !!
      var wif = Users.findOne({username: Session.get('activeUsername')}).privatekey
      var author = r.article.info.author
      var permlink = r.article.info.permlink
      var title = r.article.info.title
      var body = 'Please Ignore'
      var jsonMetadata = {
        video: r.article,
        tags: article.content.tags,
        app: 'dtube'
      }
      console.log(wif, '', tags[0], author, permlink, title, body, jsonMetadata)
      steem.broadcast.comment(wif, '', tags[0], author, permlink, title, body, jsonMetadata, function(err, result) {
        console.log(err, result);
      });

      FlowRouter.go('/v/'+author+'/'+permlink)
    })
  }
})
