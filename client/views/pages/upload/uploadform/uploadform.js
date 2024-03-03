var isOriginal = false
var isNsfw = false

Template.uploadform.rendered = function () {
  $('.menu .item').tab();
}

Template.uploadform.helpers({
  mainUser: function () {
    return Users.findOne({ username: Session.get('activeUsername') })
  }
})

Template.uploadform.generateVideo = function () {
  var article = {
    videoId: $('input[name=videohash]')[0].value,
    duration: parseFloat($('input[name=duration]')[0].value),
    title: $('input[name=title]')[0].value,
    description: $('textarea[name=description]')[0].value,
    filesize: parseInt($('input[name=filesize]')[0].value),
    ipfs: {
      snaphash: $('input[name=snaphash]')[0].value,
      spritehash: $('input[name=spritehash]')[0].value,
      videohash: $('input[name=videohash]')[0].value
    }
  }

  if ($('input[name=video240hash]')[0].value.length > 0)
    article.ipfs.video240hash = $('input[name=video240hash]')[0].value
  if ($('input[name=video480hash]')[0].value.length > 0)
    article.ipfs.video480hash = $('input[name=video480hash]')[0].value
  if ($('input[name=video720hash]')[0].value.length > 0)
    article.ipfs.video720hash = $('input[name=video720hash]')[0].value
  if ($('input[name=video1080hash]')[0].value.length > 0)
    article.ipfs.video1080hash = $('input[name=video1080hash]')[0].value
  if ($('input[name=magnet]')[0].value.length > 0)
    article.magnet = $('input[name=magnet]')[0].value

  if (Session.get('tempSubtitles') && Session.get('tempSubtitles').length > 0)
    article.ipfs.subtitles = Session.get('tempSubtitles')

  if (article.ipfs.snaphash) {
    article.thumbnailUrl = 'https://snap1.d.tube/ipfs/'+article.ipfs.snaphash
  }

  if (!article.title) {
    toastr.error(translate('UPLOAD_ERROR_TITLE_REQUIRED'), translate('ERROR_TITLE'))
    return
  }
  if (!article.title.length > 256) {
    toastr.error(translate('UPLOAD_ERROR_TITLE_TOO_LONG'), translate('ERROR_TITLE'))
    return
  }
  if (!article.ipfs.snaphash || !article.thumbnailUrl) {
    toastr.error(translate('UPLOAD_ERROR_UPLOAD_SNAP_FILE'), translate('ERROR_TITLE'))
    return
  }
  if (!article.ipfs.videohash || !article.videoId) {
    toastr.error(translate('UPLOAD_ERROR_UPLOAD_VIDEO_BEFORE_SUBMITTING'), translate('ERROR_TITLE'))
    return
  } else {
    article.providerName = 'BTFS'
  }
  return article
}

Template.uploadformfulledit.events({
  'click .editadvanced': function(event) {
    event.preventDefault()
    var video = Videos.findOne({	
      author: FlowRouter.getParam("author"),
      link: FlowRouter.getParam("permlink")	
    })
    Session.set('tmpVideo', video)
    Session.set('tmpVideoEdit', true)
    FlowRouter.go('/publish')
    Session.set('addVideoStep', 'addvideopublish')
  },
})
Template.uploadformsubmit.events({
  'submit .form': function (event) {
    event.preventDefault()
  },
  'click .editsubmit': function (event) {
    event.preventDefault()
    var video = Videos.findOne({	
      author: FlowRouter.getParam("author"),
      link: FlowRouter.getParam("permlink")	
    })

    // General metadata
    if (!$('input[name=title]')[0].value) return toastr.error(translate('UPLOAD_ERROR_TITLE_REQUIRED'), translate('ERROR_TITLE'))
    if ($('input[name=title]')[0].value.length > 256) return toastr.error(translate('UPLOAD_ERROR_TITLE_TOO_LONG'), translate('ERROR_TITLE'))

    video.json.title = $('input[name=title]')[0].value
    video.json.desc = $('textarea[name=description]')[0].value
    delete video.json.description

    // IPFS specific metadata (old format)
    if (video.json.providerName === 'IPFS' || video.json.providerName === 'BTFS') {
      if (!$('input[name=videohash]')[0].value) return toastr.error(translate('EDIT_ERROR_MISSING_VIDEOHASH'), translate('ERROR_TITLE'))
      if (!$('input[name=snaphash]')[0].value) return toastr.error(translate('EDIT_ERROR_MISSING_SNAPHASH'),translate('ERROR_TITLE'))

      video.json.videoId = $('input[name=videohash]')[0].value
      video.json.filesize = $('input[name=filesize]')[0].value
      video.json.duration = $('input[name=duration]')[0].value
      video.json.ipfs.videohash = $('input[name=videohash]')[0].value
      video.json.ipfs.spritehash = $('input[name=spritehash]')[0].value
      video.json.ipfs.snaphash = $('input[name=snaphash]')[0].value
      if (!$('input[name=thumbnailUrlExternal]')[0].value) {
        video.json.thumbnailUrl = $('input[name=thumbnailUrlExternal]')[0].value 
      } else {
        video.json.thumbnailUrl = 'https://snap1.d.tube/ipfs/' + $('input[name=snaphash]')[0].value
      }

      if ($('input[name=video240hash]')[0].value) video.json.ipfs.video240hash = $('input[name=video240hash]')[0].value
      if ($('input[name=video480hash]')[0].value) video.json.ipfs.video480hash = $('input[name=video480hash]')[0].value
      if ($('input[name=video720hash]')[0].value) video.json.ipfs.video720hash = $('input[name=video720hash]')[0].value
      if ($('input[name=video1080hash]')[0].value) video.json.ipfs.video1080hash = $('input[name=video1080hash]')[0].value
    }

    let steembody;
    if ($('textarea[name=body]').length !== 0) steembody = $('textarea[name=body]')[0].value

    $(".editsubmit").addClass('disabled')
    $(".editsubmit > i.checkmark").addClass('dsp-non')
    $(".editsubmit > i.loading").removeClass('dsp-non')

    broadcast.multi.editComment(Session.get('currentRefs'),video.json,steembody,(err) => {
      if (err) Meteor.blockchainError(err)
      else {
        $(".editsubmit").removeClass('disabled')
        $(".editsubmit > i.loading").addClass('dsp-non')
        $(".editsubmit > i.checkmark").removeClass('dsp-non')
        toastr.success(translate('EDIT_VIDEO_SUCCESS'))
        $('#editvideosegment').toggle()
        $('#powerup').toggle()
        Template.video.loadState()
      }
    })
  }
})
