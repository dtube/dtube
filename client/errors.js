Meteor.blockchainError = function(error) {
  if (error.error) return error.error
  if (error.message) return error.message
  console.log('Unknown error detail:', error)
  return translate('ERROR_UNKNOWN');
}
