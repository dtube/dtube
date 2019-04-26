Template.loginavalon.rendered = function() {
    Session.set("tmpKey", avalon.keypair())
}

Template.loginavalon.helpers({
    users: function() {
      return Users.find().fetch()
    },
    tmpKey: function() {
      return Session.get('tmpKey')
    }
  })
  
  Template.loginavalon.success = function(activeUsername, noreroute) {
    Session.set('activeUsername', activeUsername)
    if (!UserSettings.get('voteWeight')) {
      UserSettings.set('voteWeight', 5)
    }
    Videos.loadFeed(activeUsername)
    if (!noreroute)
      FlowRouter.go('#!/')
    // DTalk.login(function() {
    //   Session.set('gunUser', gun.user().is)
    //   DTalk.checkInbox()
    // })
  }
  
  Template.loginavalon.events({
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
      avalon.getAccount(username, function(err, chainuser) {
        if (err) console.log(err)
        if (!chainuser) {
          toastr.error(translate('LOGIN_ERROR_UNKNOWN_USERNAME'), translate('ERROR_TITLE'))
          return
        }
        var user = {
          privatekey: event.target.privatekey.value
        }
        try {
          user.publickey = avalon.privToPub(user.privatekey)
        } catch (e) {
          toastr.error(translate('LOGIN_ERROR_WRONG_POSTING_KEY'), translate('ERROR_TITLE'))
          return
        }
  
        if (chainuser.pub == user.publickey) {
          // correct key for the user, loggin in
          user.username = username
          if (event.target.rememberme.checked) {
            Waka.db.Users.upsert(user, function() {
              // Users.remove({})
              Users.refreshLocalUsers(function(err) {
                Template.loginavalon.success(user.username)
              })
            })
          } else {
            Users.insert(user)
            Template.loginavalon.success(user.username)
            Users.refreshUsers([user.username])
            // steem.api.getAccounts([user.username], function(e, chainusers) {
            //   for (var i = 0; i < chainusers.length; i++) {
            //     var user = Users.findOne({username: chainusers[i].name})
            //     if (chainusers[i].json_metadata && JSON.parse(chainusers[i].json_metadata))
            //       user.json_metadata = JSON.parse(chainusers[i].json_metadata)
            //     Users.update({username: user.username}, user)
            //   }
            // })
          }
        } else {
          toastr.error(translate('LOGIN_ERROR_AUTHENTIFICATION_FAILED'), translate('ERROR_TITLE'))
        }
      });
    }
  })
  