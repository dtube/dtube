Template.settings.onRendered = function() {
  $('.ui.range').range({
    min: 0,
    max: 10,
    start: 5,
    step: 1,
  });
}

Template.settings.helpers({
  uploadNodes: function() {
    return Meteor.settings.public.uploadNodes;
  },
  displayNodes: function() {
    return Meteor.settings.public.displayNodes;
  }
})

Template.settings.events({
  'submit .form': function(event) {
    event.preventDefault()
    var ipfsUpload = event.target.ipfsUpload.value;
    for (var i = 0; i < Meteor.settings.public.uploadNodes.length; i++) {
      if (Meteor.settings.public.uploadNodes[i].owner == ipfsUpload) {
        ipfsUpload = Meteor.settings.public.uploadNodes[i].node
      }
    }
    var ipfsGateway = event.target.ipfsGateway.value;
    Session.set('ipfsGateway', ipfsGateway)
    Session.set('ipfsUpload', ipfsUpload)
    FlowRouter.go('/')
  }
})
