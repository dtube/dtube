Template.comment.events({
  'click .downvoteComment': function(event) {
    var wif = Users.findOne({username: Session.get('activeUsername')}).privatekey
    var voter = Users.findOne({username: Session.get('activeUsername')}).username
    var author = $(event.target).data('author')
    if (!author) author = $(event.target).parent().data('author')
    var permlink = $(event.target).data('permlink')
    if (!permlink) permlink = $(event.target).parent().data('permlink')
    var weight = -10000 // -100%
    console.log(wif, voter, author, permlink, weight)
    steem.broadcast.vote(wif, voter, author, permlink, weight, function(err, result) {
      Template.video.loadState()
    });
  },
  'mouseup .upvoteComment': function(event) {
    var target = $(event.target)
    if (!target.data('author')) target = target.parent()
    var timediff = (new Date() - Session.get('dateMouseup'))/1000
    if (timediff > 6) {
      $(target).css('font-size', Session.get('originalThumbSize'))
      return
    } else if (timediff > 5) timediff = 5
    $(target).css('font-size', target.css('font-size'))
    var weight = Math.round(400*timediff*timediff)
    console.log(timediff, weight)

    var wif = Users.findOne({username: Session.get('activeUsername')}).privatekey
    var voter = Users.findOne({username: Session.get('activeUsername')}).username
    var author = $(event.target).data('author')
    if (!author) author = $(event.target).parent().data('author')
    var permlink = $(event.target).data('permlink')
    if (!permlink) permlink = $(event.target).parent().data('permlink')
    console.log(wif, voter, author, permlink, weight)
    steem.broadcast.vote(wif, voter, author, permlink, weight, function(err, result) {
      Template.video.loadState()
      $(target).css('font-size', Session.get('originalThumbSize'))
    });
  },
  'mousedown .upvoteComment': function(event) {
    Session.set('dateMouseup', new Date())

    var target = $(event.target)
    if (!target.data('author')) {
      target.parent().css('font-size', '200%')
      Session.set('originalThumbSize', target.parent().css('font-size'))
    }
    else {
      $(target).css('font-size', '200%')
      Session.set('originalThumbSize', target.css('font-size'))
    }

  }
})
