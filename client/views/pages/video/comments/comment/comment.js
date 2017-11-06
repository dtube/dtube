
var currentCommentIsOpen = false;
Template.comment.events({
  'click .commentbutton': function () {
    var thisOne = "#" + event.srcElement.id + "subcomment";
    if (currentCommentIsOpen === false) {
      $(thisOne).addClass('subcommentsclosed');
    }
    else {
      $(thisOne).removeClass('subcommentsclosed');
      console.log(thisOne + 'closed');
    }
    currentCommentIsOpen = !currentCommentIsOpen;
  },
  'click .downvoteComment': function (event) {
    var wif = Users.findOne({ username: Session.get('activeUsername') }).privatekey
    var voter = Users.findOne({ username: Session.get('activeUsername') }).username
    var author = $(event.target).data('author')
    if (!author) author = $(event.target).parent().data('author')
    var permlink = $(event.target).data('permlink')
    if (!permlink) permlink = $(event.target).parent().data('permlink')
    var weight = Session.get('voteWeight') * -100
    steem.broadcast.vote(wif, voter, author, permlink, weight, function (err, result) {
      if (err) toastr.error(err.cause.payload.error.data.stack[0].format, translate('GLOBAL_ERROR_COULD_NOT_VOTE'))
      else toastr.success(translate('GLOBAL_ERROR_DOWNVOTE_FOR', weight / 100 + '%', author + '/' + permlink))
      Template.video.loadState()
    });
  },
  'click .upvoteComment': function (event) {
    var wif = Users.findOne({ username: Session.get('activeUsername') }).privatekey
    var voter = Users.findOne({ username: Session.get('activeUsername') }).username
    var author = $(event.target).data('author')
    if (!author) author = $(event.target).parent().data('author')
    var permlink = $(event.target).data('permlink')
    if (!permlink) permlink = $(event.target).parent().data('permlink')
    var weight = Session.get('voteWeight') * 100
    steem.broadcast.vote(wif, voter, author, permlink, weight, function (err, result) {
      if (err) toastr.error(err.cause.payload.error.data.stack[0].format, translate('GLOBAL_ERROR_COULD_NOT_VOTE'))
      else toastr.success(translate('GLOBAL_ERROR_VOTE_FOR', weight / 100 + '%', author + '/' + permlink))
      Template.video.loadState()
    });
  }
})


Template.comment.helpers({
  newComment: function () {
    if (document.getElementById('subcomments') !== null) {
      var random = Template.upload.createPermlink(6)
      var currentButton = document.getElementById('showreplies');
      currentButton.id = random;
      var currentSubComment = document.getElementById('subcomments');
      currentSubComment.id = currentButton.id + "subcomment";
    }
  }
})
