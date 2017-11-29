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
}
})
