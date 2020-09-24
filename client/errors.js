Meteor.blockchainError = function(error, errorTitle) {
  let errorMessage
  if (typeof error == 'string' && error.startsWith('missing required permission ')) {
    let requiredPermission = error.replace('missing required permission ','')
    errorMessage = translate('ERROR_MISSING_PERMISSION',requiredPermission)
  }
  if (error.error) {
    if (error.error.startsWith("need more bandwidth")) {
      Session.set('missingBytes', parseInt(error.error.split('(')[1].split(' B)')[0]))
      $('.nobandwidth').show()
      Template.nobandwidthmodal.updateCountdown()
      return
    } else
      errorMessage = error.error
  } 
  if (error.message) errorMessage = error.message
  if (!errorMessage) {
    console.log('Unknown error detail:', error)
    errorMessage = translate('ERROR_UNKNOWN')
  }
  toastr.error(errorMessage, errorTitle)
}
