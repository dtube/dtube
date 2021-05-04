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
    }
]

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
        let contract = new web3.eth.Contract(minErc20ABI,metamask.tokenAddress());
        contract.methods.balanceOf(walletAddress).call().then(function(res) {
            Session.set('metamaskBalance', res)
        })
    },
    loadUniswapBalance: () => {
        // this loads the pooled liquidities on uniswap
        // and allows calculating DTC / ETH price
        let walletAddress = metamask.lpAddress()
        let contract = new web3.eth.Contract(minErc20ABI,metamask.tokenAddress());
        contract.methods.balanceOf(walletAddress).call().then((balance) => {
            let contract = new web3.eth.Contract(minErc20ABI,metamask.wAddress());
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
        let balance = await new web3.eth.Contract(minErc20ABI,metamask.tokenAddress()).methods.balanceOf(depositAddress).call()
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
        let contract = new web3.eth.Contract(minABI,metamask.tokenAddress())
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
    }
}
