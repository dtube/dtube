Template.newaccount.helpers({
  newaccount: function () {
    return []
  }
})


Template.newaccount.events({
    'submit .form': function(event) {
      event.preventDefault()
      var username = event.target.newacc_username.value.toLowerCase().replace('@','').trim()
      var pub = event.target.newacc_publickey.value.trim()
      if (!username) {
          username = pub.toLowerCase()
          event.target.newacc_username.value = username
      }
      broadcast.avalon.newAccount(username, pub, function (err, result) {
        if (err)
          toastr.error(Meteor.blockchainError(err))
        else {
            toastr.success("Account "+username+ " created")
            FlowRouter.go('/c/'+username)
        }
      })
    }
})
