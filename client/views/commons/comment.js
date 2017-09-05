Template.comment.events({
  'click .downvoteComment': function(event) {
    var wif = Users.findOne({username: Session.get('activeUsername')}).privatekey
    var voter = Users.findOne({username: Session.get('activeUsername')}).username
    var author = $(event.target).data('author')
    if (!author) author = $(event.target).parent().data('author')
    var permlink = $(event.target).data('permlink')
    if (!permlink) permlink = $(event.target).parent().data('permlink')
    var weight = Session.get('voteWeight')*-100
    steem.broadcast.vote(wif, voter, author, permlink, weight, function(err, result) {
      if (err) toastr.error(err.cause.payload.error.data.stack[0].format, translate('GLOBAL_ERROR_COULD_NOT_VOTE'))
      else toastr.success(translate('GLOBAL_ERROR_DOWNVOTE_FOR', weight/100+'%', author+'/'+permlink))
      Template.video.loadState()
    });
  },
  'click .upvoteComment': function(event) {
    var wif = Users.findOne({username: Session.get('activeUsername')}).privatekey
    var voter = Users.findOne({username: Session.get('activeUsername')}).username
    var author = $(event.target).data('author')
    if (!author) author = $(event.target).parent().data('author')
    var permlink = $(event.target).data('permlink')
    if (!permlink) permlink = $(event.target).parent().data('permlink')
    var weight = Session.get('voteWeight')*100
    steem.broadcast.vote(wif, voter, author, permlink, weight, function(err, result) {
      if (err) toastr.error(err.cause.payload.error.data.stack[0].format, translate('GLOBAL_ERROR_COULD_NOT_VOTE'))
      else toastr.success(translate('GLOBAL_ERROR_VOTE_FOR', weight/100+'%', author+'/'+permlink))
      Template.video.loadState()
    });
  },
  // 'mouseleave .upvoteComment': function(event) {
  //   var target = $(event.target)
  //   if (!target.data('author')) target = target.parent()
  //   if (Session.get('dateMouseup')) {
  //     $(target).css('font-size', Session.get('originalThumbSize'))
  //     Session.set('dateMouseup', null)
  //   }
  // },
  // 'mouseup .upvoteComment': function(event) {
  //   var target = $(event.target)
  //   if (!target.data('author')) target = target.parent()
  //   var timediff = (new Date() - Session.get('dateMouseup'))/1000
  //   if (timediff > 6) {
  //     $(target).css('font-size', Session.get('originalThumbSize'))
  //     return
  //   } else if (timediff > 5) timediff = 5
  //   $(target).css('font-size', target.css('font-size'))
  //   var weight = Math.round(400*timediff*timediff)
  //   Session.set('dateMouseup', null)
  //
  //   var wif = Users.findOne({username: Session.get('activeUsername')}).privatekey
  //   var voter = Users.findOne({username: Session.get('activeUsername')}).username
  //   var author = $(event.target).data('author')
  //   if (!author) author = $(event.target).parent().data('author')
  //   var permlink = $(event.target).data('permlink')
  //   if (!permlink) permlink = $(event.target).parent().data('permlink')
  //   steem.broadcast.vote(wif, voter, author, permlink, weight, function(err, result) {
  //     if (err) toastr.error(err.cause.payload.error.data.stack[0].format, 'Could not vote')
  //     else toastr.success(weight/100+'% vote for '+author+'/'+permlink)
  //     Template.video.loadState()
  //     $(target).css('font-size', Session.get('originalThumbSize'))
  //   });
  // },
  // 'mousedown .upvoteComment': function(event) {
  //   Session.set('dateMouseup', new Date())
  //
  //   var target = $(event.target)
  //   if (!target.data('author')) {
  //     target.parent().css('font-size', '200%')
  //     Session.set('originalThumbSize', target.parent().css('font-size'))
  //   }
  //   else {
  //     $(target).css('font-size', '200%')
  //     Session.set('originalThumbSize', target.css('font-size'))
  //   }
  //
  // }
})
