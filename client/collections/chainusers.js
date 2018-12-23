ChainUsers = new Mongo.Collection(null)

ChainUsers.fetchNames = function (names, cb) {
  if (names.length < 1) {
    cb(null)
    return
  }
  avalon.getAccounts(names, function (err, result) {
    if (!result || result.length < 1) {
      cb(true)
      return
    }
    for (var i = 0; i < result.length; i++) {
      var user = result[i]
      user._id = user.name
      user.estimateAccountValue = ChainUsers.estimateAccountValue(user)
      ChainUsers.upsert({ _id: user.name }, Waka.api.DeleteFieldsWithDots(user))
    }
    cb(null)
  });
}

ChainUsers.estimateAccountValue = function(user) {
  return user.balance;
}