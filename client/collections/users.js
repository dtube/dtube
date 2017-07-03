Users = new Mongo.Collection(null)

var firstLoad = setInterval(function() {
  if (!Users) return
  if (!Waka) return
  if (!Waka.db.Users) {
    Waka.db.addCollection('Users')
    return
  }

  // loading videos
  Users.refreshUsers()
  clearInterval(firstLoad)
  Waka.db.Users.findOne({}, function(user) {
    if (user) Session.set('activeUsername', user.username)
  })
}, 50)



Users.refreshUsers = function() {
  Waka.db.Users.find({}).fetch(function(results) {
    var usernames = []
    for (var i = 0; i < results.length; i++) {
      Users.insert(results[i])
      usernames.push(results[i].username)
    }
    steem.api.getAccounts(usernames, function(e, chainusers) {
      for (var i = 0; i < chainusers.length; i++) {
        var user = Users.findOne({username: chainusers[i].name})
        if (chainusers[i].json_metadata && JSON.parse(chainusers[i].json_metadata))
          user.json_metadata = JSON.parse(chainusers[i].json_metadata)
        Users.update({username: user.username}, user)
      }
    })
  })
}
