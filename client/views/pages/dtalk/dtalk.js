Template.dtalk.helpers({
    conversations: function() {
        return DTalk.find()
    },
    gunUser: function() {
        return Session.get('gunUser')
    },
    publishUrl: function() {
        return 'https://steemconnect.com/sign/profile-update?dtalk_public_key='+Session.get('gunUser').pub
    }
})
  
Template.dtalk.events({

})