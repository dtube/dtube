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
  $('.menu .item').tab();
}

Template.uploadform.helpers({
  mainUser: function () {
    return Users.findOne({ username: Session.get('activeUsername') })
  },
  inputTags: function (tags) {
    if (!tags) return ''
    var ok = []
    for (var i = 0; i < tags.length; i++) {
      if (tags[i].startsWith(Meteor.settings.public.beneficiary))
        continue;
      ok.push(tags[i])
    }
    return ok.join(',')
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
  tags.push(Meteor.settings.public.beneficiary)
  return [tags, videoTags]
}

Template.uploadform.generateVideo = function (tags) {
  var article = {
    info: {
      title: $('input[name=title]')[0].value,
      snaphash: $('input[name=snaphash]')[0].value,
      author: Users.findOne({ username: Session.get('activeUsername') }).username,
      permlink: Template.upload.createPermlink(8),
      duration: parseFloat($('input[name=duration]')[0].value),
      filesize: parseInt($('input[name=filesize]')[0].value),
      spritehash: $('input[name=spritehash]')[0].value
    },
    content: {
      videohash: $('input[name=videohash]')[0].value,
      description: $('textarea[name=description]')[0].value,
      tags: tags
    }
  }

  if ($('input[name=videohash]')[0].value.length > 0)
    article.content.videohash = $('input[name=videohash]')[0].value
  if ($('input[name=video240hash]')[0].value.length > 0)
    article.content.video240hash = $('input[name=video240hash]')[0].value
  if ($('input[name=video480hash]')[0].value.length > 0)
    article.content.video480hash = $('input[name=video480hash]')[0].value
  if ($('input[name=video720hash]')[0].value.length > 0)
    article.content.video720hash = $('input[name=video720hash]')[0].value
  // if ($('input[name=video1080hash]')[0].value.length > 0)
  //   article.content.video1080hash = $('input[name=video1080hash]')[0].value
  if ($('input[name=magnet]')[0].value.length > 0)
    article.content.magnet = $('input[name=magnet]')[0].value

  if (Session.get('tempSubtitles') && Session.get('tempSubtitles').length > 0)
    article.content.subtitles = Session.get('tempSubtitles')

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

Template.uploadformsubmit.events({
  'submit .form': function (event) {
    event.preventDefault()
  },
  'click .uploadsubmit': function (event) {
    event.preventDefault()
    var tags = Template.uploadform.parseTags($('input[name=tags]')[0].value)
    var article = Template.uploadform.generateVideo(tags[1])
    if (!article) return

    // publish on blockchain !!
    $('#step3load').show()
    
    var wif = Users.findOne({ username: Session.get('activeUsername') }).privatekey
    var author = article.info.author
    var permlink = article.info.permlink
    var title = article.info.title
    var body = $('textarea[name=body]')[0].value

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
    if ($('input[name=powerup]')[0] && $('input[name=powerup]')[0].checked)
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
    var tags = Template.uploadform.parseTags($('input[name=tags]')[0].value)
    var article = Template.uploadform.generateVideo(tags[1])
    if ($('input[name=permlink]')[0])
      article.info.permlink = $('input[name=permlink]')[0].value

    var wif = Users.findOne({ username: Session.get('activeUsername') }).privatekey
    var author = Session.get('activeUsername')
    var permlink = article.info.permlink
    var title = article.info.title
    var body = $('textarea[name=body]')[0].value

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
    broadcast.send(
      operations,
      function (e, r) {
        if (e) {
          toastr.error(Meteor.blockchainError(e), translate('ERROR_TITLE'))
          console.log(e)
        } else {
          $('#editvideosegment').toggle()
          Template.video.loadState()
        }
      }
    )
  }
})
