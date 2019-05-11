Users = new Mongo.Collection(null)

var firstLoad = setInterval(function() {
  if (!Users) return
  if (!Waka) return
  if (!Waka.db.Users) {
    Waka.db.addCollection('Users')
    return
  }

  Users.remove({})
  Users.refreshLocalUsers(function(){
    var dtubeDefUser = Users.findOne({network: 'avalon'})
    var steemDefUser = Users.findOne({network: 'steem'})

    if (dtubeDefUser)
      Template.loginavalon.success(dtubeDefUser.username, true)
    if (steemDefUser)
      Template.loginsteem.success(steemDefUser.username, true)
  })
  clearInterval(firstLoad)
}, 50)

Users.refreshUsers = function(usernames) {
  if (usernames.length < 1) return;
  avalon.getAccounts(usernames, function(e, chainusers) {
    if (!chainusers) return;
    for (var i = 0; i < chainusers.length; i++) {
      var user = Users.findOne({username: chainusers[i].name})
      // if (chainusers[i].json && JSON.parse(chainusers[i].json))
      //   user.json_metadata = JSON.parse(chainusers[i].json)
      // user.reward_sbd_balance = chainusers[i].reward_sbd_balance
      // user.reward_steem_balance = chainusers[i].reward_steem_balance
      // user.reward_vesting_balance = chainusers[i].reward_vesting_balance
      // user.reward_vesting_steem = chainusers[i].reward_vesting_steem
      user.json = chainusers[i].json
      user.balance = chainusers[i].balance
      user.bw = chainusers[i].bw
      user.vt = chainusers[i].vt
      user.approves = chainusers[i].approves
      Users.update({username: user.username}, user)

      if (chainusers[i].name == Session.get('activeUsername')) {
        // refresh vt and bw now and regularly for active user
        updateVtBw()
        intervalVtBw = setInterval(function(){
          updateVtBw()
        },2500)

        function updateVtBw() {
          if (!Session.get('activeUsername'))
            clearInterval(intervalVtBw)
          var user = Users.findOne({username: Session.get('activeUsername')})
          user.vtDisplay = avalon.votingPower(user)
          user.bwDisplay = avalon.bandwidth(user)
          Users.update({username: user.username}, user)
        }
      }
    }
  })
}

Users.refreshLocalUsers = function(cb) {
  Waka.db.Users.find({}).fetch(function(results) {
    var usernames = []
    for (var i = 0; i < results.length; i++) {
      if (!results[i].network) continue;
      if (!Users.findOne({username: results[i].username, network: results[i].network})) {
        Users.insert(results[i])
        usernames.push(results[i].username)
        // fill the subscribes for each local user
        Subs.loadFollowing(results[i].username, undefined, true, function(follower) {
          //var sub = Subs.findOne({following: Meteor.settings.public.beneficiary, follower: follower})
          // if (!sub) Subs.followUs(follower, function(follower){
          //   console.log('Subscribed to dtube')
          // })
          console.log('Subs loaded')
        })
      }
    }
    cb(null)
    Users.refreshUsers(usernames)
  })
}
