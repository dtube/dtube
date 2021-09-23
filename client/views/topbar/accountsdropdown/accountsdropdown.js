let intervalVPChange = null
let vpChangeSpeed = 200

function updateVP(type, change) {
    if (type == 'steem') {
        var currentPercent = UserSettings.get('voteWeightSteem')
        var nextPercent = currentPercent+change
        if (nextPercent>100) nextPercent = 100
        if (nextPercent<1) nextPercent = 1
        UserSettings.set('voteWeightSteem', nextPercent)
    } else if (type === 'hive') {
        var currentPercent = UserSettings.get('voteWeightHive')
        var nextPercent = currentPercent+change
        if (nextPercent>100) nextPercent = 100
        if (nextPercent<1) nextPercent = 1
        UserSettings.set('voteWeightHive', nextPercent)
    } else if (type === 'blurt') {
        var currentPercent = UserSettings.get('voteWeightBlurt')
        var nextPercent = currentPercent+change
        if (nextPercent>100) nextPercent = 100
        if (nextPercent<1) nextPercent = 1
        UserSettings.set('voteWeightBlurt', nextPercent)
    } else {
        var currentPercent = UserSettings.get('voteWeight')
        var nextPercent = currentPercent+change
        if (nextPercent>100) nextPercent = 100
        if (nextPercent<1) nextPercent = 1
        UserSettings.set('voteWeight', nextPercent)
    }
    if (nextPercent != 1 && nextPercent != 100) {
        clearTimeout(intervalVPChange)
        intervalVPChange = setTimeout(function() {
            if (vpChangeSpeed > 50)
            vpChangeSpeed = 0.90*vpChangeSpeed
            updateVP(type, change)
        }, vpChangeSpeed)
    }
}

Template.accountsdropdown.rendered = () => {
    $('.dropdownaccounts').dropdown({
        action: (text,value,e) => {
            if ($(e).hasClass('logOut') && $(e).hasClass('logOutAvalon'))
                Users.remove({username: Session.get('activeUsername'), network: 'avalon'}, () => Session.set('activeUsername', null))
            else if ($(e).hasClass('logOut') && $(e).hasClass('logOutHive'))
                Users.remove({username: Session.get('activeUsernameHive'), network: 'hive'}, () => Session.set('activeUsernameHive', null))
            else if ($(e).hasClass('logOut') && $(e).hasClass('logOutSteem'))
                Users.remove({username: Session.get('activeUsernameSteem'), network: 'steem'}, () => Session.set('activeUsernameSteem', null))
            else if ($(e).hasClass('logOut') && $(e).hasClass('logOutBlurt'))
                Users.remove({username: Session.get('activeUsernameBlurt'), network: 'blurt'}, () => Session.set('activeUsernameBlurt', null))
        }
    })

    Template.accountsdropdown.refreshNetworkSwitch()
}

Template.accountsdropdown.refreshNetworkSwitch = () => {
    $('#dtcSwitch').prop('checked',!Session.get('isDTCDisabled'))
    $('#steemSwitch').prop('checked',!Session.get('isSteemDisabled'))
    $('#hiveSwitch').prop('checked',!Session.get('isHiveDisabled'))
    $('#blurtSwitch').prop('checked',!Session.get('isBlurtDisabled'))

    $('.dtcSwitch').checkbox().first().checkbox({
        onChecked: () => {
            Session.set('isDTCDisabled', false)
        },
        onUnchecked: () => {
            Session.set('isDTCDisabled', true)
        }
    })

    $('.steemSwitch').checkbox().first().checkbox({
        onChecked: () => {
            Session.set('isSteemDisabled', false)
        },
        onUnchecked: () => {
            Session.set('isSteemDisabled', true)
        }
    })

    $('.hiveSwitch').checkbox().first().checkbox({
        onChecked: () => {
            Session.set('isHiveDisabled', false)
        },
        onUnchecked: () => {
            Session.set('isHiveDisabled', true)
        }
    })

    $('.blurtSwitch').checkbox().first().checkbox({
      onChecked: () => {
          Session.set('isBlurtDisabled', false)
      },
      onUnchecked: () => {
          Session.set('isBlurtDisabled', true)
      }
    })
}

