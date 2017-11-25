Template.login.helpers({
  users: function() {
    return Users.find().fetch()
  }
})

Template.login.events({
  'submit .form': function(event) {
    event.preventDefault()
    //TOCHECK
    var currentUser = Session.get('activeUsername')
    var username = event.target.username.value.toLowerCase().replace('@','');
    if (currentUser == username)
    {
      toastr.error(translate('LOGIN_ERROR_ALREADY_LOGGED'), translate('ERROR_TITLE'))
    }
    else
    {
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
              Session.set('activeUsername', user.username)
              Videos.loadFeed(user.username)
              FlowRouter.go('#!/')
            })
          } else {
            Users.insert(user)
            Session.set('activeUsername', user.username)
            Videos.loadFeed(user.username)
            Users.refreshUsers([user.username])
            FlowRouter.go('#!/')
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

    // getKeyReferences doesn't work for everyone it seems (eg: steeminator3000)
    // gotta use something else and ask for username unfortunatly
    // steem.api.getKeyReferences([publickey], function(err, result) {
    //   user.username = result[0][0]
    //   Waka.db.Users.upsert(user, function() {
    //     Users.refreshLocalUsers()
    //     Session.set('activeUsername', user.username)
    //     FlowRouter.go('/#!')
    //   })
    // });
  }
})

Template.login.rendered = function () {
  $(".ui.sidebar").sidebar('hide');
}