var timeoutScroll = null

Template.pm.helpers({
    convo: function() {
        return DTalk.findOne({pub: FlowRouter.getParam("pub")})
    },
    messages: function() {
        var messages = Messages.find({
            pub: FlowRouter.getParam("pub")
        }, {
            sort: {
                id: -1
            },
            limit: 100
        }).fetch().reverse()
        if (DTalk.findOne({pub: FlowRouter.getParam("pub")})) {
            var sec = DTalk.findOne({pub: FlowRouter.getParam("pub")}).sec
            
            for (let i = 0; i < messages.length; i++) {
                if (!messages[i].msgdec) {
                    DTalk.decrypt(messages[i], sec)
                }
            }
            
            timeoutScroll = setTimeout(function() {
                $('.comments')[0].scrollTop = $('.comments')[0].scrollHeight
            }, 100)
            
            return messages;
        }
        return []
    },
    isVerified: function() {
        if (!DTalk.findOne({pub: FlowRouter.getParam("pub")}))
            return false
        var username = DTalk.findOne({pub: FlowRouter.getParam("pub")}).alias.username

        if (!ChainUsers.findOne({name: username}))
            return true

        if (ChainUsers.findOne({
            'json_metadata.profile.dtalk_public_key': FlowRouter.getParam("pub"),
            name: username
        }))
            return true
        return false
    }
})

Template.pm.events({
    'submit #newMessageForm': function(event) {
        event.preventDefault()
        var newMessage = $('#newMessage').val()
        DTalk.sendMessageToKey(newMessage, FlowRouter.getParam("pub"))
        $('#newMessage').val('')
        $('.comments')[0].scrollTop = $('.comments')[0].scrollHeight;
    }
})