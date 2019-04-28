Template.channelkeys.helpers({
    'mainKey': function(){
        return ChainUsers.findOne({ name: FlowRouter.getParam("author") }).pub
    },
    'keys': function(){
        return ChainUsers.findOne({ name: FlowRouter.getParam("author") }).keys
    },
    'loggedInKey': function(){
        var priv = Users.findOne({username: FlowRouter.getParam("author")}).privatekey
        return {
            priv: priv,
            pub: avalon.privToPub(priv)
        }
    }
})