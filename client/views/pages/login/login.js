Template.login.rendered = () => {
  Session.set('loginSelectionStep',true)
  Session.set('loginAvalonStep',false)
  Session.set('loginHiveStep',false)
  Session.set('loginSteemStep',false)
  Session.set('forcePostingKeyHive',false)
  Session.get('forcePostingKey',false)
  if (!Session.get('activeUsername')) {
    Session.set('loginSelectionStep',false)
    Session.set('loginAvalonStep',true)
  }
  if (!Session.get('currentNonLoginPath') || Session.get('currentNonLoginPath').startsWith('/login'))
    Session.set('currentNonLoginPath','/')
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
  randomOrder: () => {
    var a = ['steem', 'hive']
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
})

Template.login.events({
  'click .loginOption': (event) => {
    var selected = $(event.currentTarget).data('network')
    Session.set('loginSelectionStep',false)
    Session.set('login'+selected+'Step',true)
  },
  'click .otherNetwork': () => {
    Session.set('loginSelectionStep',true)
    Session.set('loginAvalonStep',false)
    Session.set('loginHiveStep',false)
    Session.set('loginSteemStep',false)
    Session.set('forcePostingKeyHive',false)
    Session.get('forcePostingKey',false)
  },
  'click .logOut' : (event) => {
    var network = $(event.currentTarget).data('network')
    if (network == 'dtc')
      Users.remove({username: Session.get('activeUsername'), network: 'avalon'}, () => {
        Session.set('activeUsername', null)
        Template.settingsdropdown.nightMode()
      })
    else if (network == 'hive')
      Users.remove({username: Session.get('activeUsernameHive'), network: 'hive'}, () => {
        Session.set('activeUsernameHive', null)
        Template.settingsdropdown.nightMode()
      })
    else if (network == 'steem')
      Users.remove({username: Session.get('activeUsernameSteem'), network: 'steem'}, () => {
        Session.set('activeUsernameSteem', null)
        Template.settingsdropdown.nightMode()
      })
  }
})
