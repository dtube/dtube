  Template.buttoneditprofile.helpers({
    user: function () {
        return {
          name: FlowRouter.getParam("author")
        }
      }
  })

  Template.buttontransfer.events({
    'click .transferdtcbtn': function () {
      $('.transferdtc').show()
    },
    'click #cancelTransfer': function () {
      $('.transferdtc').hide()
    },
    'click .confirm': function () {
      var amount = parseInt($('#transfer_amount').val())
      var memo = $('#transfer_memo').val()
      var receiver = FlowRouter.getParam("author")
      broadcast.avalon.transfer(receiver, amount, memo, function(err, res) {
        if (err) toastr.error(Meteor.blockchainError(err))
        else $('.transferdtc').hide()
      })
    },
  })