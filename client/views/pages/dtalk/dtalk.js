Template.dtalk.helpers({
    conversations: function() {
        return DTalk.find()
    },
    gunUser: function() {
        return Session.get('gunUser')
    },
    publishUrl: function() {
        return 'https://steemconnect.com/sign/profile-update?dtalk_public_key='
            +Session.get('gunUser').pub
            +'&account='+Session.get('activeUsername')
    },
    hasPublishedKey: function() {
        // we assume its published if we havent the data yet
        if (!ChainUsers.findOne({name: Session.get('activeUsername')}))
            return true

        if (ChainUsers.findOne({
            'json_metadata.profile.dtalk_public_key': Session.get('gunUser').pub,
            name: Session.get('activeUsername')
        }))
            return true
        return false
    },
    searchUserKey: function() {
        var user = ChainUsers.findOne({
            name: Session.get('dtalkUserSearch')
        })
        if (!user) return false
        if (!user.json_metadata) return false
        if (!user.json_metadata.profile) return false
        if (!user.json_metadata.profile.dtalk_public_key) return false

        return user.json_metadata.profile.dtalk_public_key
    }
})
  
Template.dtalk.events({
    'keyup #dtalkSearch': function(event) {
        Session.set('dtalkUserSearch', event.target.value)
        if (!ChainUsers.findOne({name: event.target.value}))
            ChainUsers.fetchNames([event.target.value], function(){})
    },
    'submit .searchUserForm': function(event) {
        event.preventDefault()
        FlowRouter.go('/dtalk/'+event.target.searchResult.value)
        Session.set('dtalkUserSearch', null)
    },
})