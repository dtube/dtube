Template.uploadform.rendered = function() {
  $('.ui.multiple.dropdown').dropdown({
    allowAdditions: true,
    keys: {
      delimiter: 32, // 188 (the comma) by default.
    }
  });
}

Template.uploadform.helpers({
  mainUser: function() {
    return Users.findOne({username: Session.get('activeUsername')})
  }
})

Template.uploadform.events({
    'click .external': function(event) {
      var hash = $(event.currentTarget).parent().next()[0].value
      if (hash && hash.length > 40)
        window.open('https://ipfs.io/ipfs/'+hash)
    },
    'click .advanced': function(event) {
      $('.advancedupload').toggle()
    },
    'submit .form': function(event) {
      event.preventDefault()
    },
    'click .uploadsubmit': function(event) {
      event.preventDefault()
      var tags = ['dtube']
      var form = document.getElementsByClassName('uploadform')[0]
      for (var i = 0; i < form.tags.value.split(',').length; i++) {
        tags.push(form.tags.value.split(',')[i].toLowerCase())
        tags.push('dtube-'+form.tags.value.split(',')[i].toLowerCase())
      }
      var article = {
        info: {
          title: form.title.value,
          snaphash: form.snaphash.value,
          author: Users.findOne({username: Session.get('activeUsername')}).username,
          permlink: Template.newupload.createPermlink(8),
          duration: form.duration.value,
          filesize: form.filesize.value,
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
        var body = form.body.value
        if (!body || body.length < 1)
          body = Template.newupload.genBody(author, permlink, title, r.article.info.snaphash, r.article.content.videohash, r.article.content.description)
        else
          body = Template.newupload.genBody(author, permlink, title, r.article.info.snaphash, r.article.content.videohash, body)
        
        var jsonMetadata = {
          video: r.article,
          tags: article.content.tags,
          app: Meteor.settings.public.app
        }

        var percent_steem_dollars = 10000
        if (form.powerup && form.powerup.checked)
          percent_steem_dollars = 0
  
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