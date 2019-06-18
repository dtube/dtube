Template.onboarding.rendered = function() {
    Session.set('avalonOnboarding', false)
    Session.set('step2status', 'Open SteemConnect')
    $('.message .close')
    .on('click', function() {
      $(this)
        .closest('.message')
        .transition('fade')
      ;
    })
  ;
}

Template.onboarding.helpers({
    newPubKey: function() {
        return Session.get('savedPubKey')
    },
    isSteem: function() {
        if (!Users.findOne({username: Session.get('activeUsernameSteem')}))
            return false
        if (!Users.findOne({username: Session.get('activeUsernameSteem')}).network)
            return true
        if (Users.findOne({username: Session.get('activeUsernameSteem')}).network == 'steem')
            return true

        return false
    },
    step2status: function() {
        return Session.get('step2status')
    },
    tmpSteemProfile: function() {
        return Session.get('tmpSteemProfile')
    }
})

Template.onboarding.events({
    'click .checkbox': function() {
        if ($('input[type=checkbox]:checked').length == $('input[type=checkbox]').length)
            $('#endStep1').removeClass('disabled')
        else
            $('#endStep1').addClass('disabled')
    },
    'click #endStep1': function() {
        Session.set('savedPubKey', $("#avalonpub").val())
        Session.set('savedPrivKey', $("#avalonpriv").val())
        $('#step1').hide()
        $('#step1d').addClass('completed')
        $('#step1d').removeClass('active')
        $('#step2').show()
        $('#step2d').addClass('active')
    },
    'click #endStep2': function() {
        var status = Session.get('step2status')
        if (status == 'Open SteemConnect') {
            var pub = Session.get('savedPubKey')
            var name = Session.get('activeUsernameSteem')
            var url = "https://steemconnect.com/sign/profile-update?dtube_pub="+pub+"&account="+name
            window.open(url, '_blank');
            Session.set('step2status', 'Confirm')
            return
        }
        if (status == 'Confirm') {
            $("#endStep2").addClass('disabled')
            $("#endStep2 > i.angle").addClass('dsp-non')
            $("#endStep2 > i.loading").removeClass('dsp-non')
            Session.set('step2status', 'Please wait...')
            // check avalon account every X secs
            function finishedStep2(account) {
                if (account.pub == Session.get('savedPubKey')) {
                    $('#step2').hide()
                    $('#step2d').addClass('completed')
                    $('#step2d').removeClass('active')
                    $('#step3').show()
                    $('#step3d').addClass('active')
                    clearInterval(checkingNewAcc)

                    steem.api.getAccounts([Session.get('activeUsernameSteem')], function(err, acc) {
                        var profile = null
                        try {
                            profile = JSON.parse(acc[0].json_metadata).profile
                        } catch (e) {
                            profile = {}
                        }
                        Session.set('tmpSteemProfile', profile)
                    })
                } else {
                    toastr.warning('This account has already been claimed before.')
                    Session.set('step2status', 'Confirm')
                    clearInterval(checkingNewAcc)
                    $("#endStep2").removeClass('disabled')
                    $("#endStep2 > i.angle").removeClass('dsp-non')
                    $("#endStep2 > i.loading").addClass('dsp-non')
                }
            }
            checkingNewAcc = setInterval(function() {
                avalon.getAccount(Session.get('activeUsernameSteem'), function(err, res) {
                    if (!err && res)
                        finishedStep2(res)
                })
            }, 5000)
            avalon.getAccount(Session.get('activeUsernameSteem'), function(err, res) {
                avalon.getAccount(Session.get('activeUsernameSteem'), function(err, res) {
                    if (!err && res)
                        finishedStep2(res)
                })
            })
        }
    },
    'click #endStep3': function() {
        $("#endStep3").addClass('disabled')
        $("#endStep3 > i.angle").addClass('dsp-non')
        $("#endStep3 > i.loading").removeClass('dsp-non')
        // logging in
        var user = {
            privatekey: Session.get('savedPrivKey'),
            publickey: Session.get('savedPubKey'),
            network: 'avalon',
            allowedTxTypes: [0,1,2,3,4,5,6,7,8,10,11,12,13,14,15],
            username: Session.get('activeUsernameSteem')
        }
        Waka.db.Users.upsert(user, function() {
            Users.remove({network: 'avalon'})
            Users.refreshLocalUsers(function(err) {
                Template.loginavalon.success(user.username, true)

                // updating profile
                var json = {profile: {}}
                json.profile.avatar = $('#profile_avatar').val()
                json.profile.cover_image = $('#profile_cover').val()
                json.profile.about = $('#profile_about').val()
                json.profile.location = $('#profile_location').val()
                json.profile.website = $('#profile_website').val()
                json.profile.steem = $('#profile_steem').val()
                broadcast.avalon.editProfile(json, function(err, res) {
                    if (err) toastr.error(Meteor.blockchainError(err))
                    else {
                        toastr.success(translate('GLOBAL_EDIT_PROFILE'))
                        FlowRouter.go('#!/')
                    }
                })
            })
        })
    },
})