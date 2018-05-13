Template.notification.events({
    'click .notification-link': function() {
        var newNotif = this
        newNotif.opened = true
        Notifications.update({_id: this._id}, newNotif)
        $('.dropdownnotification').dropdown('hide')
    }
})