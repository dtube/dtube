var isOriginal = false
var isNsfw = false

Template.uploadform.rendered = function () {
  $('.ui.multiple.dropdown').dropdown({
    allowAdditions: true,
    keys: {
      delimiter: 32, // 188 (the comma) by default.
    },
    onNoResults: function (search) { }, // trick to hide no result message
    onChange: function () {
      var tags = $('#tags').val().split(",").length;
      if (tags <= 3) {
        $('.tags.alert').addClass('dsp-non')
        $('.ui.multiple.dropdown').dropdown('setting', 'allowAdditions', true);
      }
      else {
        $('.tags.alert').removeClass('dsp-non')
        $('.ui.multiple.dropdown').dropdown('setting', 'allowAdditions', false);
      }
    }
  });
  $('.ui.nsfw.slider').checkbox({
    onChecked: function () {
      let tags = $('#tags').val().split(",");
      if (tags.length <= 3) {
        $('.ui.multiple.dropdown').dropdown('set selected', ['nsfw']);
      }
      else {
        $('.ui.multiple.dropdown').dropdown('setting', 'allowAdditions', true);
        $('.ui.multiple.dropdown').dropdown('remove selected', tags.pop());
        $('.ui.multiple.dropdown').dropdown('set selected', ['nsfw']);
      }
    },
    onUnchecked: function () {
      $('.ui.multiple.dropdown').dropdown('setting', 'allowAdditions', true);
      $('.ui.multiple.dropdown').dropdown('remove selected', ['nsfw']);
    }
  });
}

Template.uploadform.helpers({
  mainUser: function () {
    return Users.findOne({ username: Session.get('activeUsername') })
  },
  inputTags: function (tags) {
    if (!tags) return ''
    var ok = []
    for (var i = 0; i < tags.length; i++) {
      if (tags[i].startsWith('dtube'))
        continue;
      ok.push(tags[i])
    }
    return ok.join(',')
  },
  isOnMobile: function () {
    if (/Mobi/.test(navigator.userAgent)) {
      return true;
    }
  }
})

Template.uploadform.parseTags = function (raw) {
  var tags = []
  var videoTags = []
  var form = document.getElementsByClassName('uploadform')[0]
  for (var i = 0; i < raw.split(',').length; i++) {
    if (tags.length < 4)
      tags.push(raw.split(',')[i].toLowerCase())
    if (videoTags.length < 4)
      videoTags.push(raw.split(',')[i].toLowerCase())
    //tags.push('dtube-'+raw.split(',')[i].toLowerCase())
  }
  tags.push('dtube')
  return [tags, videoTags]
}

Template.uploadform.generateVideo = function (form, tags, permlink) {
  var article = {
    info: {
      title: form.title.value,
      snaphash: form.snaphash.value,
      author: Users.findOne({ username: Session.get('activeUsername') }).username,
      permlink: Template.upload.createPermlink(8),
      duration: parseFloat(form.duration.value),
      filesize: parseInt(form.filesize.value),
      spritehash: form.spritehash.value
    },
    content: {
      videohash: form.videohash.value,
      video480hash: form.video480hash.value,
      magnet: form.magnet.value,
      description: form.description.value,
      tags: tags
    }
  }
  if (form.permlink) article.info.permlink = form.permlink.value
  if (!article.info.title) {
    toastr.error(translate('UPLOAD_ERROR_TITLE_REQUIRED'), translate('ERROR_TITLE'))
    return
  }
  if (!article.info.title.length > 256) {
    toastr.error(translate('UPLOAD_ERROR_TITLE_TOO_LONG'), translate('ERROR_TITLE'))
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
  return article
}

Template.uploadform.events({
  'click .external': function (event) {
    var hash = $(event.currentTarget).parent().next()[0].value
    if (hash && hash.length > 40)
      window.open('https://ipfs.io/ipfs/' + hash)
  },
  'click .advanced': function (event) {
    $('.advancedupload').toggle()
  },
  'submit .form': function (event) {
    event.preventDefault()
  },
  'click .uploadsubmit': function (event) {
    event.preventDefault()
    var form = document.getElementsByClassName('uploadform')[0]
    var tags = Template.uploadform.parseTags(form.tags.value)
    var article = Template.uploadform.generateVideo(form, tags[1])
    $('#step3load').show()

    // publish on blockchain !!
    var wif = Users.findOne({ username: Session.get('activeUsername') }).privatekey
    var author = article.info.author
    var permlink = article.info.permlink
    var title = article.info.title
    var body = form.body.value

    if (!body || body.length < 1)
      body = Template.upload.genBody(author, permlink, title, article.info.snaphash, article.content.videohash, article.content.description)
    else
      body = Template.upload.genBody(author, permlink, title, article.info.snaphash, article.content.videohash, body)


    var jsonMetadata = {
      video: article,
      tags: tags[0],
      app: Meteor.settings.public.app
    }

    var percent_steem_dollars = 10000
    if (form.powerup && form.powerup.checked)
      percent_steem_dollars = 0

    var operations = [
      ['comment',
        {
          parent_author: '',
          parent_permlink: tags[0][0],
          author: author,
          permlink: permlink,
          title: title,
          body: body,
          json_metadata: JSON.stringify(jsonMetadata)
        }
      ],
      ['comment_options', {
        author: author,
        permlink: permlink,
        max_accepted_payout: '1000000.000 SBD',
        percent_steem_dollars: percent_steem_dollars,
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
    broadcast.send(
      operations,
      function (e, r) {
        $('#step3load').hide()
        if (e) {
          console.log(e)
          toastr.error(Meteor.blockchainError(e), translate('ERROR_TITLE'))
        } else {
          Session.set('uploadedVideo', { author: author, permlink: permlink })
          FlowRouter.go('/v/' + author + "/" + permlink)
        }
      }
    )
  },
  'click .editsubmit': function (event) {
    event.preventDefault()
    var form = document.getElementsByClassName('uploadform')[0]
    var tags = Template.uploadform.parseTags(form.tags.value)
    var article = Template.uploadform.generateVideo(form, tags[1])

    var wif = Users.findOne({ username: Session.get('activeUsername') }).privatekey
    var author = Session.get('activeUsername')
    var permlink = article.info.permlink
    var title = article.info.title
    var body = form.body.value

    var jsonMetadata = {
      video: article,
      tags: tags[0],
      app: Meteor.settings.public.app
    }

    var operations = [
      ['comment',
        {
          parent_author: '',
          parent_permlink: tags[0][0],
          author: author,
          permlink: permlink,
          title: title,
          body: body,
          json_metadata: JSON.stringify(jsonMetadata)
        }
      ]
    ];
    console.log(operations)
    // broadcast.send(
    //   operations,
    //   function (e, r) {
    //     if (e) {
    //       console.log(e)
    //       if (e.payload) toastr.error(e.payload.error.data.stack[0].format, translate('ERROR_TITLE'))
    //       else toastr.error(translate('UPLOAD_ERROR_SUBMIT_BLOCKCHAIN'), translate('ERROR_TITLE'))
    //     } else {
    //       console.log('done')
    //     }
    //   }
    // )
  }
})

Template.uploadformsubmit.helpers({
  isOnMobile: function () {
    if (/Mobi/.test(navigator.userAgent)) {
      return true;
    }
  }
})