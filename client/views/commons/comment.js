Template.comment.events({
  'click .upvoteComment': function(event) {
    var wif = Users.findOne({username: Session.get('activeUsername')}).privatekey
    var voter = Users.findOne({username: Session.get('activeUsername')}).username
    var author = $(event.target).data('author')
    if (!author) author = $(event.target).parent().data('author')
    var permlink = $(event.target).data('permlink')
    if (!permlink) permlink = $(event.target).parent().data('permlink')
    var weight = 10000 // 100%
    console.log(wif, voter, author, permlink, weight)
    steem.broadcast.vote(wif, voter, author, permlink, weight, function(err, result) {
      Template.video.loadState()
    });
  },
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
  }
})
