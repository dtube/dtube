Template.settingsdropdown.rendered = function() {
  $('.dropdownsettings').dropdown({
    onChange: function(value,text,e) {
      if (e.hasClass('voteWeight')) {
        var currentPercent = Session.get('voteWeight')
        var nextPercent = currentPercent+parseInt(value)
        if (nextPercent>100) nextPercent = 100
        if (nextPercent<1) nextPercent = 1
        Session.set('voteWeight', nextPercent)
      } else if (e.hasClass('ipfsGateway')) {
        Session.set('ipfsGateway', value)
      } else if (e.hasClass('ipfsUpload')) {
        Session.set('ipfsUpload', {
          host: value.split('://')[1].split(':')[0],
          port: value.split('://')[1].split(':')[1],
          protocol: value.split('://')[0]
        })
      } else {
        console.log(value,text,e)
      }
      e.stopPropagation();
    }
  })

  Session.set('voteWeight', 100)
  // random gateway to maximise propagation in gateways cache
  Session.set('ipfsGateway', Meteor.settings.public.displayNodes[Math.floor(Math.random() * Meteor.settings.public.displayNodes.length)])
  // first upload node by default
  Session.set('ipfsUpload', Meteor.settings.public.uploadNodes[0].node)
}

Template.settingsdropdown.helpers({
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
    return Meteor.settings.public.uploadNodes;
  },
  displayNodes: function() {
    return Meteor.settings.public.displayNodes;
  }
})

Template.settingsdropdown.events({
  'change .votepercentinput, keyup .votepercentinput': function(event) {
    console.log(event.target.value)
  }
})
