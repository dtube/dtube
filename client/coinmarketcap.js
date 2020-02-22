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
    },
    getSaleProgress: function() {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://signup.d.tube/bar', true);
        xhr.send();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    var info = JSON.parse(xhr.responseText)
                    var percent = parseFloat(100*(info.confirmed+info.pending)/info.max)
                    percent = percent.toFixed(1)
                    Session.set('saleProgress', percent)
                } else {
                  console.log("Error: API not responding!");
                }
            }
        }
    }
}