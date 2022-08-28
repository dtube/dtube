// huge library, only fetch on demand
// const Web3 = require('web3')

// those can be hard-coded they shouldnt ever change
const tokenAddress = '0xd2be3722B17b616c51ed9B8944A227D1ce579C24'
const depositAddress = '0xd2be0fb21eeced4ce59a39f190e61291ca8c33cc'
const uniswapPairAddress = '0xf44c9fcf0491c07a7380727fd2c30cc1131ff100'
const wethAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'

const tokenAddressBSC = '0xd3cceb42b544e91eee02eb585cc9a7b47247bfde'
const pancakeswapPairAddress = '0xe9ee2d9e1e6eddbce9e5c1c1fc6c6f1e5051b9c6'
const wbnbAddress = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'

const tokenDecimals = 2
const minErc20ABI = [
    {
        "constant":true,
        "inputs":[{"name":"_owner","type":"address"}],
        "name":"balanceOf",
        "outputs":[{"name":"balance","type":"uint256"}],
        "type":"function"
    },
    {
        "constant":true,
        "inputs":[],
        "name":"totalSupply",
        "outputs":[{"name":"totalSupply","type":"uint256"}],
        "type":"function"
    },
    {
        "constant":true,
        "inputs":[{"name":"from","type":"address"},{"name":"to","type":"address"}],
        "name":"allowance",
        "outputs":[{"name":"allowance","type":"uint256"}],
        "type":"function"
    },
    {
        "constant":true,
        "inputs":[{"name":"spender","type":"address"},{"name":"value","type":"uint256"}],
        "name":"approve",
        "outputs":[],
        "type":"function"
    }
]

// those are for the farming pool
const busdAddress = '0xe9e7cea3dedca5984780bafc599bd69add087d56'
const pcsBnbBusd = '0x58f876857a02d6762e0101bb5c46a8c1ed44dc16'
const legacySmartChefAddress = ['0x7de7b570318414526cd3442c8b5a8446b69756d6','0xf4d33503ea1fc1d53f8febc450940cc66504c584']
const smartChefAddress = '0xae84bc4613b638aa19d10d58180ec730bd8c37af'
const smartChefAbi = [
    {
      "inputs": [{"internalType": "uint256","name": "_amount","type": "uint256"}],
      "name": "deposit",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "emergencyWithdraw",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
        "inputs": [{"internalType": "address","name": "_user","type": "address"}],
        "name": "pendingReward",
        "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address","name": "","type": "address"}],
        "name": "userInfo",
        "outputs": [
            {"internalType": "uint256","name": "amount","type": "uint256"},
            {"internalType": "uint256","name": "rewardDebt","type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256","name": "_amount","type": "uint256"}],
        "name": "withdraw",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
]

