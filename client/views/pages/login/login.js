Template.login.helpers({
  users: function() {
    return Users.find().fetch()
  }
})

Template.login.success = function(activeUsername, noreroute) {
  Session.set('activeUsername', activeUsername)
  if (!UserSettings.get('voteWeight')) UserSettings.set('voteWeight', 100)
  Videos.loadFeed(activeUsername)
  if (!noreroute)
    FlowRouter.go('#!/')
  DTalk.login(function() {
    DTalk.checkInbox()
  })
}

Template.login.events({
  'click #loginbuttonsc2': function(event) {
    event.preventDefault()
    var url = sc2.getLoginURL()
    console.log(url)
    window.location.href = url
  },
  'submit .form': function(event) {
    event.preventDefault()
    var currentUser = Session.get('activeUsername')
    var username = event.target.username.value.toLowerCase().replace('@','');
    if (currentUser == username)
    {
      toastr.error(translate('LOGIN_ERROR_ALREADY_LOGGED'), translate('ERROR_TITLE'))
      return
    }
    var username = event.target.username.value.toLowerCase().replace('@','');
    var privatekey = event.target.privatekey.value;
    if (!username || !privatekey) {
      toastr.error(translate('LOGIN_ERROR_EMPTY_USERNAME_POSTING_KEY'), translate('ERROR_TITLE'))
      return
    }
    steem.api.getAccounts([username], function(err, result) {
      if (!result || result.length < 1) {
        toastr.error(translate('LOGIN_ERROR_UNKNOWN_USERNAME'), translate('ERROR_TITLE'))
        return
      }
      var chainuser = result[0]
      var user = {
        privatekey: event.target.privatekey.value
      }
      try {
        user.publickey = steem.auth.wifToPublic(user.privatekey)
      } catch (e) {
        toastr.error(translate('LOGIN_ERROR_WRONG_POSTING_KEY'), translate('ERROR_TITLE'))
        return
      }

      if (chainuser.posting.key_auths[0][0] == user.publickey) {
        // correct key for the user, loggin in
        user.username = username
        if (event.target.rememberme.checked) {
          Waka.db.Users.upsert(user, function() {
            Users.remove({})
            Users.refreshLocalUsers()
            Template.login.success(user.username)
          })
        } else {
          Users.insert(user)
          Template.login.success(user.username)
          Users.refreshUsers([user.username])
          steem.api.getAccounts([user.username], function(e, chainusers) {
            for (var i = 0; i < chainusers.length; i++) {
              var user = Users.findOne({username: chainusers[i].name})
              if (chainusers[i].json_metadata && JSON.parse(chainusers[i].json_metadata))
                user.json_metadata = JSON.parse(chainusers[i].json_metadata)
              Users.update({username: user.username}, user)
            }
          })
        }
      } else {
        toastr.error(translate('LOGIN_ERROR_AUTHENTIFICATION_FAILED'), translate('ERROR_TITLE'))
      }
    });
  }
})
