ChainUsers = new Mongo.Collection(null)

ChainUsers.fetchNames = function(names) {
  steem.api.getAccounts(names, function(err, result) {
    for (var i = 0; i < result.length; i++) {
      var user = result[i]
      user.json_metadata = JSON.parse(user.json_metadata)
      ChainUsers.upsert({_id: result[i].id}, user);
    }
  });
}
