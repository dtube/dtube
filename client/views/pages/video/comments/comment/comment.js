Template.comment.events({
  'click .downvoteComment': function (event) {
    var refs = $(event.target).data('refs')
    if (!refs) refs = $(event.target).parent().data('refs')
    if (!refs) refs = []
    else refs = refs.split(',')
    var id = $(event.target).data('id')
    if (!id) id = $(event.target).parent().data('id')
    refs.push(id)
    var weight = UserSettings.get('voteWeight') * -100
    var weightSteem = UserSettings.get('voteWeightSteem') * -100

    broadcast.multi.vote(refs, weight, weightSteem, '', function (err, result) {
      if (err) toastr.error(Meteor.blockchainError(err), translate('GLOBAL_ERROR_COULD_NOT_VOTE'))
      else {
        toastr.success(translate('GLOBAL_ERROR_VOTE_FOR', weight / 100 + '%', id))
        // var audio = new Audio('http://localhost:3000/DTube_files/sounds/coin-drop-1.mp3');
        // audio.play();
      }
      Template.video.loadState()
    });
  },
  'click .upvoteComment': function (event) {
    var refs = $(event.target).data('refs')
    if (!refs) refs = $(event.target).parent().data('refs')
    if (!refs) refs = []
    else refs = refs.split(',')
    var id = $(event.target).data('id')
    if (!id) id = $(event.target).parent().data('id')
    refs.push(id)
    var weight = UserSettings.get('voteWeight') * 100
    var weightSteem = UserSettings.get('voteWeightSteem') * 100
    
    broadcast.multi.vote(refs, weight, weightSteem, '', function (err, result) {
      if (err) toastr.error(Meteor.blockchainError(err), translate('GLOBAL_ERROR_COULD_NOT_VOTE'))
      else {
        toastr.success(translate('GLOBAL_ERROR_VOTE_FOR', weight / 100 + '%', id))
        // var audio = new Audio('http://localhost:3000/DTube_files/sounds/coin-drop-1.mp3');
        // audio.play();
      }
      Template.video.loadState()
    });
  }
})

Template.comment.helpers({
  currentAuthor: function () {
    return FlowRouter.getParam("author")
  },
  picture: function(id) {
    var username = id.split('/')[1]
    if (id.split('/')[0] == 'steem') {
      return 'https://steemitimages.com/u/'+username+'/avatar/'
    }
    else if (id.split('/')[0] == 'dtc') {
      return 'https://image.d.tube/u/'+username+'/avatar/'
    }
  }
})
Template.comment.rendered = function () {
  Template.settingsdropdown.nightMode();
}

 
  