Template.accountsdropdown.helpers({
    incompleteLogin: () => {
        if (!Session.get('activeUsernameSteem')
          || !Session.get('activeUsernameHive')
          || !Session.get('activeUsernameBlurt')
          || !Session.get('activeUsername')) return true
        else return false
    },
    mainUser: function() {
        return Users.findOne({username: Session.get('activeUsername')})
    },
    mainUserSteem: function() {
        return Users.findOne({username: Session.get('activeUsernameSteem')})
    },
    mainUserHive: () => {
        return Users.findOne({username: Session.get('activeUsernameHive')})
    },
    mainUserBlurt: () => {
        return Users.findOne({username: Session.get('activeUsernameBlurt')})
    },
    topbarAvatarUrl: () => {
        if (Session.get('activeUsername')) return javalon.config.api + '/image/avatar/' + Session.get('activeUsername')
        else if (Session.get('activeUsernameHive')) return 'https://images.hive.blog/u/' + Session.get('activeUsernameHive') + '/avatar'
        else if (Session.get('activeUsernameSteem')) return 'https://steemitimages.com/u/' + Session.get('activeUsernameSteem') + '/avatar'
        else if (Session.get('activeUsernameBlurt')) return 'https://imgp.blurt.world/profileimage/' + Session.get('activeUsernameBlurt')
        else return javalon.config.api + '/image/avatar/null'
    },
    topbarUsername: () => {
        if (Session.get('activeUsername')) return Session.get('activeUsername')
        else if (Session.get('activeUsernameHive')) return Session.get('activeUsernameHive')
        else if (Session.get('activeUsernameSteem')) return Session.get('activeUsernameSteem')
        else if (Session.get('activeUsernameBlurt')) return Session.get('activeUsernameBlurt')
        else return ''
    },
    voteWeight: () => {
        return UserSettings.get('voteWeight');
    },
    voteWeightHive: () => {
        return UserSettings.get('voteWeightHive')
    },
    voteWeightSteem: () => {
        return UserSettings.get('voteWeightSteem')
    },
    voteWeightBlurt: () => {
      return UserSettings.get('voteWeightBlurt')
    }
})

Template.accountsdropdown.events({
    'mousedown #minus1vp': function() {
        updateVP('dtc', -1)
    },
    'mousedown #plus1vp': function() {
        updateVP('dtc', 1)
    },
    'mousedown #minus1vphive': function() {
        updateVP('hive', -1)
    },
    'mousedown #plus1vphive': function() {
        updateVP('hive', 1)
    },
    'mousedown #minus1vpsteem': function() {
        updateVP('steem', -1)
    },
    'mousedown #plus1vpsteem': function() {
        updateVP('steem', 1)
    },
    'mousedown #minus1vpblurt': function() {
      updateVP('blurt', -1)
    },
    'mousedown #plus1vpblurt': function() {
        updateVP('blurt', 1)
    },
    'touchstart #minus1vp': function() {
        updateVP('dtc', -1)
    },
    'touchstart #plus1vp': function() {
        updateVP('dtc', 1)
    },
    'touchstart #minus1vphive': function() {
        updateVP('hive', -1)
    },
    'touchstart #plus1vphive': function() {
        updateVP('hive', 1)
    },
    'touchstart #minus1vpsteem': function() {
        updateVP('steem', -1)
    },
    'touchstart #plus1vpsteem': function() {
        updateVP('steem', 1)
    },
    'touchstart #minus1vpblurt': function() {
      updateVP('blurt', -1)
    },
    'touchstart #plus1vpblurt': function() {
        updateVP('blurt', 1)
    },
    'mouseup #minus1vp, mouseup #plus1vp, mouseup #minus1vphive, mouseup #plus1vphive, mouseup #minus1vpsteem, mouseup #plus1vpsteem, mouseup #minus1vpblurt, mouseup #plus1vpblurt': function() {
        clearTimeout(intervalVPChange)
        vpChangeSpeed = 200
    },
    'touchend #minus1vp, touchend #plus1vp, touchend #minus1vphive, touchend #plus1vphive, touchend #minus1vpsteem, touchend #plus1vpsteem, touchend #minus1vpblurt, touchend #plus1vpblurt': function() {
        clearTimeout(intervalVPChange)
        vpChangeSpeed = 200
    }
})