Users = new Mongo.Collection(null)
usersObserver = new PersistentMinimongo2(Users, 'users', function() {
  var users = Users.find().fetch()
  for (let o = 0; o < users.length; o++) {
    if (users[o].temporary) {
      Users.remove({_id: users[o]._id})
      return
    }

    if (users[o].network == 'steem')
      Template.loginsteem.success(users[o].username, true)
    if (users[o].network == 'avalon')
      Template.loginavalon.success(users[o].username, true)
    if (users[o].network == 'hive')
      Template.loginhive.success(users[o].username, true)
    if (users[o].network == 'blurt')
      Template.loginblurt.success(users[o].username, true)
  }
});

Users.refreshUsers = function(usernames, cb) {
  if (usernames.length < 1) return;
  avalon.getAccounts(usernames, function(e, chainusers) {
    if (!chainusers) return;
    for (var i = 0; i < chainusers.length; i++) {
      var user = Users.findOne({username: chainusers[i].name, network: 'avalon'})
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
      user.maxVt = chainusers[i].maxVt
      user.proposalVotes = chainusers[i].proposalVotes
      user.voteLock = chainusers[i].voteLock
      Users.update({username: user.username, network: 'avalon'}, user)

      if (cb) cb()

      if (chainusers[i].name == Session.get('activeUsername')) {
        // refresh vt and bw now and regularly for active user
        updateVtBw()
        intervalVtBw = setInterval(function(){
          updateVtBw()
        },2500)

        function updateVtBw() {
          if (!Session.get('activeUsername'))
            clearInterval(intervalVtBw)
          var user = Users.findOne({username: Session.get('activeUsername'), network: 'avalon'})
          user.vtDisplay = avalon.votingPower(user)
          user.bwDisplay = avalon.bandwidth(user)
          Users.update({username: user.username, network: 'avalon'}, user)
        }
      }
    }
  })
}