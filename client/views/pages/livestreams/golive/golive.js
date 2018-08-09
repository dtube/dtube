refreshUploadStatus = null

Template.upload.rendered = function () {

}

Template.golive.genBody = function (author, permlink, title, snaphash, videohash, description) {
  var body = '<center>'
  body += '<a href=\'https://d.tube/#!/v/' + author + '/' + permlink + '\'>'
  body += '<img src=\'https://ipfs.io/ipfs/' + Session.get('overlayHash') + '\'></a></center><hr>\n\n'
  body += description
  body += '\n\n<hr>'
  body += '<a href=\'https://d.tube/#!/v/' + author + '/' + permlink + '\'> ▶️ DTube</a><br />'
  body += '<a href=\'https://ipfs.io/ipfs/' + videohash + '\'> ▶️ IPFS</a>'
  return body
}

Template.golive.events({
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
    Template.upload.uploadImage(file, '#progresssnap', function (err, result) {
      if (err) {
        console.log(err)
        toastr.error(err, translate('UPLOAD_ERROR_IPFS_UPLOADING'))
        return
      } else {
        console.log('Uploaded Snap', result)
        Session.set('streamImageHash', result)
      }
    })
  },
  'click #getStreamKey': function (event) {
    event.preventDefault()
    $('#getStreamKey').addClass('disabled')
    $('#getStreamKey > i').removeClass('checkmark green key red')
    $('#getStreamKey > i').addClass('asterisk loading')
    $('#getStreamKey > i').css('background', 'transparent')
    Livestreams.getStreamKey(function(err, res) {
        if (err) console.log(err)
        else { 
          Session.set('streamKey', res)
          $('#getStreamKey').removeClass('disabled')
          $('#getStreamKey > i').addClass('checkmark green')
          $('#getStreamKey > i').removeClass('asterisk loading')
          $('#getStreamKey > i').css('background', 'white')
        }
    })
  }
})

Template.golive.helpers({
    streamKey: function () {
        return Session.get('streamKey')
    }
})