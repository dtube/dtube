Template.publish.rendered = function() {
  Template.upload.burnRange()
  var json = Session.get('tmpVideo').json
  if (json.title)
    $("#uploadTitle")[0].value = json.title
  if (json.desc)
    $("#uploadDescription")[0].value = json.desc
}

Template.publish.events({
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
    Template.upload.uploadImage(file, '#progresssnap', function (err, smallHash, bigHash) {
      if (err) {
        console.log(err)
        toastr.error(err, translate('UPLOAD_ERROR_IPFS_UPLOADING'))
        return
      } else {
        console.log('Uploaded Snap', smallHash, bigHash)
        var tmpVideo = Session.get('tmpVideo')
        var files = tmpVideo.json.files
        if (!files.ipfs) files.ipfs = {}
        if (!files.ipfs.img) files.ipfs.img = {}
        files.ipfs.img["118"] = smallHash
        files.ipfs.img["360"] = bigHash
        tmpVideo.files = files
        Session.set('tmpVideo', tmpVideo)
      }
    })
  },
  "click #addVideo": function() {
    Session.set('addVideoStep', 'addvideoform')
  },
  'click #addSubtitle': function (event) {
      Session.set('addVideoStep', 'addsubtitle')
  },
  "click .edit-file": function() {
    Session.set('addVideoStep', 'addvideoformp2p'+this.tech.toLowerCase())
  },
  "click .trash-file": function() {
    var tmpVideo = Session.get('tmpVideo')
    delete tmpVideo.json.files[this.tech]
    Session.set('tmpVideo', tmpVideo)
  },
  "click .preview-file": function() {
    var gw = this.gw
    if (!gw) {
      if (this.tech == 'BTFS')
        if (this.type== 'img' && this.ver == 'spr')
          gw = 'sprite.d.tube'
        else if (this.type == 'img' )
          gw = 'snap1.d.tube'
        else
          gw = 'player.d.tube'
      if (this.tech == 'IPFS')
        if (this.type== 'img' && this.ver == 'spr')
          gw = 'ipfs.io'
        else if (this.type == 'img' )
          gw = 'snap1.d.tube'
        else
          gw = 'ipfs.io'
    }

    window.open("https://"+gw+"/"+this.tech.toLowerCase()+"/"+this.hash);
  }
})

Template.publish.helpers({
    tmpVideo: function () {
      return Session.get('tmpVideo')
    },
    hasThumbnail: function() {
      var files = Session.get('tmpVideo').json.files
      if (files["youtube"]) return true
      if (files.btfs && files.btfs.img && files.btfs.img["118"]) return true
      if (files.btfs && files.btfs.img && files.btfs.img["360"]) return true
      if (files.ipfs && files.ipfs.img && files.ipfs.img["118"]) return true
      if (files.ipfs && files.ipfs.img && files.ipfs.img["360"]) return true
      return false
    },
    hasVideo: function() {
      var files = Session.get('tmpVideo').json.files
      if (files["youtube"]) return true
      if (files.btfs && files.btfs.vid && files.btfs.vid["src"]) return true
      if (files.ipfs && files.ipfs.vid && files.ipfs.vid["src"]) return true
      return false
    },
    hasDecentralizedVideo: function() {
      var files = Session.get('tmpVideo').json.files
      if (files.btfs && files.btfs.vid && files.btfs.vid["src"]) return true
      if (files.ipfs && files.ipfs.vid && files.ipfs.vid["src"]) return true
      return false
    },
    files: function() {
      var files = Session.get('tmpVideo').json.files
      var filesList = []
      for (const tech in files) {
        if (tech == 'btfs' || tech == 'ipfs') {
          var gw = null
          for (const type in files[tech]) {
            if (type == 'gw') {
              gw = files[tech][type]
              delete files[tech][type]
              break
            }
          }
          for (const type in files[tech]) {
            for (const ver in files[tech][type]) {
              filesList.push({
                tech: tech.toUpperCase(),
                type: type,
                ver: ver,
                hash: files[tech][type][ver],
                gw: gw
              })
            }
          }
          continue
        }
        filesList.push({
          tech: tech,
          type: '3p',
          hash: files[tech]
        })
      }
      return filesList
    },
    prettyType: function(type, version) {
      if (type == '3p') return translate("UPLOAD_FILE_3RDPARTY")
      switch (type) {
        case 'vid':
          switch (version) {
            case 'src':
              return 'Source Video'
              break;

            case '240':
              return '240p Video'
              break;

            case '480':
              return '480p Video'
              break;

            case '720':
              return '720p Video'
              break;

            case '1080':
              return '1080p Video'
              break;
          
            default:
              return 'Unknown Video Quality'
              break;
          }
          break;

        case 'img':
          switch (version) {
            case 'spr':
              return 'Sprite Image'
              break;

            case '118':
              return '210x118 Thumbnail'
              break;

            case '360':
              return '640x360 Thumbnail'
              break;
          
            default:
              return 'Unknown Image'
              break;
          }
          break;

        case 'sub':
          break;

        default:
          return "Unknown File Type"
          break;
      }
    },
    isDecentralized: function(tech) {
      if (tech == 'BTFS') return true
      if (tech == 'IPFS') return true
      return false
    }
})
