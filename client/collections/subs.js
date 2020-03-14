Subs = new Mongo.Collection(null)

Subs.loadFollowing = function(username, startFollowing = undefined, recursive = true, cb) {
  avalon.getFollowing(username, function(err, results) {
    if (err) console.log(err)
    if (results && results.length) {
      for (var i = 0; i < results.length; i++) {
        var sub = {
          follower: username,
          following: results[i],
          what: ['blog']
        }
        Subs.upsert(sub, sub)
      }
      cb(username, results.length)
    }
  });
}

Subs.loadFollowers = function(username, startFollowers = undefined, recursive = true, cb) {
  avalon.getFollowers(username, function(err, results) {
    if (err) console.log(err)
    if (results && results.length) {
      for (var i = 0; i < results.length; i++){
        var sub = {
          follower: results[i],
          following: username,
          what: ['blog']
        }
        Subs.upsert(sub, sub)
      }
    }
    cb(username, results.length)
  });
}

Subs.followUs = function(follower, cb) {
  broadcast.avalon.follow(Meteor.settings.public.beneficiary, function(err, result) {
    cb()
  })
}
