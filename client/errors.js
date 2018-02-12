Meteor.blockchainError = function(error) {
  if (error.data && error.data.stack)
    return error.data.stack[0].format
  if (error.payload && error.payload.error)
    return error.payload.error.data.stack[0].format
  if (error.cause && error.cause.payload && error.cause.payload.error)
    return error.cause.payload.error.data.stack[0].format
    
  console.log(error)
  return translate('ERROR_UNKNOWN');
}
