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
    Subs.loadFollowing(activeUsername, null, true, function(user, count) {
      console.log('Loaded '+count+' following for '+user)
    })
    Subs.loadFollowers(activeUsername, null, true, function(user, count) {
      console.log('Loaded '+count+' followers for '+user)
    })
    Users.refreshUsers([activeUsername], function() {
      setTimeout(function(){
        // ui shenanigans
        Template.sidebar.dropdownDTC()
  
        $('#dispDTC').popup({
          position : 'bottom center',
        })
      
        $('#dispVT').popup({
          position : 'bottom center',
        })
      }, 200)
    })
    if (!UserSettings.get('voteWeight')) {
      UserSettings.set('voteWeight', 5)
    }
    Videos.loadFeed(activeUsername)
    if (!noreroute)
      FlowRouter.go('#!/')

    
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
          privatekey: event.target.privatekey.value,
          network: 'avalon'
        }
        try {
          user.publickey = avalon.privToPub(user.privatekey)
        } catch (e) {
          toastr.error(translate('LOGIN_ERROR_WRONG_POSTING_KEY'), translate('ERROR_TITLE'))
          return
        }

        var allowedTxTypes = []
        if (chainuser.pub == user.publickey)
          allowedTxTypes = [0,1,2,3,4,5,6,7,8,10,11,12,13,14,15]
        for (let i = 0; i < chainuser.keys.length; i++)
          if (chainuser.keys[i].pub == user.publickey)
            allowedTxTypes = chainuser.keys[i].types
  
        if (allowedTxTypes.length > 0) {
          // correct key for the user, loggin in
          user.username = username
          user._id = user.network+'/'+user.username
          console.log(event.target.rememberme.checked)
          if (event.target.rememberme.checked === false)
            user.temporary = true

          console.log(user)
          Users.upsert({_id: user._id}, user, function() {
            Template.loginavalon.success(user.username)
          })
        } else {
          toastr.error(translate('LOGIN_ERROR_AUTHENTIFICATION_FAILED'), translate('ERROR_TITLE'))
        }
      });
    }
  })
  