Meteor.blockchainError = function(error) {
  if (error.cause) return error.cause.payload.error.data.stack[0].format
  console.log(error)
  return 'Unknown error'
}
