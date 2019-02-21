Template.login.helpers({
  users: function() {
    return Users.find().fetch()
  },
  usingKeyChain: function() {
    if (!Session.get('steem_keychain'))
      return false
    if (Session.get('forcePostingKey'))
      return false
    return true
  }
})

Template.login.success = function(activeUsername, noreroute) {
  Session.set('activeUsername', activeUsername)
  if (!UserSettings.get('voteWeight')) UserSettings.set('voteWeight', 100)
  Videos.loadFeed(activeUsername)
  if (!noreroute)
    FlowRouter.go('#!/')
  DTalk.login(function() {
    Session.set('gunUser', gun.user().is)
    DTalk.checkInbox()
  })
}

Template.login.events({
  'click #loginforceprivatekey': function(event) {
    Session.set('forcePostingKey', true)
  },
  'click #loginkeychain': function(event) {
    event.preventDefault()
    if(!window.steem_keychain) {
        // Steem Keychain extension not installed...
        toastr.error(translate('LOGIN_ERROR_KEYCHAIN_NOT_INSTALLED'), translate('ERROR_TITLE'))
        return;
    }
    steem_keychain.requestHandshake(function() {
        console.log('Handshake received!'); 
    });
    var username = document.getElementById("keychain_username").value.toLowerCase().replace('@','');
    steem_keychain.requestSignBuffer(username, "dtube_login-" + Math.round(99999999999*Math.random()), "Posting", function(response) {
        if(response.success === true) {
            var currentUser = Session.get('activeUsername')
            var username = response.data.username;
            if (currentUser == username)
            {
              toastr.error(translate('LOGIN_ERROR_ALREADY_LOGGED'), translate('ERROR_TITLE'))
              return
            }
            var user = {
               username: response.data.username,
               type: "keychain"
            }
            Waka.db.Users.upsert(user, function() {
              Users.remove({})
              Users.refreshLocalUsers(function(err) {
                Template.login.success(user.username)
              })
          })
        } else {
          toastr.error(translate('LOGIN_ERROR_AUTHENTIFICATION_FAILED'), translate('ERROR_TITLE'));
        }
    });
    /*steem_keychain.requestVerifyKey(Session.get('activeUsername'), "dtube_login-" + String(Math.random()), "Posting", function(response) {
        console.log(response);
    });*/
  },
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
        privatekey: event.target.privatekey.value,
        type: "posting"
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
            Users.refreshLocalUsers(function(err) {
              Template.login.success(user.username)
            })
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
