Template.farm.helpers({
    dtcPrice: function () {
        let price = 0
        if (Session.get('metamaskBnbLiquidities') && Session.get('metamaskUniswapLiquidities')) {
            price = Session.get('metamaskUniswapLiquidities').weth
            price /= Session.get('metamaskUniswapLiquidities').dtc
            price *= Session.get('metamaskBnbLiquidities').busd
            price /= Session.get('metamaskBnbLiquidities').bnb
        }
        return price.toFixed(3)
    },
    dtcLiq: function () {
      if (!Session.get('bscFarmingLiquidities'))
        return Session.get('metamaskUniswapLiquidities')
      else {
        let farmingPct = Session.get('bscFarmingLiquidities').farming/Session.get('bscFarmingLiquidities').total
        return {
          dtc: Math.round(Session.get('metamaskUniswapLiquidities').dtc * farmingPct * 100) / 100,
          weth: Session.get('metamaskUniswapLiquidities').weth * farmingPct
        }
      }
    },
    lpBalance: function() {
        return Session.get('metamaskLpBalance')
    },
    lpFarming: function() {
        return Session.get('metamaskLpFarming') || 0
    },
    pendingReward: function() {
        return Session.get('metamaskFarmReward') || 0
    },
    totalValueLocked: function() {
        let price = 0
        let farmingPct = 1
        if (Session.get('bscFarmingLiquidities'))
          farmingPct = Session.get('bscFarmingLiquidities').farming/Session.get('bscFarmingLiquidities').total
        if (Session.get('metamaskBnbLiquidities') && Session.get('metamaskUniswapLiquidities')) {
            price = Session.get('metamaskUniswapLiquidities').weth
            price /= Session.get('metamaskUniswapLiquidities').dtc
            price *= Session.get('metamaskBnbLiquidities').busd
            price /= Session.get('metamaskBnbLiquidities').bnb
            return formatter.format((Session.get('metamaskUniswapLiquidities').dtc * 2 * price * farmingPct))
        } else {
          return price
        }
    },
    apy: () => {
      if (!window.metamask.activeFarm())
        return 0
      let farmingPct = 1
      if (Session.get('bscFarmingLiquidities'))
        farmingPct = Session.get('bscFarmingLiquidities').farming/Session.get('bscFarmingLiquidities').total
      if (farmingPct === 0)
        farmingPct = 0.000001
      const liquidities = Session.get('metamaskUniswapLiquidities').dtc * 2
      const oneYearReward = metamask.farmRewardPerBlock() * 28800 * 365
      const apr = oneYearReward / liquidities
      const aprd = apr / 365
      const apy = (Math.pow(1+aprd, 365) - 1) / farmingPct
      return (100*apy).toFixed(1)
    },
    aprd: () => {
      if (!window.metamask.activeFarm())
        return 0
      let farmingPct = 1
      if (Session.get('bscFarmingLiquidities'))
        farmingPct = Session.get('bscFarmingLiquidities').farming/Session.get('bscFarmingLiquidities').total
      if (farmingPct === 0)
        farmingPct = 0.000001
      const liquidities = Session.get('metamaskUniswapLiquidities').dtc * 2
      const oneYearReward = metamask.farmRewardPerBlock() * 28800 * 365
      const apr = oneYearReward / liquidities
      const aprd = (apr / 365) / farmingPct
      return (aprd*100).toFixed(4)
    },
    allowance: function() {
        return Session.get('metamaskFarmAllowance')
    },
    isFarmActive: () => {
      return window.metamask.activeFarm()
    },
    legacyFarmBalance: function() {
      let legacyFarmBals = Session.get('metamaskLpFarmingLegacy')
      let result = 0
      for (let i in legacyFarmBals)
        result += legacyFarmBals[i] / Math.pow(10,18)
      return result
    }
  })

Template.farm.events({
    "click #connectMetamask": function() {
      metamask.connect()
    },
    "click #addliquidity": function() {
      window.open("https://pancakeswap.finance/add/BNB/0xd3Cceb42B544e91eee02EB585cc9a7b47247BfDE")
    },
      "click #buydtc": function() {
        window.open("https://exchange.pancakeswap.finance/#/swap?outputCurrency=0xd3cceb42b544e91eee02eb585cc9a7b47247bfde")
    },
    "click #depositlp": function() {
        let amount = prompt("Enter deposit amount", Session.get('metamaskLpBalance'));
        if (!amount) return
        amount *= Math.pow(10,18)
        amount = Math.floor(amount)
        metamask.depositLP(amount)
    },
    "click #withdrawlp": function() {
        let amount = prompt("Enter deposit amount", Session.get('metamaskLpFarming'));
        if (!amount) return
        amount *= Math.pow(10,18)
        amount = Math.floor(amount)
        metamask.withdrawLP(amount)
    },
    "click #harvest": function() {
        metamask.depositLP(0)
    },
    "click #enablefarm": function() {
        metamask.farmEnable()
    },
    "click #withdrawlpLegacy": function() {
      metamask.withdrawLPLegacy()
    }
  })

  var formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  
    // These options are needed to round to whole numbers if that's what you want.
    //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
    //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
  });
  