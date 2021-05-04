
Template.channeldesktopcover.helpers({
    mainUser: function () {
      return Users.findOne({ username: Session.get('activeUsername') })
    },
    user: function () {
      return {
        name: FlowRouter.getParam("author")
      }
    },
    author: function () {
      return ChainUsers.findOne({ name: FlowRouter.getParam("author") })
    },
    activeUser: function () {
      return Session.get('activeUsername')
    },
    subCount: function () {
      return ChainUsers.findOne({ name: FlowRouter.getParam("author") }).followersCount || 0
    },
    randomBackgroundColor: function () {
      var rnd = Math.floor(Math.random() * (5 - 1 + 1)) + 1;
      var bgcolor = ''
      switch (rnd) {
        case 1:
          bgcolor = 'channelbga';
          break;
        case 2:
          bgcolor = 'channelbgb';
          break;
        case 3:
          bgcolor = 'channelbgc';
          break;
        case 4:
          bgcolor = 'channelbgd';
          break;
        default:
          bgcolor = 'channelbge';
      }
      return bgcolor
    }
  })

Template.channeldesktopcover.events({
  "click #connectMetamask": function() {
    jQuery.ajax({
      url: 'https://cdnjs.cloudflare.com/ajax/libs/web3/1.3.0/web3.min.js',
      dataType: 'script',
      success: function() {
        let networkId = parseInt(window.ethereum.chainId)
        if (!window.metamask.networks[networkId])
          return toastr.error('Unsupported network selected',translate('ERROR_TITLE'))
        metamask.enable()
        metamask.loadGasPrice()
        metamask.loadUniswapBalance()
        var ethAddressChecker = setInterval(function() {
          if (window.ethereum.selectedAddress) {
            clearInterval(ethAddressChecker)
            console.log('Metamask connected: '+window.ethereum.selectedAddress)
            Session.set('metamaskAddress', window.ethereum.selectedAddress)
            Session.set('metamaskNetwork',window.ethereum.chainId)
            metamask.loadBalance()
            metamask.loadDepositAddressBalance()
          }
        }, 150)
      },
      async: true
    });
  },
  "click #swapErc20": function() {
    let networkId = parseInt(window.ethereum.chainId)
    if (window.metamask.networks[networkId]) {
      Template.sidebar.empty()
      $('.swaperc20').show()
      Template.settingsdropdown.nightMode()
      metamask.loadGasPrice()
    } else
      toastr.error('Unsupported network selected',translate('ERROR_TITLE'))
  }
})