Template.addvideo.rendered = function () {
    if (!Session.get('addVideoStep'))
        Session.set('addVideoStep', 'addvideoform')
    if (!Session.get('tmpVideo'))
        Session.set('tmpVideo', {})
}

Template.addvideo.tmpVid = function(data) {
    var tmpVideo = Session.get('tmpVideo')
    if (!tmpVideo.json) tmpVideo.json = {}
    Object.assign(tmpVideo.json, data)
    Session.set('tmpVideo', tmpVideo)
}

Template.addvideo.helpers({
    addVideoStep: function () {
      return Session.get('addVideoStep')
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
}

Template.addvideo.fillHashes = function() {
    // put ipfs style video data
    var vid = {ipfs: {}}
    // source hash is the only required field
    if (!$('input[name=videohash]')[0].value) return toastr.error(translate('EDIT_ERROR_MISSING_VIDEOHASH'), translate('ERROR_TITLE'))
    if (!Template.addvideo.verifyHash($('input[name=videohash]')[0].value)) return toastr.error(translate('EDIT_ERROR_INVALID_VIDEOHASH'), translate('ERROR_TITLE'))
    
    var fields = [
        'videohash', 'spritehash', 'video240hash',
        'video480hash', 'video720hash', 'video1080hash'
    ]
    
    for (let i = 0; i < fields.length; i++)
        if (Template.addvideo.verifyHash($('input[name='+fields[i]+']')[0].value))
            vid.ipfs[fields[i]] = $('input[name='+fields[i]+']')[0].value

    if ($('input[name=gateway]')[0].value)
        vid.ipfs.gateway = $('input[name=gateway]')[0].value

    Template.addvideo.tmpVid(vid)
}

Template.addvideo.verifyHash = function(hash) {
    // ex1: QmVsb6fZNhe5JNgTnjriNcv7a8vPhvS9f27eu5U7UnLTPk
    // start Qm
    if (hash[0] !== 'Q' || hash[1] !== 'm') return false
    // 46 chars
    if (hash.length !== 46) return false
    // base58 (who cares?)
    return true
}

Template.addvideoform.events({
    'click #addvideonext': function () {
        var options = $('input[type=radio]')
        var checked = null
        for (let i = 0; i < options.length; i++)
            if (options[i].checked)
                checked = options[i].value
        if (checked)
            Session.set('addVideoStep', 'addvideoform'+checked)
        
    }
})

Template.addvideoformp2p.events({
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

Template.addvideoformp2pbtfs.events({
    'click #addvideofinish': function () {
        Template.addvideo.fillHashes()
        Template.addvideo.tmpVid({providerName: "BTFS"})
        Session.set('addVideoStep', 'addvideopublish')
    }
})
Template.addvideoformp2pipfs.events({
    'click #addvideofinish': function () {
        Template.addvideo.fillHashes()
        Template.addvideo.tmpVid({providerName: "IPFS"})
        Session.set('addVideoStep', 'addvideopublish')
    }
})
Template.addvideoformfileuploaded.events({
    'click #addvideofinish': function () {
        Template.addvideo.fillHashes()
        Template.addvideo.tmpVid({providerName: "BTFS"})
        Session.set('addVideoStep', 'addvideopublish')
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
Template.addvideoformp2ptorrent.events({
    'click #addvideoback': function () {
        Session.set('addVideoStep', 'addvideoformp2p')
    }
})

Template.addvideoform3p.events({
    'click #addvideoback': function () {
        Session.set('addVideoStep', 'addvideoform')
    }
})

Template.addvideoformfile.events({
    'click #addvideoback': function () {
        Session.set('addVideoStep', 'addvideoform')
    }
})