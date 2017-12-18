Template.settingsdropdown.rendered = function() {
  $('.dropdownsettings').dropdown({
    action: function(text, value, e) {
      var e = $(e)
      if (e.hasClass('voteWeight')) {
        var currentPercent = Session.get('voteWeight')
        var nextPercent = currentPercent+parseInt(value)
        if (nextPercent>100) nextPercent = 100
        if (nextPercent<1) nextPercent = 1
        Session.set('voteWeight', nextPercent)
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
        if (!Session.get('isInNightMode')) {
          Template.settingsdropdown.switchToNightMode();
        } else {
          Template.settingsdropdown.switchToNormalMode();
        }
        Session.set('isInNightMode', !Session.get('isInNightMode'))
      } else {
        console.log(value,text,e)
      }
    }
  })
  Session.set('nsfwSetting', 'Fully Hidden')
  Session.set('voteWeight', 100)
  // random gateway to maximise propagation in gateways cache
  // Session.set('ipfsGateway', Session.get('remoteSettings').displayNodes[Math.floor(Math.random() * Session.get('remoteSettings').displayNodes.length-1)])
  Session.set('ipfsGateway', 'automatic')

  // random upload ipfs api
  Session.set('ipfsUpload', Session.get('remoteSettings').uploadNodes[Math.floor(Math.random() * (Session.get('remoteSettings').uploadNodes.length-1))].node)
  Template.settingsdropdown.nightMode();
}

Template.settingsdropdown.helpers({
  nsfwSetting: function() {
    return Session.get('nsfwSetting');
  },
  voteWeight: function() {
    return Session.get('voteWeight');
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
  isOnMobile: function () {
    if (/Mobi/.test(navigator.userAgent)) {
        return true;
    }
  },
  isInNightMode:function() {
    return Session.get('isInNightMode')
  }
})


Template.settingsdropdown.nightMode = function()
{
  if (Session.get('isInNightMode')) {
    Template.settingsdropdown.switchToNightMode();
  } 
}

Template.settingsdropdown.switchToNightMode = function (){
    //BODY
    $('.pushable').addClass('nightmode');
    $('.pusher').addClass('nightmode');
    $('.article').addClass('nightmode');

    //TEXT
    $('.customlink').addClass('nightmodetext');
    $('.dtubesidebaricon').addClass('nightmodetext');
    $('.videosnaprest').addClass('nightmodetext');
    $('.videosnapauthor').addClass('nightsecondarytext');
    $('.verticalvideosnaptitle').addClass('nightmodetext');
    $('.ui.item').addClass('nightmodetext');
    $('.menuitem').addClass('nightmodetext');
    $('.ui.toggle.checkbox label').addClass('nightmodetext');
    $('.ui.form .field > label').addClass('nightmodetext');
    $('.text').addClass('nightmodetext');
    $('.channelLink > a').addClass('nightmodetext');
    $('.header').addClass('nightmodetext');
    $('.ui.author').addClass('nightmodetext');
    $('.ui.votebutton').addClass('nightmodetext');
    $('.ui.comments .comment .metadata').addClass('nightsecondarytext');
    $('.videoshowmore').addClass('nightmodetext');

    
    $('.buttonlabel').addClass('nightbutton');

    $('.ui.segments > .segment').addClass('nightsegment');
    $('.commentbutton').addClass('nightmodetext');
    $('.ui.comments .comment .actions a').addClass('nightsecondarytext');
    $('.owl-prev, .owl-next').addClass('nightmodegray');

    //COMPONENTS
    $('.menu').addClass('nightmode');
    $('.ui.segment').addClass('nightmode');
    $('.ui.secondary.segment').addClass('nightmodegray');
    $('.ui.header').addClass('nightmodetext');
    $('.item').addClass('nightmodetext');
    $('.main.menu.fixed').addClass('nightmode');
    $('.sidebar').addClass('nightmodegray');
    $('.ui.menu .item:before').addClass('nightmodeinverted');
    $('.ellipsis.horizontal.icon').addClass('nightmode');

    //LOGO
    $('.blacklogo').addClass('displaynone');
    $('.whitelogo').removeClass('displaynone');
}

Template.settingsdropdown.switchToNormalMode = function (){
    //BODY
$('.pushable').removeClass('nightmode');
$('.pusher').removeClass('nightmode');
$('.article').removeClass('nightmode');

    //TEXT
$('.customlink').removeClass('nightmodetext');
$('.dtubesidebaricon').removeClass('nightmodetext');
$('.videosnaprest').removeClass('nightmodetext');
$('.videosnapauthor').removeClass('nightsecondarytext');
$('.verticalvideosnaptitle').removeClass('nightmodetext');
$('.ui.item').removeClass('nightmodetext');
$('.menuitem').removeClass('nightmodetext');
$('.ui.toggle.checkbox label').removeClass('nightmodetext');
$('.ui.form .field > label').removeClass('nightmodetext');
$('.text').removeClass('nightmodetext');
$('.channelLink > a').removeClass('nightmodetext');
$('.header').removeClass('nightmodetext');
$('.ui.author').removeClass('nightmodetext');
$('.ui.votebutton').removeClass('nightmodetext');
$('.ui.comments .comment .metadata').removeClass('nightsecondarytext');
$('.videoshowmore').removeClass('nightmodetext');
$('.buttonlabel').removeClass('nightbutton');

$('.ui.segments > .segment').removeClass('nightsegment');
$('.commentbutton').removeClass('nightmodetext');
$('.ui.comments .comment .actions a').removeClass('nightsecondarytext');
$('.owl-prev, .owl-next').removeClass('nightmodegray');

    //COMPONENTS
$('.menu').removeClass('nightmode');
$('.ui.segment').removeClass('nightmode');
$('.ui.secondary.segment').removeClass('nightmodegray');
$('.ui.header').removeClass('nightmodetext');
$('.item').removeClass('nightmodetext');

$('.main.menu.fixed').removeClass('nightmode');
$('.sidebar').removeClass('nightmodegray');
$('.ui.menu .item:before').removeClass('nightmodeinverted');
$('.ellipsis.horizontal.icon').removeClass('nightmode');

//LOGO
$('.blacklogo').removeClass('displaynone');
$('.whitelogo').addClass('displaynone');
}