Template.registerHelper( 'ipfsGateway', () => {
  if (!Session.get('ipfsGateway')) return Session.get('remoteSettings').displayNodes[0]
  return Session.get('ipfsGateway')
});

Template.registerHelper( 'ipfsUpload', () => {
  if (!Session.get('ipfsUpload')) return Session.get('remoteSettings').uploadNodes[0].ip
  return Session.get('ipfsUpload')
});
