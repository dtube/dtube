import {saveAs} from 'file-saver'

Template.keypair.rendered = function() {
    Session.set("tmpKey", avalon.keypair())
}

Template.keypair.helpers({
    tmpKey: function() {
      return Session.get('tmpKey')
    }
})

Template.keypair.events({
    'click #regenavalonkey': function (e) {
        e.preventDefault()
        Session.set("tmpKey", avalon.keypair())
    },
    'click #saveavalonkey': function (e) {
        e.preventDefault()
        var pub = $("#avalonpub").val();
        var priv = $("#avalonpriv").val();
        var key = JSON.stringify({
            pub: pub,
            priv: priv
        })
        var blob = new Blob([key], {type: "text/plain;charset=utf-8"})
        alert("Do not share your private key with anyone, even DTube staff")
        alert("Do not lose your private key or it cannot be recovered")
        saveAs(blob, "dtube_key.txt")
        Session.set('savedPubKey', pub)
    }
})