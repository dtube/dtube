// Template.goliveform.rendered = function () {
//     $('.ui.multiple.dropdown').dropdown({
//       allowAdditions: true,
//       keys: {
//         delimiter: 32, // 188 (the comma) by default.
//       },
//       onNoResults: function (search) { }, // trick to hide no result message
//       onChange: function () {
//         var tags = $('#tags').val().split(",").length;
//         if (tags <= 3) {
//           $('.tags.alert').addClass('dsp-non')
//           $('.ui.multiple.dropdown').dropdown('setting', 'allowAdditions', true);
//         }
//         else {
//           $('.tags.alert').removeClass('dsp-non')
//           $('.ui.multiple.dropdown').dropdown('setting', 'allowAdditions', false);
//         }
//       }
//     });
//     $('.ui.nsfw.slider').checkbox({
//         onChecked: function () {
//           let tags = $('#tags').val().split(",");
//           if (tags.length <= 3) {
//             $('.ui.multiple.dropdown').dropdown('set selected', ['nsfw']);
//           }
//           else {
//             $('.ui.multiple.dropdown').dropdown('setting', 'allowAdditions', true);
//             $('.ui.multiple.dropdown').dropdown('remove selected', tags.pop());
//             $('.ui.multiple.dropdown').dropdown('set selected', ['nsfw']);
//           }
//         },
//         onUnchecked: function () {
//           $('.ui.multiple.dropdown').dropdown('setting', 'allowAdditions', true);
//           $('.ui.multiple.dropdown').dropdown('remove selected', ['nsfw']);
//         }
//     });
// }

// Template.goliveform.events({
//     'submit .form': function (event) {
//       event.preventDefault()
//     },
//     'click .uploadsubmit': function (event) {
//       event.preventDefault()
//       var tags = Template.uploadform.parseTags($('input[name=tags]')[0].value)
//       var article = Template.uploadform.generateVideo()
//       if (!article) return
  
//       // publish on blockchain !!
//       $('#step3load').show()
      
//       var wif = Users.findOne({ username: Session.get('activeUsername') }).privatekey
//       var author = article.info.author
//       var permlink = article.info.permlink
//       var title = article.info.title
//       var body = $('textarea[name=body]')[0].value
  
//       if (!body || body.length < 1)
//         body = Template.upload.genBody(author, permlink, title, article.info.snaphash, article.content.videohash, article.content.description)
//       else
//         body = Template.upload.genBody(author, permlink, title, article.info.snaphash, article.content.videohash, body)
  
  
//       var jsonMetadata = {
//         video: article,
//         tags: tags[0],
//         app: Meteor.settings.public.app
//       }
  
//       var percent_steem_dollars = 10000
//       if ($('input[name=powerup]')[0] && $('input[name=powerup]')[0].checked)
//         percent_steem_dollars = 0
  
//       var operations = [
//         ['comment',
//           {
//             parent_author: '',
//             parent_permlink: tags[0][0],
//             author: author,
//             permlink: permlink,
//             title: title,
//             body: body,
//             json_metadata: JSON.stringify(jsonMetadata)
//           }
//         ],
//         ['comment_options', {
//           author: author,
//           permlink: permlink,
//           max_accepted_payout: '1000000.000 SBD',
//           percent_steem_dollars: percent_steem_dollars,
//           allow_votes: true,
//           allow_curation_rewards: true,
//           extensions: [
//             [0, {
//               beneficiaries: [{
//                 account: Meteor.settings.public.beneficiary,
//                 weight: Session.get('remoteSettings').dfees
//               }]
//             }]
//           ]
//         }]
//       ];
//       $('#step3load').show()
//       console.log(operations)
//       broadcast.avalon.send(
//         operations,
//         function (e, r) {
//           $('#step3load').hide()
//           if (e) {
//             console.log(e)
//             toastr.error(Meteor.blockchainError(e), translate('ERROR_TITLE'))
//           } else {
//             Session.set('uploadedVideo', { author: author, permlink: permlink })
//             FlowRouter.go('/v/' + author + "/" + permlink)
//           }
//         }
//       )
//     }
//   })