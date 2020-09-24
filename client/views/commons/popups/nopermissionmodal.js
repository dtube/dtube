Template.nopermissionmodal.helpers({
    requiredPermission: () => {
        return Session.get('requiredPermission')
    }
})

Template.nopermissionmodal.events({
    'click #cancelTransact': () => missingPermission.cancel(),
    'click #proceedTransact': () => missingPermission.retry($('#retryKey').val())
})