Template.settings.rendered = function () {
    Template.settingsdropdown.nightMode()
}

Template.settings.helpers({
    nsfwSetting: function() {
      return Session.get('nsfwSetting');
    },
    censorSetting: function() {
      return Session.get('censorSetting');
    },
    uploadNodes: function() {
      return Session.get('remoteSettings').uploadNodes;
    },
    SteemAPIs: function() {
      return Session.get('remoteSettings').APINodes;
    },
    AvalonAPIs: function() {
      return Session.get('remoteSettings').AvalonAPINodes
    },
    HiveAPIs: () => {
      return Session.get('remoteSettings').HiveAPINodes
    },
    CurrentAPI: function() {
      return Session.get('steemAPI');
    },
    CurrentAvalonAPI: function() {
      return Session.get('avalonAPI')
    },
    CurrentHiveAPI: () => {
        return Session.get('hiveAPI')
    },
    CurrentSteemAPI: () => {
        return Session.get('steemAPI')
    },
    displayNodes: function() {
      return Session.get('remoteSettings').displayNodes;
    },
    isInNightMode:function() {
      return UserSettings.get('isInNightMode')
    },
    currentLang:function() {
        var lang = UserSettings.get('language')
        if (!lang) lang = 'en'
        if (Meteor.settings.public.lang[lang])
            return Meteor.settings.public.lang[lang].name
        return lang
    },
    voteWeight: function() {
        return UserSettings.get('voteWeight')
    },
    voteWeightSteem: function() {
        return UserSettings.get('voteWeightSteem')
    },
    voteWeightHive: function() {
        return UserSettings.get('voteWeightHive')
    },
    buildVersion: function() {
        return Session.get('buildVersion')
    }
})

Template.settings.events({
    'change #avalonApi': function(event) {
        var value = $('#avalonApi').val()
        javalon.init({api: value})
        Session.set('avalonAPI',value)
        localStorage.setItem('avalonAPI',value)
    },
    'change #steemApi': function(event) {
        var value = $('#steemApi').val()
        steem.api.setOptions({ url: value, useAppbaseApi: true })
        Session.set('steemAPI', value)
        localStorage.setItem('steemAPI', value)
    },
    'change #hiveApi': function(event) {
        var value = $('#hiveApi').val()
        hive.api.setOptions({ url: value, useAppbaseApi: true })
        Session.set('hiveAPI', value)
        localStorage.setItem('hiveAPI', value)
    },
    'change #nsfwSetting': function(event) {
        var value = $('#nsfwSetting').val()
        Session.set('nsfwSetting', value)
        localStorage.setItem("nsfwSetting", Session.get('nsfwSetting'))
    },
    'change #censorSetting': function(event) {
        var value = $('#censorSetting').val()
        Session.set('censorSetting', value)
        localStorage.setItem("censorSetting", Session.get('censorSetting'))
    },
    'click #changeLanguage': function() {
        Session.set('selectortype', 'languages')
        Template.mobileselector.revealMenu('bottom')
    },
    'click #nightmodeSwitch': function() {
        if (!UserSettings.get('isInNightMode')) 
            Template.settingsdropdown.switchToNightMode()
        else 
            Template.settingsdropdown.switchToNormalMode()
        UserSettings.set('isInNightMode', !UserSettings.get('isInNightMode'))
    },
    'change #voteWeight': function() {
        var value = $('#voteWeight').val()
        UserSettings.set('voteWeight', value)
    }
})