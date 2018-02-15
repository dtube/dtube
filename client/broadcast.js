broadcast = {
    vote: function(author, permlink, weight, cb) {
        var voter = Users.findOne({ username: Session.get('activeUsername') }).username
        if (!voter) return;
        var wif = Users.findOne({ username: Session.get('activeUsername') }).privatekey
        if (wif) {
            steem.broadcast.vote(wif, voter, author, permlink, weight, function (err, result) {
                cb(err, result)
            })
            return;
        }
        var accessToken = Users.findOne({ username: Session.get('activeUsername') }).access_token
        var expires_at = Users.findOne({ username: Session.get('activeUsername') }).expires_at
        if (!accessToken) {
            cb('ERROR_BROADCAST')
            return;
        }
        if (expires_at < new Date()) {
            cb('ERROR_TOKEN_EXPIRED')
            Waka.db.Users.findOne({username: Session.get('activeUsername')}, function(user) {
                if (user) {
                  Waka.db.Users.remove(user._id, function(result) {
                    Users.remove({})
                    Users.refreshLocalUsers()
                    Waka.db.Users.findOne({}, function(user) {
                      if (user) {
                        Session.set('activeUsername', user.username)
                        Videos.loadFeed(user.username)
                      }
                      else Session.set('activeUsername', null)
                    })
                  })
                } else {
                  Users.remove({username: Session.get('activeUsername')})
                  var newUser = Users.findOne()
                  if (newUser) Session.set('activeUsername', newUser.username)
                  else Session.set('activeUsername', null)
                }
            })
            FlowRouter.go('/login')
            return
        }
        sc2.setAccessToken(accessToken);
        sc2.vote(voter, author, permlink, weight, function(err, result) {
            cb(err, result)
        })
    },
    claimRewardBalance: function(username, reward_steem_balance, reward_sbd_balance, reward_vesting_balance, cb) {
        var voter = Users.findOne({ username: username }).username
        if (!voter) return;
        var wif = Users.findOne({ username: username }).privatekey
        if (wif) {
            steem.broadcast.claimRewardBalance(wif, voter, reward_steem_balance, reward_sbd_balance, reward_vesting_balance, function (err, result) {
                cb(err, result)
            })
            return;
        }
        var accessToken = Users.findOne({ username: username }).access_token
        if (!accessToken) {
            cb('ERROR_BROADCAST')
            return;
        }
        sc2.setAccessToken(accessToken);
        sc2.claimRewardBalance(voter, reward_steem_balance, reward_sbd_balance, reward_vesting_balance, function(err, result) {
            cb(err, result)
        })
    },
    follow: function(following, cb) {
        var voter = Users.findOne({ username: Session.get('activeUsername') }).username
        if (!voter) return;
        var wif = Users.findOne({ username: Session.get('activeUsername') }).privatekey
        if (wif) {
            steem.broadcast.customJson(
                wif,
                [],
                [voter],
                'follow',
                JSON.stringify(
                    ['follow', {
                        follower: voter,
                        following: following,
                        what: ['blog']
                    }]
                ),
                function (err, result) {
                    cb(err, result)
                }
            );
            return;
        }
        var accessToken = Users.findOne({ username: Session.get('activeUsername') }).access_token
        if (!accessToken) {
            cb('ERROR_BROADCAST')
            return;
        }
        sc2.setAccessToken(accessToken);
        sc2.follow(voter, following, function(err, result) {
            cb(err, result)
        })
    },
    unfollow: function(following, cb) {
        var voter = Users.findOne({ username: Session.get('activeUsername') }).username
        if (!voter) return;
        var wif = Users.findOne({ username: Session.get('activeUsername') }).privatekey
        if (wif) {
            steem.broadcast.customJson(
                wif,
                [],
                [voter],
                'follow',
                JSON.stringify(
                    ['follow', {
                        follower: voter,
                        following: following,
                        what: []
                    }]
                ),
                function (err, result) {
                    cb(err, result)
                }
            );
            return;
        }
        var accessToken = Users.findOne({ username: Session.get('activeUsername') }).access_token
        if (!accessToken) {
            cb('ERROR_BROADCAST')
            return;
        }
        sc2.setAccessToken(accessToken);
        sc2.unfollow(voter, following, function(err, result) {
            cb(err, result)
        })
    },
    comment: function(parentAuthor, parentPermlink, body, jsonMetadata, cb) {
        var voter = Users.findOne({ username: Session.get('activeUsername') }).username
        if (!voter) return;
        var permlink = Template.upload.createPermlink(9)
        var wif = Users.findOne({ username: Session.get('activeUsername') }).privatekey
        if (wif) {
            steem.broadcast.comment(wif, parentAuthor, parentPermlink, voter, permlink, permlink, body, jsonMetadata, function (err, result) {
                cb(err, result)
            })
            return;
        }
        var accessToken = Users.findOne({ username: Session.get('activeUsername') }).access_token
        if (!accessToken) {
            cb('ERROR_BROADCAST')
            return;
        }
        sc2.setAccessToken(accessToken);
        sc2.comment(parentAuthor, parentPermlink, voter, permlink, permlink, body, jsonMetadata, function(err, result) {
            cb(err, result)
        })
    },
    send: function(operations, cb) {
        var voter = Users.findOne({ username: Session.get('activeUsername') }).username
        if (!voter) return;
        var permlink = Template.upload.createPermlink(9)
        var wif = Users.findOne({ username: Session.get('activeUsername') }).privatekey
        if (wif) {
            steem.broadcast.send(
                { operations: operations, extensions: [] },
                { posting: wif },
                function(err, result) {
                    cb(err, result)
                }
            )
            return;
        }
        var accessToken = Users.findOne({ username: Session.get('activeUsername') }).access_token
        if (!accessToken) {
            cb('ERROR_BROADCAST')
            return;
        }
        sc2.setAccessToken(accessToken);
        sc2.broadcast(operations, function(err, result) {
            cb(err, result)
        })
    }
}