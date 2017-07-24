import moment from 'moment'

Template.registerHelper('equals', function (one, two) {
  if (one == two) return true;
  return false;
});

Template.registerHelper('customSyntax', function (description) {
  if (!description) return;
  return description.replace(/(?:\r\n|\r|\n)/g, '<br />');
});

Template.registerHelper('count', function (array) {
  if (!array) return 0;
  return array.length;
});

Template.registerHelper('upvotes', function (active_votes) {
  if (!active_votes) return -1;
  var count = 0;
  for (var i = 0; i < active_votes.length; i++) {
    if (active_votes[i].percent > 0) count++
  }
  return count;
});

Template.registerHelper('downvotes', function (active_votes) {
  if (!active_votes) return -1;
  var count = 0;
  for (var i = 0; i < active_votes.length; i++) {
    if (active_votes[i].percent < 0) count++
  }
  return count;
});

Template.registerHelper('userPic', function (username) {
  var user = ChainUsers.findOne({name: username})
  if (user && user.json_metadata && user.json_metadata.profile && user.json_metadata.profile.profile_image)
    return user.json_metadata.profile.profile_image
  return 'https://kontak.me/slpw/plugin_blab/noprofileimage.png'
});

Template.registerHelper('isReplying', function (content) {
  if (!Session.get('replyingTo')) return false
  if (!content) return false
  if (content.info) {
    if (Session.get('replyingTo').author == content.info.author && Session.get('replyingTo').permlink == content.info.permlink)
      return true
  } else {
    if (!content.author) return false
    if (Session.get('replyingTo').author == content.author && Session.get('replyingTo').permlink == content.permlink)
      return true
  }
  return false
});

Template.registerHelper('displayCurrency', function(string) {
  if (!string) return
  var amount = string.split(' ')[0]
  var currency = string.split(' ')[1]
  if (currency == 'SBD') return '$'+amount
  return amount;
})

Template.registerHelper('displayPayout', function(active, total) {
  if (!active || !total) return
  var payout = active
  if (total.split(' ')[0] > 0) payout = total
  if (!payout) return
  var amount = payout.split(' ')[0]
  var currency = payout.split(' ')[1]
  if (currency == 'SBD') return '$'+amount
  return amount;
})

Template.registerHelper('timeAgo', function(created) {
  if (!created) return
  return moment(created).fromNow()
})

Template.registerHelper('timeDisplay', function(created) {
  if (!created) return
  return moment(created).format("MMM Do YY")
})

Template.registerHelper('hasUpvoted', function(video) {
  if (!video || !video.active_votes) return
  for (var i = 0; i < video.active_votes.length; i++) {
    if (video.active_votes[i].voter == Session.get('activeUsername')
      && parseInt(video.active_votes[i].percent) > 0)
      return true
  }
  return false
})

Template.registerHelper('hasDownvoted', function(video) {
  if (!video || !video.active_votes) return
  for (var i = 0; i < video.active_votes.length; i++) {
    if (video.active_votes[i].voter == Session.get('activeUsername')
      && parseInt(video.active_votes[i].percent) < 0)
      return true
  }
  return false
})
