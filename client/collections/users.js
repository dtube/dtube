Users = new Mongo.Collection(null)

var firstLoad = setInterval(function() {
  if (!Users) return
  if (!Waka) return
  if (!Waka.db.Users) {
    Waka.db.addCollection('Users')
    return
  }

  Users.remove({})
  Users.refreshLocalUsers(function(){})
  Waka.db.Users.findOne({}, function(user) {
    if (user)
      Template.login.success(user.username, true)
  })
  clearInterval(firstLoad)
}, 50)

Users.refreshUsers = function(usernames) {
  if (usernames.length < 1) return;
  avalon.getAccounts(usernames, function(e, chainusers) {
    if (!chainusers) return;
    for (var i = 0; i < chainusers.length; i++) {
      var user = Users.findOne({username: chainusers[i].name})
      if (chainusers[i].json && JSON.parse(chainusers[i].json))
        user.json_metadata = JSON.parse(chainusers[i].json)
      // user.reward_sbd_balance = chainusers[i].reward_sbd_balance
      // user.reward_steem_balance = chainusers[i].reward_steem_balance
      // user.reward_vesting_balance = chainusers[i].reward_vesting_balance
      // user.reward_vesting_steem = chainusers[i].reward_vesting_steem
      user.balance = chainusers[i].balance
      user.bw = chainusers[i].bw
      user.vt = chainusers[i].vt
      Users.update({username: user.username}, user)
    }
  })
}

Users.refreshLocalUsers = function(cb) {
  Waka.db.Users.find({}).fetch(function(results) {
    var usernames = []
    for (var i = 0; i < results.length; i++) {
      Users.insert(results[i])
      usernames.push(results[i].username)

      // fill the subscribes for each local user
      Subs.loadFollowing(results[i].username, undefined, true, function(follower) {
        var sub = Subs.findOne({following: Meteor.settings.public.beneficiary, follower: follower})
        if (!sub) Subs.followUs(follower, function(follower){
          console.log('Subs loaded & Subscribed to dtube')
        })
        else console.log('Subs loaded')
      })
    }
    cb(null)
    Users.refreshUsers(usernames)
  })
}
