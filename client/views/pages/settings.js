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
    var ipfsGateway = event.target.ipfsGateway.value;
    Session.set('ipfsGateway', ipfsGateway)
    Session.set('ipfsUpload', ipfsUpload)
    FlowRouter.go('/')
  }
})
