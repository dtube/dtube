BlockTrades = {
    GetDepositAdress: function (inputCoin, to, memo, cb) {
        $.post("https://blocktrades.us/api/v2/simple-api/initiate-trade", {
            "inputCoinType": inputCoin,
            "outputCoinType": "steem",
            "outputAddress": to,
            "outputMemo": memo,
            "inputMemo": memo,
            "refundMemo": memo
        }, function (err, res, data) {
            console.log(data.responseJSON)
            cb()
        });
    },
    GetAvailableCoins: function() {
        $.get("https://blocktrades.us/api/v2/coins", function (err, data) {
            console.log(data)
            cb()
        });
    }
}