Template.channelkeys.rendered = function() {
    $('.ui.checkbox').checkbox()
}

Template.channelkeys.helpers({
    'mainKey': function(){
        return ChainUsers.findOne({ name: FlowRouter.getParam("author") }).pub
    },
    'keys': function(){
        return ChainUsers.findOne({ name: FlowRouter.getParam("author") }).keys
    },
    'loggedInPub': function(){
        var priv = Users.findOne({username: FlowRouter.getParam("author")}).privatekey
        return avalon.privToPub(priv)
    },
    'loggedInPriv': function(){
        return Users.findOne({username: FlowRouter.getParam("author")}).privatekey
    },
    'transactionTypes': function(){
        types = []
        for (const key in avalon.TransactionType) {
            types.push({
                name: key,
                id: avalon.TransactionType[key]
            })
        }
        return types
    }
})

Template.channelkeys.events({
    'click .revealButton': function() {
        if ($('#privateKey')[0].type == 'password')
            $('#privateKey')[0].type = 'text'
        else
            $('#privateKey')[0].type = 'password'
    },
    'click #newKeyButton': function(e) {
        e.preventDefault()
        var newKeyId = $('#newkey-id').val()
        var newKeyPub = $('#newkey-pub').val()
        var txTypes = []
        for (const key in $('input[type=checkbox]')) {
            if (!Number.isInteger(parseInt(key))) break
            txTypes.push(parseInt($('input[type=checkbox]')[key].dataset.txid))
        }
        broadcast.avalon.newKey(newKeyId, newKeyPub, txTypes, function(err, res) {
            if (err)
                toastr.error(Meteor.blockchainError(err))
            else {
                Users.refreshUsers([Session.get('activeUsername')])
            }
        })
    }
})