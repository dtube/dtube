  Template.buttontransfer.events({
    'click .transferdtcbtn': function () {
      Template.sidebar.empty()
      $('.transferdtc').show()
    },
    'click #cancelTransfer': function () {
      $('.transferdtc').hide()
    },
    'click #confirmTransfer': function () {
      Template.buttontransfer.transfer()
    },
  })

  Template.buttontransfer.transfer = function() {
    $("#confirmTransfer").addClass('disabled')
    $("#confirmTransfer > i.check").addClass('dsp-non')
    $("#confirmTransfer > i.loading").removeClass('dsp-non')
    var amount = Math.floor(parseFloat($('#transfer_amount').val())*100)
    var memo = $('#transfer_memo').val()
    var receiver = FlowRouter.getParam("author")
    broadcast.avalon.transfer(receiver, amount, memo, function(err, res) {
      $("#confirmTransfer").removeClass('disabled')
      $("#confirmTransfer > i.loading").addClass('dsp-non')
      $("#confirmTransfer > i.check").removeClass('dsp-non')
      if (err) Meteor.blockchainError(err)
      else {
        toastr.success(translate('TRANSFER_SUCCESS_DESC', $('#transfer_amount').val(), receiver), translate('TRANSFER_SUCCESS_TITLE'))
        $('.transferdtc').hide()
      }
    })
  }

  Template.buttontransfersmall.events({
    'click .transferdtcbtn': function () {
      $('.transferdtc').show()
    },
    'click #cancelTransfer': function () {
      $('.transferdtc').hide()
    },
    'click #confirmTransfer': function () {
      Template.buttontransfer.transfer()
    },
  })