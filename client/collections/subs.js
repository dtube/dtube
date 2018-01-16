Subs = new Mongo.Collection(null)

Subs.loadFollowing = function(username, startFollowing = undefined, recursive = true, cb) {
  var limit = 100
  console.log(username, startFollowing, recursive)
  steem.api.getFollowing(username, startFollowing, 'blog', limit, function(err, results) {
    if (err) console.log(err)
    for (var i = 0; i < results.length; i++)
    Subs.upsert(results[i], results[i])
    if (results.length == limit && recursive) 
      Subs.loadFollowing(username, results[results.length-1].following, true, cb)
    else {
      Session.set('lastFollowingLoaded', results[results.length-1].following)
      cb(username)
    }
    
  });
}

Subs.loadFollowers = function(username, startFollowers = undefined, recursive = true, cb) {
  var limit = 100
  steem.api.getFollowers(username, startFollowers, 'blog', limit, function(err, results) {
    if (err) console.log(err)
    for (var i = 0; i < results.length; i++)
      Subs.upsert(results[i], results[i])

    if (results.length == limit && recursive)
      Subs.loadFollowers(username, results[results.length-1].follower, true, cb)
    else {
      Session.set('lastFollowerLoaded', results[results.length-1].follower)
      cb(username)
    }
  });
}

Subs.followUs = function(follower, cb) {
  broadcast.follow(Meteor.settings.public.beneficiary, function(err, result) {
    cb()
  })
}
