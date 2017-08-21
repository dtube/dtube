Template.registerHelper( 'ipfsGateway', () => {
  if (!Session.get('ipfsGateway')) return Meteor.settings.public.remote.displayNodes[0]
  return Session.get('ipfsGateway')
});

Template.registerHelper( 'ipfsUpload', () => {
  if (!Session.get('ipfsUpload')) return Meteor.settings.public.remote.uploadNodes[0].ip
  return Session.get('ipfsUpload')
});
