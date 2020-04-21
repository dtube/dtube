Template.newaccount.rendered = () => {
  Session.set('generatedKey',false)
}

Template.newaccount.helpers({
  newaccount: function () {
    return []
  },
  generatedKeys: () => {
    return Session.get('generatedKey')
  }
})


Template.newaccount.events({
  'submit .form': function(event) {
    event.preventDefault()
    var username = event.target.newacc_username.value.toLowerCase().replace('@','').trim()
    let pub
    if (Session.get('generatedKey'))
      pub = $('#avalonpub').val()
    else
      pub = event.target.newacc_publickey.value.trim()
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
  },
  'click #avalonkeygen': (e) => {
    e.preventDefault()
    Session.set('generatedKey',true)
  }
})
