Template.login.helpers({
  users: function() {
    return Users.find().fetch()
  }
})

Template.login.events({
  'submit .form': function(event) {
    event.preventDefault()
    var privatekey = event.target.privatekey.value;
    var publickey = steem.auth.wifToPublic(privatekey)
    var user = {
      privatekey: event.target.privatekey.value
    }
    user.publickey = steem.auth.wifToPublic(user.privatekey)
    steem.api.getKeyReferences([publickey], function(err, result) {
      user.username = result[0][0]
      Waka.db.Users.upsert(user, function() {
        Users.refreshUsers()
        Session.set('activeUsername', user.username)
        FlowRouter.go('/')
      })
    });
  }
})
