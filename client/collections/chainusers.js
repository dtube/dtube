ChainUsers = new Mongo.Collection(null)

ChainUsers.fetchNames = function (names, cb) {
  if (names.length < 1) {
    cb(null)
    return
  }
  steem.api.getAccounts(names, function (err, result) {
    if (!result || result.length < 1) {
      cb(true)
      return
    }
    for (var i = 0; i < result.length; i++) {
      var user = result[i]
      try {
        user.json_metadata = JSON.parse(user.json_metadata)
      } catch (e) {
      }
      user.estimateAccountValue = ChainUsers.estimateAccountValue(user)
      ChainUsers.upsert({ _id: user.id }, Waka.api.DeleteFieldsWithDots(user))
    }
    cb(null)
  });
}

ChainUsers.estimateAccountValue = function(user) {
  var balanceSteem = parseFloat(user.balance.split(' ')[0])
  var balanceVests = parseFloat(user.vesting_shares.split(' ')[0])
  var balanceSbd = parseFloat(user.sbd_balance.split(' ')[0])
  var balanceUsd = 0
  balanceUsd += Session.get('steemPrice')*Market.vestToSteemPower(balanceVests)
  balanceUsd += Session.get('steemPrice')*balanceSteem
  balanceUsd += Session.get('sbdPrice')*balanceSbd
  console.log(balanceUsd) //TODO this trick fix first appear 
  return balanceUsd.toFixed(2);
}