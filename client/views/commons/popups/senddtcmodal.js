Template.senddtcmodal.helpers({
    recipient: function(){
        if (this.author) return this.author
        if (this.name) return this.name
    },
    balance: () => {
        return avalon.availableBalance(Users.findOne({ username: Session.get('activeUsername'), network: 'avalon' }))
    },
    isValid: () => {
        let avail = avalon.availableBalance(Users.findOne({ username: Session.get('activeUsername'), network: 'avalon' }))
        let xferAmt = Session.get('transferAmount')
        if (countDecimals(xferAmt) > 2 || xferAmt <= 0 || xferAmt*100 > avail) {
            $('#transfer_amount').parent().parent().addClass('error')
            return false
        } else {
            $('#transfer_amount').parent().parent().removeClass('error')
            return true
        }
    }
})

Template.senddtcmodal.events({
    'input #transfer_amount': () => {
        Session.set('transferAmount',parseFloat($('#transfer_amount').val()))
    }
})

function countDecimals (amount) {
    if (!amount || amount.toString().indexOf('.') === -1) return 0
    return amount.toString().split(".")[1].length || 0;
}