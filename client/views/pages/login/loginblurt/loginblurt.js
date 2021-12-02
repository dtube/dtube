Template.loginblurt.rendered = () => {
  if (!Session.get('currentNonLoginPath') || Session.get('currentNonLoginPath').startsWith('/login'))
    Session.set('currentNonLoginPath','/')
  Template.settingsdropdown.nightMode()
}
Template.loginblurt.helpers({
  users: function() {
    return Users.find().fetch()
  },
  usingBlurtKeychain: function() {
    if (!window.blurt_keychain)
      return false
    if (Session.get('forcePostingKeyBlurt'))
      return false
    return true
  }
})

Template.loginblurt.events({
  'click #loginforceprivatekey': () => {
    Session.set('forcePostingKeyBlurt', true)
  },
  'click #loginkeychain': function(event) {
    event.preventDefault()
    if(!window.blurt_keychain) {
        // Blurt Keychain extension not installed...
        toastr.error(translate('LOGIN_ERROR_BLURT_KEYCHAIN_NOT_INSTALLED'), translate('ERROR_TITLE'))
        return
    }
    blurt_keychain.requestHandshake(function() {
        console.log('Handshake received!')
    })
    let username = document.getElementById("keychain_username").value.toLowerCase().replace('@','')
    blurt_keychain.requestSignBuffer(username, "dtube_login-" + Math.round(99999999999*Math.random()), "Posting", function(response) {
        if(response.success === true) {
          let currentUser = Session.get('activeUsernameBlurt')
          let username = response.data.username
          if (currentUser == username)
          {
            toastr.error(translate('LOGIN_ERROR_ALREADY_LOGGED'), translate('ERROR_TITLE'))
            return
          }
          let user = {
              username: response.data.username,
              type: "keychain",
              network: "blurt"
          }
          user._id = user.network+'/'+user.username
          Users.upsert({_id: user._id}, user, function() {
            Template.loginblurt.success(user.username)
          })
        } else {
          toastr.error(translate('LOGIN_ERROR_AUTHENTIFICATION_FAILED'), translate('ERROR_TITLE'))
        }
    })
  },
  'submit .form': function(event) {
    event.preventDefault()
    var currentUser = Session.get('activeUsernameBlurt')
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
    blurt.api.getAccounts([username], function(err, result) {
      if (!result || result.length < 1) {
        toastr.error(translate('LOGIN_ERROR_UNKNOWN_USERNAME'), translate('ERROR_TITLE'))
        return
      }
      var chainuser = result[0]
      var user = {
        privatekey: event.target.privatekey.value,
        type: "posting",
        network: "blurt"
      }
      try {
        user.publickey = blurt.auth.wifToPublic(user.privatekey)
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
          Template.loginblurt.success(user.username)
        })
      } else {
        toastr.error(translate('LOGIN_ERROR_AUTHENTIFICATION_FAILED'), translate('ERROR_TITLE'))
      }
    })
  }
})

Template.loginblurt.success = function(activeUsername, noreroute) {
  Session.set('activeUsernameBlurt', activeUsername)
  if (!UserSettings.get('voteWeightBlurt')) UserSettings.set('voteWeightBlurt', 100)
  Videos.loadFeed(activeUsername)
  if (!noreroute)
    FlowRouter.go('#!'+Session.get('currentNonLoginPath'))

  /* TODO: Blurt Communities
  // check if subscribed to dtube blurt
  blurt.api.call('bridge.list_all_subscriptions', {account: Session.get('activeUsernameBlurt')}, function(e,hives) {
    ...
  })
  */

  Template.accountsdropdown.refreshNetworkSwitch()
}