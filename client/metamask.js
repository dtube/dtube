const Web3 = require("web3");
let tokenAddress = '0xD2bE59Ad3bcCF4746587e73e1f40528762FB29e3'
let wethAddress = '0xd0a1e359811322d97991e03f863a0c30c2cf029c'
let uniswapPairAddress = '0xc722cd5b8e079cce5e513f1451d287f5c23298cf'
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
            window.ethereum.on('accountsChanged', function (accounts) {
                Session.set('metamaskAddress', accounts[0])
                metamask.loadBalance()
            })
            window.ethereum.enable()
            if (cb) cb(null)
        } else if (cb)
            cb('Metamask not installed')
    },
    loadBalance: () => {
        // this loads the balance of DTC in Ethereum for the active user
        let walletAddress = Session.get('metamaskAddress')
        let contract = web3.eth.contract(minErc20ABI).at(tokenAddress);
        contract.balanceOf(walletAddress, (error, balance) => {
            Session.set('metamaskBalance', parseInt(balance))
        });
    },
    loadUniswapBalance: () => {
        // this loads the pooled liquidities on uniswap
        // and allows calculating DTC / ETH price
        let walletAddress = uniswapPairAddress
        let contract = web3.eth.contract(minErc20ABI).at(tokenAddress);
        contract.balanceOf(walletAddress, (error, balance) => {
            let contract = web3.eth.contract(minErc20ABI).at(wethAddress);
            contract.balanceOf(walletAddress, (error, balanceWeth) => {
                Session.set('metamaskUniswapLiquidities',{
                    dtc: web3.toDecimal(balance)/Math.pow(10,2),
                    weth: web3.toDecimal(balanceWeth)/Math.pow(10,18)
                })
            });
        });
    },
    loadGasPrice: () => {
        web3.eth.getGasPrice(function(err, res) {
            Session.set('metamaskGasPrice', web3.toDecimal(res) / Math.pow(10, 18))
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
        var contract = web3.eth.contract(minABI).at(tokenAddress)
        var encoded = contract.transferToAvalon(amount*100, Session.get('activeUsername'), function(err, res) {
            cb(err, res)
        })
        // web3.eth.signTransaction()
    }
}
