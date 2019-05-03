Template.onboarding.helpers({
    newPubKey: function() {
        return Session.get('savedPubKey')
    },
    isSteem: function() {
        if (!Users.findOne({username: Session.get('activeUsernameSteem')}))
            return false
        if (!Users.findOne({username: Session.get('activeUsernameSteem')}).network)
            return true
        if (Users.findOne({username: Session.get('activeUsernameSteem')}).network == 'steem')
            return true

        return false
    }
})

Template.onboarding.events({
    'click #onboarding': function() {
        var pub = Session.get('savedPubKey')
        var name = Session.get('activeUsername')
        var url = "https://steemconnect.com/sign/profile-update?dtube_pub="+pub+"&account="+name
        window.open(url, '_blank');
    }
})