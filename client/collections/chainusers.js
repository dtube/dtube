ChainUsers = new Mongo.Collection(null)

ChainUsers.fetchNames = function (names, cb) {
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
      steem.formatter.estimateAccountValue(user).done(function (value) {
        user.estimateAccountValue = value;
        ChainUsers.upsert({ _id: user.id }, Waka.api.DeleteFieldsWithDots(user));
      })
    }
    cb(null)
  });
}