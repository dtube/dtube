Meteor.blockchainError = function(error) {
  if (error.error) return error.error
  console.log(error)
  return translate('ERROR_UNKNOWN');
}
