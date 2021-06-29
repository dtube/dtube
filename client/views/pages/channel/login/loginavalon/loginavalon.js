Template.loginavalon.rendered = function() {
    Session.set("tmpKey", avalon.keypair())
    Template.settingsdropdown.nightMode()
}

Template.loginavalon.helpers({
    users: function() {
      return Users.find().fetch()
    },
    getFirstValidUsername: function() {
      if(Session.get('activeUsername')!==null) {
        return Session.get('activeUsername')
      }
      if(Session.get('activeUsernamHive')!==null) {
        return Session.get('activeUsernamHive')
      }
      if(Session.get('activeUsernameSteem')!==null) {
        return Session.get('activeUsernameSteem')
      }
    },
    tmpKey: function() {
      return Session.get('tmpKey')
    }
  })
  
  Template.loginavalon.success = function(activeUsername, noreroute, isSecurityKey) {
    Subs.loadFollowing(activeUsername, null, true, function(user, count) {
      console.log('Loaded '+count+' following for '+user)
    })
    Subs.loadFollowers(activeUsername, null, true, function(user, count) {
      console.log('Loaded '+count+' followers for '+user)
    })
    Users.refreshUsers([activeUsername], function() {
      setTimeout(function(){
        // ui shenanigans
        $('#dispDTC').popup({
          position : 'bottom center',
        })
      
        $('#dispVT').popup({
          position : 'bottom center',
        })
        if (!UserSettings.get('voteWeight')) {
          UserSettings.set('voteWeight', 1)
        }
      }, 200)
    })
    Videos.loadFeed(activeUsername)
    if (!noreroute)
      FlowRouter.go('#!/')
    if (isSecurityKey && typeof Session.get('activeUsername') == 'undefined')
      toastr.warning(translate('WARNING_SECURITY_KEY_LOGIN'),translate('WARNING_TITLE'))
    else if (!isSecurityKey && !noreroute && typeof Session.get('activeUsername') == 'undefined')
      toastr.success(translate('LOGIN_SUCCESS_CUSTOM_KEY'),translate('USERS_SUCCESS'))
    Session.set('activeUsername', activeUsername)
    Template.accountsdropdown.refreshNetworkSwitch()
  }
  
  Template.loginavalon.events({
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
          privatekey: event.target.privatekey.value,
          network: 'avalon'
        }
        try {
          user.publickey = avalon.privToPub(user.privatekey)
        } catch (e) {
          toastr.error(translate('LOGIN_ERROR_WRONG_POSTING_KEY'), translate('ERROR_TITLE'))
          return
        }

        let isSecurityKey = false
        var allowedTxTypes = []
        if (chainuser.pub == user.publickey) {
          allowedTxTypes = Array.from(Array(20).keys())
          isSecurityKey = true
        }
        for (let i = 0; i < chainuser.keys.length; i++)
          if (chainuser.keys[i].pub == user.publickey)
            allowedTxTypes = chainuser.keys[i].types
  
        if (allowedTxTypes.length > 0) {
          // correct key for the user, loggin in
          user.username = username
          user._id = user.network+'/'+user.username
          user.allowedTxTypes = allowedTxTypes
          if (event.target.rememberme.checked === false)
            user.temporary = true

          Users.upsert({_id: user._id}, user, function() {
            Template.loginavalon.success(user.username,false,isSecurityKey)
          })
        } else {
          toastr.error(translate('LOGIN_ERROR_AUTHENTIFICATION_FAILED'), translate('ERROR_TITLE'))
        }
      });
    }
  })
  