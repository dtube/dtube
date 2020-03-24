Template.login.rendered = () => {
  Session.set('loginSelectionStep',true)
  Session.set('loginAvalonStep',false)
  Session.set('loginHiveStep',false)
  Session.set('loginSteemStep',false)
  Session.set('forcePostingKeyHive',false)
  Session.get('forcePostingKey',false)
}

Template.login.helpers({
  noAvalonLogin: () => {
    return !Session.get('activeUsername')
  },
  noHiveLogin: () => {
    return !Session.get('activeUsernameHive')
  },
  noSteemLogin: () => {
    return !Session.get('activeUsernameSteem')
  },
  isSelectingNetwork: () => {
    return Session.get('loginSelectionStep')
  },
  isAvalonAuth: () => {
    return Session.get('loginAvalonStep')
  },
  isHiveAuth: () => {
    return Session.get('loginHiveStep')
  },
  isSteemAuth: () => {
    return Session.get('loginSteemStep')
  },
})

Template.login.events({
  'click #loginNext': () => {
    let selected = $("input[name='network']:checked").val()
    if (selected) Session.set('loginSelectionStep',false)

    switch (selected) {
      case 'Avalon':
        Session.set('loginAvalonStep',true)
        break
      case 'Hive':
        Session.set('loginHiveStep',true)
        break
      case 'Steem':
        Session.set('loginSteemStep',true)
        break
      default:
        toastr.error(translate('LOGIN_ERROR_NO_SELECTED_NETWORK'),translate('ERROR_TITLE'))
        break
    }
  }
})