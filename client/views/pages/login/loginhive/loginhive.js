Template.loginhive.rendered = () => {
  if (!Session.get('currentNonLoginPath') || Session.get('currentNonLoginPath').startsWith('/login'))
    Session.set('currentNonLoginPath','/')
  Template.settingsdropdown.nightMode()
}
Template.loginhive.helpers({
  users: function() {
    return Users.find().fetch()
  },
  usingHiveKeychain: function() {
    if (!window.hive_keychain)
      return false
    if (Session.get('forcePostingKeyHive'))
      return false
    return true
  }
})

Template.loginhive.events({
  'click #loginforceprivatekey': () => {
    Session.set('forcePostingKeyHive', true)
  },
  'click #loginkeychain': function(event) {
    event.preventDefault()
    if(!window.hive_keychain) {
        // Hive Keychain extension not installed...
        toastr.error(translate('LOGIN_ERROR_HIVE_KEYCHAIN_NOT_INSTALLED'), translate('ERROR_TITLE'))
        return
    }
    hive_keychain.requestHandshake(function() {
        console.log('Handshake received!')
    })
    let username = document.getElementById("keychain_username").value.toLowerCase().replace('@','')
    hive_keychain.requestSignBuffer(username, "dtube_login-" + Math.round(99999999999*Math.random()), "Posting", function(response) {
        if(response.success === true) {
          let currentUser = Session.get('activeUsernameHive')
          let username = response.data.username
          if (currentUser == username)
          {
            toastr.error(translate('LOGIN_ERROR_ALREADY_LOGGED'), translate('ERROR_TITLE'))
            return
          }
          let user = {
              username: response.data.username,
              type: "keychain",
              network: "hive"
          }
          user._id = user.network+'/'+user.username  
          Users.upsert({_id: user._id}, user, function() {
            Template.loginhive.success(user.username)
          })
        } else {
          toastr.error(translate('LOGIN_ERROR_AUTHENTIFICATION_FAILED'), translate('ERROR_TITLE'))
        }
    })
  },
  'submit .form': function(event) {
    event.preventDefault()
    var currentUser = Session.get('activeUsernameHive')
    var username = event.target.username.value.toLowerCase().replace('@','')
    if (currentUser == username)
    {
      toastr.error(translate('LOGIN_ERROR_ALREADY_LOGGED'), translate('ERROR_TITLE'))
      return
    }
    var username = event.target.username.value.toLowerCase().replace('@','')
    var privatekey = event.target.privatekey.value
    if (!username || !privatekey) {
      toastr.error(translate('LOGIN_ERROR_EMPTY_USERNAME_POSTING_KEY'), translate('ERROR_TITLE'))
      return
    }
    hive.api.getAccounts([username], function(err, result) {
      if (!result || result.length < 1) {
        toastr.error(translate('LOGIN_ERROR_UNKNOWN_USERNAME'), translate('ERROR_TITLE'))
        return
      }
      var chainuser = result[0]
      var user = {
        privatekey: event.target.privatekey.value,
        type: "posting",
        network: "hive"
      }
      try {
        user.publickey = hive.auth.wifToPublic(user.privatekey)
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
          Template.loginhive.success(user.username)
        })
      } else {
        toastr.error(translate('LOGIN_ERROR_AUTHENTIFICATION_FAILED'), translate('ERROR_TITLE'))
      }
    })
  }
})

Template.loginhive.success = function(activeUsername, noreroute) {
  Session.set('activeUsernameHive', activeUsername)
  if (!UserSettings.get('voteWeightHive')) UserSettings.set('voteWeightHive', 100)
  Videos.loadFeed(activeUsername)
  if (!noreroute)
    FlowRouter.go('#!'+Session.get('currentNonLoginPath'))

  // check if subscribed to dtube hive
  hive.api.call('bridge.list_all_subscriptions', {account: Session.get('activeUsernameHive')}, function(e,hives) {
    if (!e) {
      var isSubd = false
      for (let i = 0; i < hives.length; i++) {
        if (hives[i][0] == 'hive-196037') {
          isSubd = true
        }
      }
      if (!isSubd) broadcast.hive.subHive(() => console.log('Subscribed to hive...'))
    }
  })

  Template.accountsdropdown.refreshNetworkSwitch()
}