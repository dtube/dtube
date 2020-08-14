Template.settingsdropdown.rendered = function() {
    $('.dropdownsettings').dropdown({
        action: function(text, value, e) {
            var e = $(e)
            if (e.hasClass('voteWeight')) {
                var currentPercent = UserSettings.get('voteWeight')
                var nextPercent = currentPercent + parseInt(value)
                if (nextPercent > 100) nextPercent = 100
                if (nextPercent < 1) nextPercent = 1
                UserSettings.set('voteWeight', nextPercent)
            } else if (e.hasClass('ipfsGateway')) {
                if (e.hasClass('automatic')) Session.set('ipfsGateway', 'automatic')
                else Session.set('ipfsGateway', value)
            } else if (e.hasClass('steemApi')) {
                steem.api.setOptions({ url: value, useAppbaseApi: true });
                Session.set('steemAPI', value)
                localStorage.setItem('steemAPI', value);
            } else if (e.hasClass('avalonApi')) {
                javalon.init({ api: value })
                Session.set('avalonAPI', value)
                localStorage.setItem('avalonAPI', value)
            } else if (e.hasClass('hiveApi')) {
                hive.api.setOptions({ url: value, useAppbaseApi: true })
                Session.set('hiveAPI', value)
                localStorage.setItem('hiveAPI', value)
            } else if (e.hasClass('ipfsUpload')) {
                Session.set('ipfsUpload', {
                    host: value.split('://')[1].split(':')[0],
                    port: value.split('://')[1].split(':')[1],
                    protocol: value.split('://')[0]
                })
            } else if (e.hasClass('nsfwSetting')) {
                if (e.hasClass('nsfwShow')) Session.set('nsfwSetting', 'Show')
                if (e.hasClass('nsfwBlur')) Session.set('nsfwSetting', 'Blurred')
                if (e.hasClass('nsfwHide')) Session.set('nsfwSetting', 'Fully Hidden')
                localStorage.setItem("nsfwSetting", Session.get('nsfwSetting'))
            } else if (e.hasClass('censorSetting')) {
                if (e.hasClass('censorShow')) Session.set('censorSetting', 'Show')
                if (e.hasClass('censorBlur')) Session.set('censorSetting', 'Blurred')
                if (e.hasClass('censorHide')) Session.set('censorSetting', 'Fully Hidden')
                localStorage.setItem("censorSetting", Session.get('censorSetting'))
            } else if (e.hasClass('repogc')) {
                localIpfs.repo.gc()
            } else if (e.hasClass('nightMode')) {
                if (!UserSettings.get('isInNightMode')) {
                    Template.settingsdropdown.switchToNightMode();
                } else {
                    Template.settingsdropdown.switchToNormalMode();
                }
                UserSettings.set('isInNightMode', !UserSettings.get('isInNightMode'))
            } else if (e.hasClass('languages')) {
                Session.set('selectortype', 'languages');

                Template.mobileselector.revealMenu('bottom');
            } else if (e.hasClass('steemApi')) {
                steem.api.setOptions({ url: value, useAppbaseApi: true });
                Session.set('steemAPI', value)
                localStorage.setItem('steemAPI', value);
            } else {
                //console.log(value,text,e)
            }
        },
        direction: "downward"
    })
    if (!Session.get('nsfwSetting')) {
        if (Meteor.settings.public.scot && Meteor.settings.public.scot.nsfw)
            Session.set('nsfwSetting', 'Show')
        else
            Session.set('nsfwSetting', 'Fully Hidden')
    }

    if (!Session.get('censorSetting'))
        Session.set('censorSetting', 'Blurred')
    Session.set('ipfsGateway', 'automatic')

    Template.settingsdropdown.nightMode();
}


Template.settingsdropdown.nightMode = function() {
    if (UserSettings.get('isInNightMode')) {
        Template.settingsdropdown.switchToNightMode();
    }
}

