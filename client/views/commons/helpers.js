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
    if (active_votes[i].rshares > 0) count++
  }
  return count;
});

Template.registerHelper('downvotes', function (active_votes) {
  if (!active_votes) return -1;
  var count = 0;
  for (var i = 0; i < active_votes.length; i++) {
    if (active_votes[i].rshares < 0) count++
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
  if (Session.get('replyingTo').author == content.author && Session.get('replyingTo').permlink == content.permlink)
    return true
  if (Session.get('replyingTo').author == content.info.author && Session.get('replyingTo').permlink == content.info.permlink)
    return true
  return false
});
