Template.settingsdropdown.rendered = function() {
  $('.dropdownsettings').dropdown({
    action: function(text, value, e) {
      var e = $(e)
      if (e.hasClass('voteWeight')) {
        var currentPercent = UserSettings.get('voteWeight')
        var nextPercent = currentPercent+parseInt(value)
        if (nextPercent>100) nextPercent = 100
        if (nextPercent<1) nextPercent = 1
        UserSettings.set('voteWeight', nextPercent)
      } else if (e.hasClass('ipfsGateway')) {
        if (e.hasClass('automatic')) Session.set('ipfsGateway', 'automatic')
        else Session.set('ipfsGateway', value)
      } else if (e.hasClass('ipfsUpload')) {
        Session.set('ipfsUpload', {
          host: value.split('://')[1].split(':')[0],
          port: value.split('://')[1].split(':')[1],
          protocol: value.split('://')[0]
        })
      } else if (e.hasClass('nsfwSetting')) {
        if (e.hasClass('nsfwShow')) Session.set('nsfwSetting', 'Show')
        if (e.hasClass('nsfwHide')) Session.set('nsfwSetting', 'Fully Hidden')
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
      } else if (e.hasClass('palNet')) {
        Videos.remove({})
        Session.set('scot', {
            "token": "PAL",
            "precision": 0,
            "displayedPrecision": 0,
            "tag": "palnet",
            "logo": "https://i.imgsafe.org/15/15bdc8a5ba.png",
            "logonight": "https://i.imgsafe.org/15/15bdc8a5ba.png"
          })
        Session.set('lastHot', null)
          Session.set('lastTrending', null)
          Session.set('lastCreated', null)
          Session.set('lastBlogs', {})
        
        Videos.refreshBlockchain(function() {
          Videos.refreshWaka()
        })
      } else {
        //console.log(value,text,e)
      }
    }
  })
  Session.set('nsfwSetting', 'Fully Hidden')
  Session.set('ipfsGateway', 'automatic')

  Template.settingsdropdown.nightMode();
}

Template.settingsdropdown.helpers({
  nsfwSetting: function() {
    return Session.get('nsfwSetting');
  },
  ipfsUpload: function() {
    return Session.get('ipfsUpload');
  },
  ipfsGateway: function() {
    return Session.get('ipfsGateway');
  },
  uploadNodes: function() {
    return Session.get('remoteSettings').uploadNodes;
  },
  displayNodes: function() {
    return Session.get('remoteSettings').displayNodes;
  },
  localIpfs: function() {
    return Session.get('localIpfs')
  },
  isInNightMode:function() {
    return UserSettings.get('isInNightMode')
  },
  SteemAPIs: function() {
    return Session.get('remoteSettings').APINodes;
  },
  CurrentAPI: function() {
    return Session.get('steemAPI');
  },
})


Template.settingsdropdown.nightMode = function()
{
  if (UserSettings.get('isInNightMode')) {
    Template.settingsdropdown.switchToNightMode();
  }
}

Template.settingsdropdown.switchToNightMode = function (){
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

  $('.main.menu.fixed').addClass('nightmode');
  $('.step').addClass('nightmode');
  $('.sidebar').addClass('nightmodegray');
  $('.sidebar.fixed').removeClass('inverted');
  $('.ui.menu .item:before').addClass('nightmodeinverted');
  $('.ellipsis.horizontal.icon').addClass('nightmode');

  //LOGO
  $('.blacklogo').addClass('dsp-non');
  $('.whitelogo').removeClass('dsp-non');
}

Template.settingsdropdown.switchToNormalMode = function (){
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

  $('.main.menu.fixed').removeClass('nightmode');
  $('.step').removeClass('nightmode');
  $('.sidebar').removeClass('nightmodegray');
  $('.sidebar.fixed').addClass('inverted');
  $('.ui.menu .item:before').removeClass('nightmodeinverted');
  $('.ellipsis.horizontal.icon').removeClass('nightmode');

  //LOGO
  $('.blacklogo').removeClass('dsp-non');
  $('.whitelogo').addClass('dsp-non');
}