Template.settingsdropdown.switchToNightMode = function() {
    //BODY
    $('.pushable').addClass('nightmode');
    $('.pusher').addClass('nightmode');
    $('.article').addClass('nightmode');
    $('body').addClass('nightmode');

    //TEXT
    $('.customlink').addClass('nightmodetext');
    $('.customtitlelink').addClass('nightmodetext');
    $('.dtubesidebartitle').addClass('nightmodetext');
    $('.videosnaprest').addClass('nightsecondarytext');
    $('.videosnapauthor').addClass('nightsecondarytext');
    $('.videosnaptime').addClass('nightsecondarytext');
    $('.videosnapdescription').addClass('nightsecondarytext');
    $('.videosnapdescriptionmobile').addClass('nightsecondarytext');
    $('.verticalvideosnaptitle').addClass('nightmodetext');
    $('.ui.item').addClass('nightmodetext');
    $('.menuitem').addClass('nightmodetext');
    $('#sidebar a').addClass('nightsecondarytext');
    $('.ui.toggle.checkbox label').addClass('nightmodetext');
    $('.ui.form .field > label').addClass('nightmodetext');
    $('.text').addClass('nightmodetext');
    $('.channelLink > a').addClass('nightmodetext');
    $('.header').addClass('nightmodetext');
    $('.ui.author').addClass('nightmodetext');
    $('.ui.votebutton').addClass('nightmodetext');
    $('.ui.comments .comment .metadata').addClass('nightsecondarytext');
    $('.description').addClass('nightsecondarytext');
    $('.videoshowmore').addClass('nightmodetext');
    $('.buttonlabel').addClass('nightbutton');
    $('.ui.checkbox label').addClass('nightmodetext');
    $('.crd-spa-lab').addClass('nightmode')
    $('.publishfield label').addClass('nightmodetext')
    $('.ui.checkbox + label').addClass('nightmode')
    $('.votebutton.voteslider').addClass('nightmodetext')
    $('.ui.icon.button.votebutton').addClass('nightmodetext')
    

    $('.ui.segments > .segment').addClass('nightsegment');
    $('.commentbutton').addClass('nightmodetext');
    $('.ui.comments .comment .actions a').addClass('nightsecondarytext');
    $('.owl-prev, .owl-next').addClass('nightmodegray');

    //COMPONENTS
    $('.menu').addClass('nightmode');
    $('.ui.segment').addClass('nightmode');
    $('.ui.card').addClass('nightmode');
    $('.sidebarlink').addClass('nightmodegray');
    $('.ui.secondary.segment').addClass('nightmodegray');
    $('.ui.header').addClass('nightmodetext');
    $('.item').addClass('nightmodetext');
    $('.videopayout').addClass('nightmodetext')
    $('.ui.about.segment').addClass('inverted')
    

    $('.main.menu.fixed').addClass('nightmode');
    $('.step').addClass('nightmode');
    $('.sidebar').addClass('nightmodegray');
    $('.sidebar.fixed').removeClass('inverted');
    $('.ui.menu .item:before').addClass('nightmodeinverted');
    $('.ellipsis.horizontal.icon').addClass('nightmode');
    $('.hsliderbackholder').addClass('invert');
    $('.vsliderbackholder').addClass('invert');
    $('.accordion').addClass('nightmodeaccordion')
    $('.ui.toggle.checkbox').addClass('nightmode')

    // LINKS
    $('a').addClass('nightmodelinks')

    // TABLES
    $('.channelrewardtbl').addClass('nightmodetable')
    $('.publishtbl').addClass('nightmodetable')
    
    // LEADERS
    $('.leader').addClass('nightmodeleader')
    $('.leader .disabled').addClass('nightmodeleader')
    $('.topleader').addClass('nightmodetopleader')
    $('.nontopleader').addClass('nightmodeleader')

    // LOGO
    $('.blacklogo').addClass('dsp-non');
    $('.whitelogo').removeClass('dsp-non');

    // ANNOUNCEMENT
    $('.announcement').addClass('black');
}

