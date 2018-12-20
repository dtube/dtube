Template.comment.events({
  'click .downvoteComment': function (event) {
    var author = $(event.target).data('author')
    if (!author) author = $(event.target).parent().data('author')
    var permlink = $(event.target).data('permlink')
    if (!permlink) permlink = $(event.target).parent().data('permlink')
    var weight = UserSettings.get('voteWeight') * -100
    broadcast.vote(author, permlink, weight, function (err, result) {
      if (err) toastr.error(err.cause.payload.error.data.stack[0].format, translate('GLOBAL_ERROR_COULD_NOT_VOTE'))
      else toastr.success(translate('GLOBAL_ERROR_DOWNVOTE_FOR', weight / 100 + '%', author + '/' + permlink))
      updateComment(author, permlink, -100)
    });
  },
  'click .upvoteComment': function (event) {
    var author = $(event.target).data('author')
    if (!author) author = $(event.target).parent().data('author')
    var permlink = $(event.target).data('permlink')
    if (!permlink) permlink = $(event.target).parent().data('permlink')
    var weight = UserSettings.get('voteWeight') * 100
    broadcast.vote(author, permlink, weight, function (err, result) {
      if (err) toastr.error(err.cause.payload.error.data.stack[0].format, translate('GLOBAL_ERROR_COULD_NOT_VOTE'))
      else toastr.success(translate('GLOBAL_ERROR_VOTE_FOR', weight / 100 + '%', author + '/' + permlink))
      updateComment(author, permlink, 100)
    });
  }
})

Template.comment.helpers({
  currentAuthor: function () {
    return FlowRouter.getParam("author")
  }
})
Template.comment.rendered = function () {
  Template.settingsdropdown.nightMode();
}

 
function updateComment(author, permlink, rshares) {
  var rootVideo = Videos.findOne({
    author: FlowRouter.getParam("author"),
    permlink: FlowRouter.getParam("permlink"),
    source: 'chainDirect'
  })
  for (let i = 0; i < rootVideo.comments.length; i++) {
    if (rootVideo.comments[i].author == author 
      && rootVideo.comments[i].permlink == permlink) {
        rootVideo.comments[i].active_votes.push({
          rshares: rshares,
          reputation: 25,
          voter: Session.get('activeUsername'),
          percent: rshares
        })
      }
  }
  Videos.upsert({_id: rootVideo._id}, rootVideo)
}

