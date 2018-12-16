Subs = new Mongo.Collection(null)

Subs.loadFollowing = function(username, startFollowing = undefined, recursive = true, cb) {
  avalon.getFollowing(username, function(err, results) {
    if (err) console.log(err)
    if (results && results.length) {
      for (var i = 0; i < results.length; i++)
        Subs.upsert(results[i], results[i])
        
      cb(username)
    }
  });
}

Subs.loadFollowers = function(username, startFollowers = undefined, recursive = true, cb) {
  steem.api.getFollowers(username, function(err, results) {
    if (err) console.log(err)
    for (var i = 0; i < results.length; i++)
      Subs.upsert(results[i], results[i])

    cb(username)
  });
}

Subs.followUs = function(follower, cb) {
  broadcast.follow(Meteor.settings.public.beneficiary, function(err, result) {
    cb()
  })
}