Template.settingsdropdown.switchToNormalMode = function() {
    //BODY
    $('.pushable').removeClass('nightmode');
    $('.pusher').removeClass('nightmode');
    $('.article').removeClass('nightmode');
    $('body').removeClass('nightmode');

    //TEXT
    $('.customlink').removeClass('nightmodetext');
    $('.customtitlelink').removeClass('nightmodetext');
    $('.dtubesidebartitle').removeClass('nightmodetext');
    $('.videosnaprest').removeClass('nightsecondarytext');
    $('.videosnapauthor').removeClass('nightsecondarytext');
    $('.videosnaptime').removeClass('nightsecondarytext');
    $('.videosnapdescription').removeClass('nightsecondarytext');
    $('.videosnapdescriptionmobile').removeClass('nightsecondarytext');
    $('.verticalvideosnaptitle').removeClass('nightmodetext');
    $('.ui.item').removeClass('nightmodetext');
    $('.menuitem').removeClass('nightmodetext');
    $('.dtubesidebarmenu').removeClass('nightsecondarytext');
    $('.ui.toggle.checkbox label').removeClass('nightmodetext');
    $('.ui.form .field > label').removeClass('nightmodetext');
    $('.text').removeClass('nightmodetext');
    $('.channelLink > a').removeClass('nightmodetext');
    $('.header').removeClass('nightmodetext');
    $('.ui.author').removeClass('nightmodetext');
    $('.ui.votebutton').removeClass('nightmodetext');
    $('.ui.comments .comment .metadata').removeClass('nightsecondarytext');
    $('.description').removeClass('nightsecondarytext');
    $('.videoshowmore').removeClass('nightmodetext');
    $('.buttonlabel').removeClass('nightbutton');
    $('.ui.checkbox label').removeClass('nightmodetext');
    $('.crd-spa-lab').removeClass('nightmode')
    $('.publishfield label').removeClass('nightmodetext')
    $('.ui.checkbox + label').removeClass('nightmode')
    $('.votebutton.voteslider').removeClass('nightmodetext')
    $('.ui.icon.button.votebutton').removeClass('nightmodetext')

    $('.ui.segments > .segment').removeClass('nightsegment');
    $('.commentbutton').removeClass('nightmodetext');
    $('.ui.comments .comment .actions a').removeClass('nightsecondarytext');
    $('.owl-prev, .owl-next').removeClass('nightmodegray');

    //COMPONENTS
    $('.menu').removeClass('nightmode');
    $('.ui.segment').removeClass('nightmode');
    $('.ui.card').removeClass('nightmode');
    $('.sidebarlink').removeClass('nightmodegray');
    $('.ui.secondary.segment').removeClass('nightmodegray');
    $('.ui.header').removeClass('nightmodetext');
    $('.item').removeClass('nightmodetext');
    $('.videopayout').removeClass('nightmodetext')
    $('.ui.about.segment').removeClass('inverted')

    $('.main.menu.fixed').removeClass('nightmode');
    $('.step').removeClass('nightmode');
    $('.sidebar').removeClass('nightmodegray');
    $('.sidebar.fixed').addClass('eded');
    $('.ui.menu .item:before').removeClass('nightmodeinverted');
    $('.ellipsis.horizontal.icon').removeClass('nightmode');
    $('.hsliderbackholder').removeClass('invert');
    $('.vsliderbackholder').removeClass('invert');
    $('.accordion').removeClass('nightmodeaccordion')
    $('.ui.toggle.checkbox').removeClass('nightmode')

    // LINKS
    $('a').removeClass('nightmodelinks')

    // TABLES
    $('.channelrewardtbl').removeClass('nightmodetable')
    $('.publishtbl').removeClass('nightmodetable')

    // LEADERS
    $('.leader').removeClass('nightmodeleader')
    $('.leader .disabled').removeClass('nightmodeleader')
    $('.topleader').removeClass('nightmodetopleader')
    $('.nontopleader').removeClass('nightmodeleader')

    //LOGO
    $('.blacklogo').removeClass('dsp-non');
    $('.whitelogo').addClass('dsp-non');

    // ANNOUNCEMENT
    $('.announcement').removeClass('black');
}