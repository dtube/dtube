Template.loginsteem.rendered = () => {
  if (!Session.get('currentNonLoginPath') || Session.get('currentNonLoginPath').startsWith('/login'))
    Session.set('currentNonLoginPath','/')
  Template.settingsdropdown.nightMode()
}

Template.loginsteem.helpers({
    users: function() {
      return Users.find().fetch()
    },
    usingKeyChain: function() {
      if (!window.steem_keychain)
        return false
      if (Session.get('forcePostingKey'))
        return false
      return true
    }
  })
  
  Template.loginsteem.success = function(activeUsername, noreroute) {
    Session.set('activeUsernameSteem', activeUsername)
    if (!UserSettings.get('voteWeightSteem')) UserSettings.set('voteWeightSteem', 100)
    Videos.loadFeed(activeUsername)
    if (!noreroute)
      FlowRouter.go('#!'+Session.get('currentNonLoginPath'))

    // check if subscribed to dtube hive
    steem.api.call('bridge.list_all_subscriptions', {account: Session.get('activeUsernameSteem')}, function(e,hives) {
      if (!e) {
        var isSubd = false
        for (let i = 0; i < hives.length; i++) {
          if (hives[i][0] == 'hive-196037') {
            isSubd = true
          }
        }
        if (!isSubd) {
          console.log('Subscribing to hive...')
          broadcast.steem.subHive(function(){
            console.log('Subscribed to hive...')
          })
        }
      }
    })

    Template.accountsdropdown.refreshNetworkSwitch()
  }
  
  Template.loginsteem.events({
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
            var currentUser = Session.get('activeUsernameSteem')
            var username = response.data.username;
            if (currentUser == username)
            {
              toastr.error(translate('LOGIN_ERROR_ALREADY_LOGGED'), translate('ERROR_TITLE'))
              return
            }
            var user = {
                username: response.data.username,
                type: "keychain",
                network: "steem"
            }
            user._id = user.network+'/'+user.username  
            Users.upsert({_id: user._id}, user, function() {
              Template.loginsteem.success(user.username)
            })
          } else {
            toastr.error(translate('LOGIN_ERROR_AUTHENTIFICATION_FAILED'), translate('ERROR_TITLE'));
          }
      });
    },
    'submit .form': function(event) {
      event.preventDefault()
      var currentUser = Session.get('activeUsernameSteem')
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
          type: "posting",
          network: "steem"
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
          user._id = user.network+'/'+user.username
          if (event.target.rememberme.checked === false)
            user.temporary = true

          Users.upsert({_id: user._id}, user, function() {
            Template.loginsteem.success(user.username)
          })
        } else {
          toastr.error(translate('LOGIN_ERROR_AUTHENTIFICATION_FAILED'), translate('ERROR_TITLE'))
        }
      });
    }
  })