import {saveAs} from 'file-saver'

Template.onboarding.rendered = function() {
    Session.set("tmpKey", avalon.keypair())
}

Template.onboarding.helpers({
    tmpKey: function() {
      return Session.get('tmpKey')
    }
})

Template.onboarding.events({
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
        var blob = new Blob([key], {type: "text/plain;charset=utf-8"});
        saveAs(blob, "dtube_key.txt");
    }
})