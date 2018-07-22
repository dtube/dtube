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
        var sec = DTalk.findOne({pub: FlowRouter.getParam("pub")}).sec

        for (let i = 0; i < messages.length; i++) {
            if (!messages[i].msgdec) {
                DTalk.decrypt(messages[i], sec)
            }
        }

        return messages;
    }
})

Template.pm.events({
    'submit #newMessageForm': function(event) {
        event.preventDefault()
        var newMessage = $('#newMessage').val()
        DTalk.sendMessageToKey(newMessage, FlowRouter.getParam("pub"))
        console.log('sent message')
    }
})