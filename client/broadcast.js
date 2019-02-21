broadcast = {
    vote: function(author, permlink, weight, cb) {
        var voter = Users.findOne({ username: Session.get('activeUsername') }).username
        if (!voter) return;
        console.log(Users.findOne({ username: Session.get('activeUsername') }));
        //Steem keychain.
        //Tested working!
        if(Users.findOne({ username: Session.get('activeUsername') }).type == "keychain") {
            if(!steem_keychain) {
                cb('LOGIN_ERROR_KEYCHAIN_NOT_INSTALLED')
                return;
            }
            steem_keychain.requestVote(Session.get('activeUsername'), permlink, author, weight, function(response) {
                console.log(response);
                cb(response.error, response)
            });
            return;
        }

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
                    Users.refreshLocalUsers(function(){})
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
        var account = Users.findOne({ username: username }).username
        if (!account) return;
        //Unknown for steem keychain support, will wait on that. Most likely a custom JSON operation.
        //Steem keychain.
        if(Users.findOne({ username: Session.get('activeUsername') }).type == "keychain") {
            if(!steem_keychain) {
                cb('LOGIN_ERROR_KEYCHAIN_NOT_INSTALLED')
                return;
            }
            var operations = [
                    ['claim_reward_balance', {
                        account: account,
                        reward_steem: reward_steem_balance,
                        reward_sbd: reward_sbd_balance,
                        reward_vests: reward_vesting_balance
                    }]
            ];

            steem_keychain.requestBroadcast(account, operations, "Posting", function(response) {
                console.log(response);
                cb(response.error, response)
            });
            return;
        }
        var wif = Users.findOne({ username: username }).privatekey
        if (wif) {
            steem.broadcast.claimRewardBalance(wif, account, reward_steem_balance, reward_sbd_balance, reward_vesting_balance, function (err, result) {
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
        sc2.claimRewardBalance(account, reward_steem_balance, reward_sbd_balance, reward_vesting_balance, function(err, result) {
            cb(err, result)
        })
    },
    follow: function(following, cb) {
        var voter = Users.findOne({ username: Session.get('activeUsername') }).username
        if (!voter) return;
        //Steem keychain support.
        //Tested working
        if(Users.findOne({ username: Session.get('activeUsername') }).type == "keychain") {
            console.log("");
            if(!steem_keychain) {
                cb('LOGIN_ERROR_KEYCHAIN_NOT_INSTALLED')
                return;
            }
            var operations = JSON.stringify(
                    ['follow', {
                        follower: voter,
                        following: following,
                        what: ['blog']
                    }]
                );
            steem_keychain.requestCustomJson(voter, "follow", "Posting", operations , "follow" ,function(response) {
                console.log(response);
                cb(response.error, response)
            });
            return;
        }
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
        //Steem keychain
        //Tested working.
        if(Users.findOne({ username: Session.get('activeUsername') }).type == "keychain") {
            if(!steem_keychain) {
                cb('LOGIN_ERROR_KEYCHAIN_NOT_INSTALLED')
                return;
            }
            var operations = JSON.stringify(
                    ['follow', {
                        follower: voter,
                        following: following,
                        what: []
                    }]
                );
            steem_keychain.requestCustomJson(voter, "follow", "Posting", operations , "unfollow" ,function(response) {
                console.log(response);
                cb(response.error, response)
            });
            return;
        }

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
        //Steem keychain
        //Tested working.
        if(Users.findOne({ username: Session.get('activeUsername') }).type == "keychain") {
            if(!steem_keychain) {
                cb('LOGIN_ERROR_KEYCHAIN_NOT_INSTALLED')
                return;
            }
            var operations = [ 
                ['comment',
                        {
                            parent_author: parentAuthor,
                            parent_permlink: parentPermlink,
                            author: voter,
                            permlink: permlink,
                            title: "",
                            body: body,
                            json_metadata: JSON.stringify(jsonMetadata)
                        }
                    ]
                ];
            console.log(JSON.stringify(operations));
            steem_keychain.requestBroadcast(voter, operations, "Posting" ,function(response) {
                console.log(response);
                cb(response.error, response)
            });
            return;
        }
        
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
    reblog: function(author, permlink, cb) {
        var reblogger = Users.findOne({ username: Session.get('activeUsername') }).username
        if (!reblogger) return;
        //Steem keychain support
        //Tested working.
        if(Users.findOne({ username: Session.get('activeUsername') }).type == "keychain") {
            if(!steem_keychain) {
                cb('LOGIN_ERROR_KEYCHAIN_NOT_INSTALLED')
                return;
            }
            var operations = JSON.stringify(
                    ['reblog', {
                        account: reblogger,
                        author: author,
                        permlink: permlink
                    }]
                );
            steem_keychain.requestCustomJson(reblogger, "follow", "Posting", operations , "resteem" ,function(response) {
                console.log(response);
                cb(response.error, response)
            });
            return;
        }
        var wif = Users.findOne({ username: Session.get('activeUsername') }).privatekey
        if (wif) {
            steem.broadcast.customJson(
                wif,
                [],
                [reblogger],
                'reblog',
                JSON.stringify(
                    ['reblog', {
                        account: reblogger,
                        author: author,
                        permlink: permlink
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
        sc2.reblog(reblogger, author, permlink, function(err, result) {
            cb(err, result)
        })
    },
    streamVerif: function(verifKey, cb) {
        //Deprecated!
        var streamer = Users.findOne({ username: Session.get('activeUsername') }).username
        if (!streamer) return;
        var wif = Users.findOne({ username: Session.get('activeUsername') }).privatekey
        if (wif) {
            steem.broadcast.customJson(
                wif,
                [],
                [streamer],
                'dtubeStreamVerif',
                JSON.stringify(
                    { key: verifKey }
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
        var params = {
            required_auths: [],
            required_posting_auths: [streamer],
            id: 'dtubeStreamVerif',
            json: JSON.stringify({ key: verifKey }),
        };
        sc2.broadcast([['custom_json', params]], function(err, result) {
            cb(err, result.result)
        })
    },
    send: function(operations, cb) {
        var voter = Users.findOne({ username: Session.get('activeUsername') }).username
        if (!voter) return;
        //Steem keychain
        //Tested with extension.
        if(Users.findOne({ username: Session.get('activeUsername') }).type == "keychain") {
            if(!steem_keychain) {
                cb('LOGIN_ERROR_KEYCHAIN_NOT_INSTALLED')
                return;
            }
            steem_keychain.requestBroadcast(voter, operations, "Posting" ,function(response) {
                console.log(response);
                cb(response.error, response)
            });
            return;
        }
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