window.metamask = {
    connect: () => {
        jQuery.ajax({
            url: 'https://cdnjs.cloudflare.com/ajax/libs/web3/1.4.0/web3.min.js',
            dataType: 'script',
            success: function() {
                let networkId = parseInt(window.ethereum.chainId)
                if (!window.metamask.networks[networkId])
                    return toastr.error('Unsupported network selected',translate('ERROR_TITLE'))
                metamask.enable()
                var ethAddressChecker = setInterval(function() {
                    if (window.ethereum.selectedAddress) {
                        clearInterval(ethAddressChecker)
                        console.log('Metamask connected: '+window.ethereum.selectedAddress)
                        Session.set('metamaskAddress', window.ethereum.selectedAddress)
                        Session.set('metamaskNetwork',window.ethereum.chainId)
                        metamask.update()
                    }
                }, 150)
            },
            error: () => {
                toastr.error(translate('ERROR_METAMASK_WEB3_SCRIPT'),translate('ERROR_TITLE'))
            },
            async: true
        })
    },
    enable: (cb) => {
        if (window.ethereum) {
            window.w3 = new Web3(window.ethereum)
            console.log('Loaded Web3 v'+w3.version)
            window.ethereum.on('accountsChanged', function (accounts) {
                console.log(accounts, window.ethereum.selectedAddress)
                Session.set('metamaskAddress', window.ethereum.selectedAddress)
                metamask.update()
            })
            window.ethereum.on('networkChanged', () => {
                Session.set('metamaskNetwork',window.ethereum.chainId)
                metamask.update()
            })
            window.ethereum.enable()
            if (cb) cb(null)
        } else if (cb)
            cb('Metamask not installed')
    },
    update: () => {
        metamask.loadBalance()
        metamask.loadDepositAddressBalance()
        metamask.loadGasPrice()
        metamask.loadLiquidities()
        metamask.bscFarmTvl()

        if (Session.get('metamaskNetwork') == 56 || Session.get('metamaskNetwork') == "0x38") {
            metamask.loadBNBLiquidities()
            metamask.loadLpBalance()
            metamask.farmUserInfo()
            metamask.farmPending()
            metamask.farmAllowance()
            metamask.legacyFarmUserInfo()
        }
    },
    loadBalance: () => {
        // this loads the balance of DTC in Ethereum for the active user
        let walletAddress = Session.get('metamaskAddress')
        let contract = new w3.eth.Contract(minErc20ABI,metamask.tokenAddress());
        contract.methods.balanceOf(walletAddress).call().then(function(res) {
            Session.set('metamaskBalance', res)
        })
    },
    loadLpBalance: () => {
        // this loads the balance of DTC-BNB LP in BSC for the active user
        let walletAddress = Session.get('metamaskAddress')
        let contract = new w3.eth.Contract(minErc20ABI,metamask.lpAddress());
        contract.methods.balanceOf(walletAddress).call().then(function(res) {
            Session.set('metamaskLpBalance', res/Math.pow(10,18))
        })
    },
    activeFarm: () => {
        return smartChefAddress
    },
    farmUserInfo: () => {
        if (!Session.get('metamaskLpFarmingLegacy'))
            Session.set('metamaskLpFarmingLegacy',Array(legacySmartChefAddress.length).fill(0))
        if (!smartChefAddress) return
        let walletAddress = Session.get('metamaskAddress')
        let contract = new w3.eth.Contract(smartChefAbi,smartChefAddress);
        contract.methods.userInfo(walletAddress).call().then(function(res) {
            Session.set('metamaskLpFarming', res.amount/Math.pow(10,18))
        })
    },
    farmPending: () => {
        if (!smartChefAddress) return
        let walletAddress = Session.get('metamaskAddress')
        let contract = new w3.eth.Contract(smartChefAbi,smartChefAddress);
        contract.methods.pendingReward(walletAddress).call().then(function(res) {
            Session.set('metamaskFarmReward', res/100)
        })
    },
    farmAllowance: () => {
        if (!smartChefAddress) return
        let walletAddress = Session.get('metamaskAddress')
        let contract = new w3.eth.Contract(minErc20ABI,metamask.lpAddress());
        contract.methods.allowance(walletAddress,smartChefAddress).call().then(function(res) {
            let amount = res
            if (!amount) amount = 0
            if (amount == "0") amount = 0
            Session.set('metamaskFarmAllowance', amount)
        })
    },
    farmEnable: () => {
        let contract = new w3.eth.Contract(minErc20ABI,metamask.lpAddress());
        contract.methods.approve(smartChefAddress,"115792089237316195423570985008687907853269984665640564039457584007913129639935").send({
            from: Session.get('metamaskAddress')
        }).then((res) => {
            console.log(res)
        }).catch((err) => {
            console.log(err)
        })
    },
    farmRewardPerBlock: () => {
        return 0.0057
    },
    legacyFarmUserInfo: () => {
        let walletAddress = Session.get('metamaskAddress')
        legacySmartChefAddress.forEach((addr,idx) => {
            let contract = new w3.eth.Contract(smartChefAbi,addr);
            contract.methods.userInfo(walletAddress).call().then(function(res) {
                let legacyFarmBals = Session.get('metamaskLpFarmingLegacy')
                legacyFarmBals[idx] = parseInt(res.amount)
                Session.set('metamaskLpFarmingLegacy', legacyFarmBals)
            })
        })
    },
    bscFarmTvl: () => {
        // bsc farm tvl
        if (!smartChefAddress) return
        let contract = new w3.eth.Contract(minErc20ABI,pancakeswapPairAddress);
        contract.methods.balanceOf(smartChefAddress).call().then((balance) => {
            let contract = new w3.eth.Contract(minErc20ABI,pancakeswapPairAddress);
            contract.methods.totalSupply().call().then((lpsupply) => {
                Session.set('bscFarmingLiquidities',{
                    farming: parseInt(balance),
                    total: parseInt(lpsupply)
                })
            });
        });
    },
    loadLiquidities: () => {
        // this loads the pooled liquidities on uniswap
        // and allows calculating DTC / ETH price
        let walletAddress = metamask.lpAddress()
        let contract = new w3.eth.Contract(minErc20ABI,metamask.tokenAddress());
        contract.methods.balanceOf(walletAddress).call().then((balance) => {
            let contract = new w3.eth.Contract(minErc20ABI,metamask.wAddress());
            contract.methods.balanceOf(walletAddress).call().then((balanceWeth) => {
                Session.set('metamaskUniswapLiquidities',{
                    dtc: balance/Math.pow(10,2),
                    weth: balanceWeth/Math.pow(10,18)
                })
            });
        });
    },
    loadBNBLiquidities: () => {
        // this loads the pooled BNB/BUSD liquidities on Pancake Swap
        // and allows calculating DTC / USD price
        let walletAddress = pcsBnbBusd
        let contract = new w3.eth.Contract(minErc20ABI,busdAddress);
        contract.methods.balanceOf(walletAddress).call().then((balance) => {
            let contract = new w3.eth.Contract(minErc20ABI,wbnbAddress);
            contract.methods.balanceOf(walletAddress).call().then((balanceBnb) => {
                Session.set('metamaskBnbLiquidities',{
                    busd: balance/Math.pow(10,18),
                    bnb: balanceBnb/Math.pow(10,18)
                })
            });
        });
    },
    depositLP: (amount) => {
        let contract = new w3.eth.Contract(smartChefAbi,smartChefAddress);
        contract.methods.deposit(amount).send({
            from: Session.get('metamaskAddress')
        }).then((res) => {
            console.log(res)
        }).catch((err) => {
            console.log(err)
        })
    },
    withdrawLP: (amount) => {
        let contract = new w3.eth.Contract(smartChefAbi,smartChefAddress);
        contract.methods.withdraw(amount).send({
            from: Session.get('metamaskAddress')
        }).then((res) => {
            console.log(res)
        }).catch((err) => {
            console.log(err)
        })
    },
    withdrawLPLegacy: async () => {
        // withdraw all tokens from legacy farm
        let legacyFarmBals = Session.get('metamaskLpFarmingLegacy')
        for (let i in legacyFarmBals)
            if (legacyFarmBals[i]) {
                let contract = new w3.eth.Contract(smartChefAbi,legacySmartChefAddress[i])
                await contract.methods.emergencyWithdraw().send({
                    from: Session.get('metamaskAddress')
                })
            }
    },
    loadDepositAddressBalance: async () => {
        // load available liquidity for deposits
        let balance = await new w3.eth.Contract(minErc20ABI,metamask.tokenAddress()).methods.balanceOf(depositAddress).call()
        Session.set('depositAddressBalance',balance)
    },
    loadGasPrice: () => {
        w3.eth.getGasPrice(function(err, res) {
            Session.set('metamaskGasPrice', res / Math.pow(10, 18))
        })
    },
    transferToAvalon: (amount, cb) => {
        let minABI = [
            {
                "inputs": [
                  {
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                  },
                  {
                    "internalType": "string",
                    "name": "avalon_recipient",
                    "type": "string"
                  }
                ],
                "name": "transferToAvalon",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            }
        ];
        let contract = new w3.eth.Contract(minABI,metamask.tokenAddress())
        contract.methods.transferToAvalon(Math.round(amount*100), Session.get('activeUsername')).send({
            from: Session.get('metamaskAddress')
        }).then((res) => {
            cb(null, res)
        }).catch((err) => {
            cb(err)
        })
    },
    networks: {
        1: 'ETH',
        56: 'BSC'
    },
    networkFullNames: {
        1: 'Ethereum',
        56: 'Binance Smart Chain'
    },
    tokenAddress: () => {
        switch (parseInt(window.ethereum.chainId)) {
            case 1:
                return tokenAddress
            case 56:
                return tokenAddressBSC
            // todo more evm networks?
        }
    },
    lpAddress: () => {
        switch (parseInt(window.ethereum.chainId)) {
            case 1:
                return uniswapPairAddress
            case 56:
                return pancakeswapPairAddress
            // todo more evm networks?
        }
    },
    wAddress: () => {
        switch (parseInt(window.ethereum.chainId)) {
            case 1:
                return wethAddress
            case 56:
                return wbnbAddress
            // todo more evm networks?
        }
    },
    wSymbol: () => {
        switch (parseInt(window.ethereum.chainId)) {
            case 1:
                return 'ETH'
            case 56:
                return 'BNB'
            // todo more evm networks?
        }
    }
}
