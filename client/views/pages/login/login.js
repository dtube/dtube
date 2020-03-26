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
  isNightMode: () => {
    return UserSettings.get('isInNightMode')
  },
  randomOrder: () => {
    var a = ['steem', 'hive', 'dtc']
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
    Template.login.rendered()
  }
})
