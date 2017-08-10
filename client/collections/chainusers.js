ChainUsers = new Mongo.Collection(null)

ChainUsers.fetchNames = function(names) {
  steem.api.getAccounts(names, function(err, result) {
    for (var i = 0; i < result.length; i++) {
      var user = result[i]
      try {
        user.json_metadata = JSON.parse(user.json_metadata)
      } catch(e) {
      }
      ChainUsers.upsert({_id: result[i].id}, Waka.api.DeleteFieldsWithDots(user));
    }
  });
}
