Subs = new Mongo.Collection(null)

Subs.loadFollowing = function(username, startFollowing = undefined, cb) {
  var limit = 100
  steem.api.getFollowing(username, startFollowing, 'blog', limit, function(err, results) {
    console.log(err, results)
    if (err) console.log(err)
    for (var i = 0; i < results.length; i++)
      Subs.upsert(results[i], results[i])

    if (results.length == limit)
      Subs.loadFollowing(username, results[results.length-1].following, cb)
    else cb(username)
  });
}

Subs.loadFollowers = function(username, startFollowers = undefined, cb) {
  var limit = 100
  steem.api.getFollowers(username, startFollowers, 'blog', limit, function(err, results) {
    console.log(err, results)
    if (err) console.log(err)
    for (var i = 0; i < results.length; i++)
      Subs.upsert(results[i], results[i])

    if (results.length == limit)
      Subs.loadFollowers(username, results[results.length-1].follower, cb)
    else cb(username)
  });
}

Subs.followUs = function(follower, cb) {
  var json = JSON.stringify(
    ['follow', {
      follower: follower,
      following: Meteor.settings.public.beneficiary,
      what: ['blog']
    }]
  );
  steem.broadcast.customJson(
    Users.findOne({username: follower}).privatekey,
    [],
    [Session.get('activeUsername')],
    'follow',
    json,
    function(err, result) {
      cb()
    }
  );

}
