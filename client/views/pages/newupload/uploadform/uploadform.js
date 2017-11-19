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
    'click .advanced': function(event) {
      $('.advancedupload').toggle()
    },
    'submit .form': function(event) {
      event.preventDefault()
    },
    'click .uploadsubmit': function(event) {
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
          permlink: Template.newupload.createPermlink(8),
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
        var body = Template.newupload.genBody(author, permlink, title, r.article.info.snaphash, r.article.content.videohash, r.article.content.description)
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