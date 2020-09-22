import {saveAs} from 'file-saver'
var QRCode = require('qrcode')

Template.keypair.rendered = function() {
    Template.settingsdropdown.nightMode()
    Session.set("tmpKey", avalon.keypair())
    $('.qrButton')
    .popup({
        popup: $('.popupQRCode'),
        on: 'click'
    });
}

Template.keypair.helpers({
    tmpKey: function() {
      return Session.get('tmpKey')
    },
    'qrCode': function() {
        return Session.get('keyQRCode')
    },
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
    },
    'click .qrButton': function(e) {
        e.preventDefault()
        QRCode.toDataURL($('#avalonpriv').val(), function (err, url) {
            Session.set('keyQRCode', url)
        })
    },
    'click .copyButton': function(e) {
        e.preventDefault()
        var text = $('#avalonpriv').val();
        if (window.clipboardData && window.clipboardData.setData) {
          clipboardData.setData("Text", text);
        } else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
          var textarea = document.createElement("textarea");
          textarea.textContent = text;
          textarea.style.position = "fixed";
          document.body.appendChild(textarea);
          textarea.select();
          try {
            document.execCommand("copy");
          } catch (ex) {
          } finally {
            document.body.removeChild(textarea);
          }
        }
        toastr.success('Copied')
    },
})