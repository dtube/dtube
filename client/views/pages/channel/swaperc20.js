Template.swaperc20.helpers({
    balanceAvalon: function() {
        return avalon.availableBalance(Users.findOne({ username: Session.get('activeUsername'), network: 'avalon' }))
    },
    balanceErc20: function() {
        return Session.get('metamaskBalance')
    },
    depositAddressBalance: () => {
        return Session.get('depositAddressBalance')
    },
    dtcFee: function() {
        var liquid = Session.get('metamaskUniswapLiquidities')
        if (!liquid) return ''
        var dtcEther = liquid.weth / liquid.dtc
        var avgGasUsedPerTx = 51258
        var gasPrice = Session.get('metamaskGasPrice')
        var txFeeEth = avgGasUsedPerTx * gasPrice
        var txFeeDtc = Math.ceil(100 * txFeeEth / dtcEther)
        Session.set('swapFee', txFeeDtc)
        return txFeeDtc
    },
    finalAmount: function() {
        var amount = Session.get('swapAmount')*100
        if (!amount) return ''
        if (!Session.get('metamaskSwapInverse')) {
            var fee = Session.get('swapFee')
            return (amount - fee)
        }
        return amount
    },
    metamaskSwapInverse: function() {
        return Session.get('metamaskSwapInverse')
    },
    metamaskNetwork: () => {
        let networkId = parseInt(Session.get('metamaskNetwork'))
        if (window.metamask.networks[networkId])
            return window.metamask.networks[networkId]
        else
            return 'UNKNOWN NETWORK'
    },
    metamaskNetworkName: () => {
        let networkId = parseInt(Session.get('metamaskNetwork'))
        if (window.metamask.networkFullNames[networkId])
            return window.metamask.networkFullNames[networkId]
        else
            return 'Unknown Network'
    },
    isValid: function() {
        if (!Session.get('swapAmount')) return false
        if (!Session.get('activeUsername')) return false
        if (!Session.get('metamaskAddress')) return false
        if (!Session.get('swapFee')) return false
        if (!Session.get('metamaskNetwork') || !metamask.networks[parseInt(window.ethereum.chainId)]) return false

        var balance = avalon.availableBalance(Users.findOne({ username: Session.get('activeUsername'), network: 'avalon' }))
        if (Session.get('metamaskSwapInverse'))
            balance = Session.get('metamaskBalance')
        var amount = Session.get('swapAmount')
        let depositLiquidity = parseInt(Session.get('depositAddressBalance'))
        var decimals = countDecimals(amount)
        if (decimals > 2 || Math.round(amount*100) > balance || (Math.round(amount*100) > depositLiquidity && !Session.get('metamaskSwapInverse'))) {
            $('#swapAmount').parent().parent().addClass('error')
            return false
        } else $('#swapAmount').parent().parent().removeClass('error')

        if (Session.get('swapFee') >= 100*Session.get('swapAmount'))
            return false
        return true
    }
})

Template.swaperc20.events({
    "click #swapInverse": function() {
        Session.set('metamaskSwapInverse', !Session.get('metamaskSwapInverse'))
        Session.set('swapAmount', null)
        setTimeout(()=>Template.settingsdropdown.nightMode(),1)
    },
    "click #cancelSwap": function() {
        $('.swaperc20').hide()
    },
    "input #swapAmount": function() {
        Session.set('swapAmount', parseFloat($('#swapAmount').val()))
    },
    "click #confirmSwap": function() {
        $("#confirmSwap").addClass('disabled')
        $("#confirmSwap > i.check").addClass('dsp-non')
        $("#confirmSwap > i.loading").removeClass('dsp-non')

        if (Session.get('metamaskSwapInverse')) {
            // erc20 -> avalon
            metamask.transferToAvalon(Session.get('swapAmount'), function(err, res) {
                $("#confirmSwap").removeClass('disabled')
                $("#confirmSwap > i.loading").addClass('dsp-non')
                $("#confirmSwap > i.check").removeClass('dsp-non')
                if (err) toastr.error(err.message)
                else {
                    console.log('Sent ERC20 transaction: '+res)
                    toastr.success(translate('ERC20_TX_SENT',window.metamask.networkFullNames[parseInt(Session.get('metamaskNetwork'))]),translate('TRANSFER_SUCCESS_TITLE'))
                    $('.swaperc20').hide()
                }
            })
        } else {
            // avalon -> erc20
            var amount = Math.floor(Session.get('swapAmount')*100)
            var memo = Session.get('metamaskAddress')
            switch (parseInt(Session.get('metamaskNetwork'))) {
                case 1:
                    memo += '@eth'
                    break
                case 56:
                    memo += '@bsc'
                    break
            }
            var receiver = 'dtube.swap'
            broadcast.avalon.transfer(receiver, amount, memo, function(err, res) {
                $("#confirmSwap").removeClass('disabled')
                $("#confirmSwap > i.loading").addClass('dsp-non')
                $("#confirmSwap > i.check").removeClass('dsp-non')
                if (err) Meteor.blockchainError(err)
                else {
                  toastr.success(translate('TRANSFER_SUCCESS_DESC', amount/100, receiver), translate('TRANSFER_SUCCESS_TITLE'))
                  $('.swaperc20').hide()
                }
            })
        }
    }
})

var countDecimals = function (amount) {
    if (!amount || amount.toString().indexOf('.') === -1) return 0
    return amount.toString().split(".")[1].length || 0;
}