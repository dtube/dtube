Users = new Mongo.Collection(null)

var firstLoad = setInterval(function() {
  if (!Users) return
  if (!Waka) return
  if (!Waka.db.Users) {
    Waka.db.addCollection('Users')
    return
  }

  Users.remove({})
  Users.refreshLocalUsers()
  Waka.db.Users.findOne({}, function(user) {
    if (user) {
      Session.set('activeUsername', user.username)
      Videos.loadFeed(user.username)
    }
  })
  clearInterval(firstLoad)
}, 50)

Users.refreshUsers = function(usernames) {
  steem.api.getAccounts(usernames, function(e, chainusers) {
    for (var i = 0; i < chainusers.length; i++) {
      var user = Users.findOne({username: chainusers[i].name})
      if (chainusers[i].json_metadata && JSON.parse(chainusers[i].json_metadata))
        user.json_metadata = JSON.parse(chainusers[i].json_metadata)
      user.reward_sbd_balance = chainusers[i].reward_sbd_balance
      user.reward_steem_balance = chainusers[i].reward_steem_balance
      user.reward_vesting_balance = chainusers[i].reward_vesting_balance
      user.reward_vesting_steem = chainusers[i].reward_vesting_steem
      Users.update({username: user.username}, user)
    }
  })
}

Users.refreshLocalUsers = function() {
  Waka.db.Users.find({}).fetch(function(results) {
    var usernames = []
    for (var i = 0; i < results.length; i++) {
      Users.insert(results[i])
      usernames.push(results[i].username)


      //NEED FIX
      // fill the subscribes for each local user
      Subs.loadFollowing(results[i].username, undefined, function(follower) {
        var sub = Subs.findOne({following: Meteor.settings.public.beneficiary, follower: follower})
        if (!sub) Subs.followUs(follower, function(follower){
          console.log('Subs loaded & Subscribed to dtube')
        })
        else console.log('Subs loaded')
      })
    }
    Users.refreshUsers(usernames)
  })
}
