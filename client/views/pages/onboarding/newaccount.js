Template.newaccount.rendered = () => {
  Template.settingsdropdown.nightMode()
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
        Meteor.blockchainError(err)
      else {
          toastr.success("Account "+username+ " created")
          FlowRouter.go('/c/'+username)
      }
    })
  },
  'click #avalonkeygen': (e) => {
    e.preventDefault()
    Session.set('generatedKey',true)
  },
  'keyup #newacc_username': () => {
    if ($('#newacc_username').val()) {
      $('#newacc_username').val($('#newacc_username').val().trim().toLowerCase())
      $.ajax({
        url: avalon.config.api + '/accountPrice/' + $('#newacc_username').val(),
        success: (result) => {
          if (!isNaN(result))
            $('#newusernamedet').text('Account price: ' + (parseInt(result)/100) + ' DTC')
          else 
            $('#newusernamedet').text(result)
        }
      })
    }
    else 
      $('#newusernamedet').text('')
  }
})
