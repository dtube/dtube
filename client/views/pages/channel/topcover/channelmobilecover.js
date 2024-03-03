Template.channelmobilecover.helpers({
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

Template.channelmobilecover.events({
  "click #connectMetamask": function() {
    metamask.connect()
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