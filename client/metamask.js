// those can be hard-coded they shouldnt ever change
let tokenAddress = '0xd2be3722B17b616c51ed9B8944A227D1ce579C24'
let depositAddress = '0xd2be0fb21eeced4ce59a39f190e61291ca8c33cc'
let uniswapPairAddress = '0xf44c9fcf0491c07a7380727fd2c30cc1131ff100'
let wethAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
let tokenDecimals = 2
let minErc20ABI = [
    {
    "constant":true,
    "inputs":[{"name":"_owner","type":"address"}],
    "name":"balanceOf",
    "outputs":[{"name":"balance","type":"uint256"}],
    "type":"function"
    }
];

window.metamask = {
    enable: (cb) => {
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum)
            console.log('Loaded Web3 v'+web3.version)
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
        metamask.loadUniswapBalance()
    },
    loadBalance: () => {
        // this loads the balance of DTC in Ethereum for the active user
        let walletAddress = Session.get('metamaskAddress')
        let contract = new web3.eth.Contract(minErc20ABI,tokenAddress);
        contract.methods.balanceOf(walletAddress).call().then(function(res) {
            Session.set('metamaskBalance', res)
        })
    },
    loadUniswapBalance: () => {
        // this loads the pooled liquidities on uniswap
        // and allows calculating DTC / ETH price
        let walletAddress = uniswapPairAddress
        let contract = new web3.eth.Contract(minErc20ABI,tokenAddress);
        contract.methods.balanceOf(walletAddress).call().then((balance) => {
            let contract = new web3.eth.Contract(minErc20ABI,wethAddress);
            contract.methods.balanceOf(walletAddress).call().then((balanceWeth) => {
                Session.set('metamaskUniswapLiquidities',{
                    dtc: balance/Math.pow(10,2),
                    weth: balanceWeth/Math.pow(10,18)
                })
            });
        });
    },
    loadDepositAddressBalance: async () => {
        // load available liquidity for deposits
        let balance = await new web3.eth.Contract(minErc20ABI,tokenAddress).methods.balanceOf(depositAddress).call()
        Session.set('depositAddressBalance',balance)
    },
    loadGasPrice: () => {
        web3.eth.getGasPrice(function(err, res) {
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
        var contract = new web3.eth.Contract(minABI,tokenAddress)
        contract.methods.transferToAvalon(amount*100, Session.get('activeUsername')).send({
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
    }
}
