Market = {
    getSteemPrice: function() {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://api.coinmarketcap.com/v1/ticker/STEEM/', true);
        xhr.send();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    var ticker = JSON.parse(xhr.responseText)[0]
                    Session.set('steemPrice', parseFloat(ticker.price_usd))
                } else {
                  console.log("Error: API not responding!");
                }
            }
        }
    },
    getSteemDollarPrice: function() {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://api.coinmarketcap.com/v1/ticker/STEEM-DOLLARS/', true);
        xhr.send();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    var ticker = JSON.parse(xhr.responseText)[0]
                    Session.set('sbdPrice', parseFloat(ticker.price_usd))
                } else {
                  console.log("Error: API not responding!");
                }
            }
        }
    },
    vestToSteemPower: function(userVests) {
        if (Session.get('steemGlobalProp') && userVests) {
            var globals = Session.get('steemGlobalProp')
            var totalSteem = parseFloat(globals.total_vesting_fund_steem.split(' ')[0])
            var totalVests = parseFloat(globals.total_vesting_shares.split(' ')[0])
            var SP = totalSteem * (userVests / totalVests)
            return SP
        }
    }
}