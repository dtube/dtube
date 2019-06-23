var parallel = require('run-parallel')

broadcast = {
    multi: {
        comment: function(paSteem, ppSteem, paAvalon, ppAvalon, body, jsonMetadata, tag, burn, cb) {
            if (!tag) tag = ''
            tag = tag.toLowerCase().trim()
            var authorAvalon = Session.get('activeUsername')
            var permlinkAvalon = Template.upload.createPermlink(11)
            if (jsonMetadata.videoId)
                permlinkAvalon = String(jsonMetadata.videoId)

            var authorSteem = Session.get('activeUsernameSteem')
            var permlinkSteem = Template.upload.createPermlink(11)
            
            var jsonSteem = JSON.parse(JSON.stringify(jsonMetadata))
            var jsonAvalon = JSON.parse(JSON.stringify(jsonMetadata))
            jsonSteem.refs = []
            jsonAvalon.refs = []
            if (authorAvalon)
                jsonSteem.refs = ['dtc/'+authorAvalon+'/'+permlinkAvalon]
            if (authorSteem)
                jsonAvalon.refs = ['steem/'+authorSteem+'/'+permlinkSteem]

            var transactions = []

            if (Session.get('activeUsername') && !Session.get('isDTCDisabled'))
                if (burn)
                    transactions.push(function(callback) {
                        broadcast.avalon.promotedComment(permlinkAvalon, paAvalon, ppAvalon, jsonAvalon, tag, burn, callback)
                    })
                else
                    transactions.push(function(callback) {
                        broadcast.avalon.comment(permlinkAvalon, paAvalon, ppAvalon, jsonAvalon, tag, callback)
                    })

            if (Session.get('activeUsernameSteem') && !Session.get('isSteemDisabled'))
                transactions.push(function(callback) {
                    broadcast.steem.comment(permlinkSteem, paSteem, ppSteem, body, jsonSteem, [tag], callback)
                })

            parallel(transactions, function(err, results) {
                cb(err, results)
            })
        },
        vote: function(refs, wAvalon, wSteem, tagAvalon, cb) {
            var transactions = []

            for (let i = 0; i < refs.length; i++) {
                const ref = refs[i].split('/')
                if (ref[0] == 'dtc')
                    if (Session.get('activeUsername') && !Session.get('isDTCDisabled'))
                        transactions.push(function(callback) {
                            broadcast.avalon.vote(ref[1], ref[2], wAvalon, '', callback)
                        })

                if (ref[0] == 'steem')
                    if (Session.get('activeUsernameSteem') && !Session.get('isSteemDisabled'))
                        transactions.push(function(callback) {
                            broadcast.steem.vote(ref[1], ref[2], wSteem, callback)
                        })
            }

            parallel(transactions, function(err, results) {
                cb(err, results)
            })
        },
        // follow: function(nameSteem, nameAvalon, cb) {
        //     broadcast.steem.follow(nameSteem)
        //     broadcast.avalon.follow(nameAvalon)
        // },
        // unfollow: function(nameSteem, nameAvalon, cb) {
        //     broadcast.steem.unfollow(nameSteem)
        //     broadcast.avalon.unfollow(nameAvalon)
        // }
    },
    steem: {
        comment: function(permlink, parentAuthor, parentPermlink, body, jsonMetadata, tags, cb) {
            if (!permlink) permlink = Template.upload.createPermlink(11)
            if (!parentAuthor) parentAuthor = ''
            if (!parentPermlink) parentPermlink = ''
            if (!Session.get('activeUsernameSteem') || Session.get('isSteemDisabled')) return
            var voter = Users.findOne({ username: Session.get('activeUsernameSteem') }).username
            if (!voter) return;
            var author = Session.get('activeUsernameSteem')
            var title = jsonMetadata.title
            finalTags = ['dtube']
            if (Session.get('scot'))
                finalTags.push(Session.get('scot').tag)
            for (let i = 0; i < tags.length; i++)
                if (finalTags.indexOf(tags[i]) == -1)
                    finalTags.push(tags[i])

            if (!body) {
                if ($('textarea[name=body]')[0])
                    body = $('textarea[name=body]')[0].value
                else body = ''
            
                if (!body || body.length < 1)
                    body = genBody(author, permlink, title, jsonMetadata.thumbnailUrl, jsonMetadata.videoId, jsonMetadata.providerName, jsonMetadata.description)
                else
                    body = genBody(author, permlink, title, jsonMetadata.thumbnailUrl, jsonMetadata.videoId, jsonMetadata.providerName, body)
            }
        
            var jsonMetadata = {
              video: jsonMetadata,
              tags: finalTags,
              app: Meteor.settings.public.app
            }
        
            var percent_steem_dollars = 10000
            if ($('input[name=powerup]')[0] && $('input[name=powerup]')[0].checked)
              percent_steem_dollars = 0
        
            var operations = [
              ['comment',
                {
                  parent_author: '',
                  parent_permlink: tags[0],
                  author: author,
                  permlink: permlink,
                  title: title,
                  body: body,
                  json_metadata: JSON.stringify(jsonMetadata)
                }
              ],
              ['comment_options', {
                author: author,
                permlink: permlink,
                max_accepted_payout: '1000000.000 SBD',
                percent_steem_dollars: percent_steem_dollars,
                allow_votes: true,
                allow_curation_rewards: true,
                extensions: [
                  [0, {
                    beneficiaries: [{
                      account: Meteor.settings.public.beneficiary,
                      weight: Session.get('remoteSettings').dfees
                    }]
                  }]
                ]
              }]
            ];
            if (parentAuthor && parentPermlink) {
                operations[0][1].parent_author = parentAuthor
                operations[0][1].parent_permlink = parentPermlink
            }
            broadcast.steem.send(operations, function (err, res) {
                if (!err && res && res.operations)
                    res = res.operations[0][1].author+'/'+res.operations[0][1].permlink
                cb(err, res)
            })
        },
        vote: function(author, permlink, weight, cb) {
            if (!Session.get('activeUsernameSteem') || Session.get('isSteemDisabled')) return
            var voter = Users.findOne({ username: Session.get('activeUsernameSteem') }).username
            if (!voter) return;
            console.log(Users.findOne({ username: Session.get('activeUsernameSteem') }));
            //Steem keychain.
            //Tested working!
            if(Users.findOne({ username: Session.get('activeUsernameSteem') }).type == "keychain") {
                if(!steem_keychain) {
                    cb('LOGIN_ERROR_KEYCHAIN_NOT_INSTALLED')
                    return;
                }
                steem_keychain.requestVote(Session.get('activeUsernameSteem'), permlink, author, weight, function(response) {
                    console.log(response);
                    cb(response.error, response)
                });
                return;
            }
    
            var wif = Users.findOne({ username: Session.get('activeUsernameSteem'), network: 'steem' }).privatekey
            if (wif) {
                steem.broadcast.vote(wif, voter, author, permlink, weight, function (err, result) {
                    cb(err, result)
                })
                return;
            }
            var accessToken = Users.findOne({ username: Session.get('activeUsernameSteem') }).access_token
            var expires_at = Users.findOne({ username: Session.get('activeUsernameSteem') }).expires_at
            if (!accessToken) {
                cb('ERROR_BROADCAST')
                return;
            }
            if (expires_at < new Date()) {
                cb('ERROR_TOKEN_EXPIRED')
                Waka.db.Users.findOne({username: Session.get('activeUsernameSteem')}, function(user) {
                    if (user) {
                      Waka.db.Users.remove(user._id, function(result) {
                        Users.remove({})
                        Users.refreshLocalUsers(function(){})
                        Waka.db.Users.findOne({}, function(user) {
                          if (user) {
                            Session.set('activeUsernameSteem', user.username)
                            Videos.loadFeed(user.username)
                          }
                          else Session.set('activeUsernameSteem', null)
                        })
                      })
                    } else {
                      Users.remove({username: Session.get('activeUsernameSteem')})
                      var newUser = Users.findOne()
                      if (newUser) Session.set('activeUsernameSteem', newUser.username)
                      else Session.set('activeUsernameSteem', null)
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
            if(Users.findOne({ username: Session.get('activeUsernameSteem') }).type == "keychain") {
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
            if (!Session.get('activeUsernameSteem') || Session.get('isSteemDisabled')) return
            var voter = Users.findOne({ username: Session.get('activeUsernameSteem') }).username
            if (!voter) return;
            //Steem keychain support.
            //Tested working
            if(Users.findOne({ username: Session.get('activeUsernameSteem') }).type == "keychain") {
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
            var wif = Users.findOne({ username: Session.get('activeUsernameSteem'), network: 'steem' }).privatekey
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
            var accessToken = Users.findOne({ username: Session.get('activeUsernameSteem') }).access_token
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
            if (!Session.get('activeUsernameSteem') || Session.get('isSteemDisabled')) return
            var voter = Users.findOne({ username: Session.get('activeUsernameSteem') }).username
            if (!voter) return;
            //Steem keychain
            //Tested working.
            if(Users.findOne({ username: Session.get('activeUsernameSteem') }).type == "keychain") {
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
    
            var wif = Users.findOne({ username: Session.get('activeUsernameSteem'), network: 'steem' }).privatekey
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
            var accessToken = Users.findOne({ username: Session.get('activeUsernameSteem') }).access_token
            if (!accessToken) {
                cb('ERROR_BROADCAST')
                return;
            }
            sc2.setAccessToken(accessToken);
            sc2.unfollow(voter, following, function(err, result) {
                cb(err, result)
            })
        },
        reblog: function(author, permlink, cb) {
            if (!Session.get('activeUsernameSteem') || Session.get('isSteemDisabled')) return
            var reblogger = Users.findOne({ username: Session.get('activeUsernameSteem') }).username
            if (!reblogger) return;
            //Steem keychain support
            //Tested working.
            if(Users.findOne({ username: Session.get('activeUsernameSteem') }).type == "keychain") {
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
            var wif = Users.findOne({ username: Session.get('activeUsernameSteem'), network: 'steem' }).privatekey
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
            var accessToken = Users.findOne({ username: Session.get('activeUsernameSteem') }).access_token
            if (!accessToken) {
                cb('ERROR_BROADCAST')
                return;
            }
            sc2.setAccessToken(accessToken);
            sc2.reblog(reblogger, author, permlink, function(err, result) {
                cb(err, result)
            })
        },
        send: function(operations, cb) {
            if (!Session.get('activeUsernameSteem') || Session.get('isSteemDisabled')) return
            var voter = Users.findOne({ username: Session.get('activeUsernameSteem') }).username
            if (!voter) return;
            //Steem keychain
            //Tested with extension.
            if(Users.findOne({ username: Session.get('activeUsernameSteem') }).type == "keychain") {
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
            var wif = Users.findOne({ username: Session.get('activeUsernameSteem'), network: 'steem' }).privatekey
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
            var accessToken = Users.findOne({ username: Session.get('activeUsernameSteem') }).access_token
            if (!accessToken) {
                cb('ERROR_BROADCAST')
                return;
            }
            sc2.setAccessToken(accessToken);
            sc2.broadcast(operations, function(err, result) {
                cb(err, result)
            })
        }
    },
    avalon: {
        comment: function(permlink, parentAuthor, parentPermlink, jsonMetadata, tag, cb) {
            if (!permlink) {
                permlink = Template.upload.createPermlink(11)
                if (jsonMetadata.videoId)
                permlink = String(jsonMetadata.videoId)
            }
            if (!Session.get('activeUsername') || Session.get('isDTCDisabled')) return
            // cross posting possible
            var voter = Users.findOne({ username: Session.get('activeUsername') }).username
            if (!voter) return;
            var wif = Users.findOne({ username: Session.get('activeUsername'), network: 'avalon' }).privatekey
            var weight = UserSettings.get('voteWeight') * 100
            var tx = {
                type: 4,
                data: {
                    link: permlink,
                    json: jsonMetadata,
                    vt: Math.floor(avalon.votingPower(Users.findOne({username: Session.get('activeUsername')}))*weight/10000)
                }
            }
            if (tag) tx.data.tag = tag
            else tx.data.tag = ""
            if (parentAuthor && parentPermlink) {
                tx.data.pa = parentAuthor
                tx.data.pp = parentPermlink
            }
            tx = avalon.sign(wif, voter, tx)
            avalon.sendTransaction(tx, function(err, res) {
                if (!err) res = tx.sender+'/'+tx.data.link
                cb(err, res)
                Users.refreshUsers([Session.get('activeUsername')])
            })
            return;
        },
        promotedComment: function(permlink, parentAuthor, parentPermlink, jsonMetadata, tag, burn, cb) {
            if (!Session.get('activeUsername') || Session.get('isDTCDisabled')) return
            // can be cross posted but wont be promoted on steem
            var voter = Users.findOne({ username: Session.get('activeUsername') }).username
            if (!voter) return;
            var wif = Users.findOne({ username: Session.get('activeUsername'), network: 'avalon' }).privatekey
            var weight = UserSettings.get('voteWeight') * 100
            var tx = {
                type: 13,
                data: {
                    link: permlink,
                    json: jsonMetadata,
                    burn: burn,
                    vt: Math.floor(avalon.votingPower(Users.findOne({username: Session.get('activeUsername')}))*weight/10000)
                }
            }
            if (tag) tx.data.tag = tag
            if (parentAuthor && parentPermlink) {
                tx.data.pa = parentAuthor
                tx.data.pp = parentPermlink
            }
            tx = avalon.sign(wif, voter, tx)
            avalon.sendTransaction(tx, function(err, res) {
                if (!err) res = tx.sender+'/'+tx.data.link
                cb(err, res)
                Users.refreshUsers([Session.get('activeUsername')])
            })
            return;
        },
        vote: function(author, permlink, weight, tag, cb) {
            if (!Session.get('activeUsername') || Session.get('isDTCDisabled')) return
            // cross vote possible
            var voter = Users.findOne({ username: Session.get('activeUsername') }).username
            if (!voter) return;
            var wif = Users.findOne({ username: Session.get('activeUsername'), network: 'avalon' }).privatekey
            var vt = Math.floor(avalon.votingPower(Users.findOne({username: Session.get('activeUsername')}))*weight/10000)
            if (wif) {
                var tx = {
                    type: 5,
                    data: {
                        author: author,
                        link: permlink,
                        vt: vt,
                        tag: tag
                    }
                }
                tx = avalon.sign(wif, voter, tx)
                avalon.sendTransaction(tx, function(err, res) {
                    cb(err, res)
                    Users.refreshUsers([Session.get('activeUsername')])
                })
                return;
            }
        },
        follow: function(following, cb) {
            if (!Session.get('activeUsername') || Session.get('isDTCDisabled')) return
            // cross follow possible
            var voter = Users.findOne({ username: Session.get('activeUsername') }).username
            if (!voter) return;
            var wif = Users.findOne({ username: Session.get('activeUsername'), network: 'avalon' }).privatekey
            if (wif) {
                var tx = {
                    type: 7,
                    data: {
                        target: following
                    }
                }
                tx = avalon.sign(wif, voter, tx)
                avalon.sendTransaction(tx, function(err, res) {
                    cb(err, res)
                })
                return;
            }
        },
        unfollow: function(following, cb) {
            if (!Session.get('activeUsername') || Session.get('isDTCDisabled')) return
            // cross unfollow possible
            var voter = Users.findOne({ username: Session.get('activeUsername') }).username
            if (!voter) return;
            var wif = Users.findOne({ username: Session.get('activeUsername'), network: 'avalon' }).privatekey
            if (wif) {
                var tx = {
                    type: 8,
                    data: {
                        target: following
                    }
                }
                tx = avalon.sign(wif, voter, tx)
                avalon.sendTransaction(tx, function(err, res) {
                    cb(err, res)
                })
                return;
            }
        },
        transfer: function(receiver, amount, memo, cb) {
            if (!Session.get('activeUsername') || Session.get('isDTCDisabled')) return
            // avalon only
            var sender = Users.findOne({ username: Session.get('activeUsername') }).username
            if (!sender) return;
            var wif = Users.findOne({ username: Session.get('activeUsername'), network: 'avalon' }).privatekey
            if (wif) {
                var tx = {
                    type: 3,
                    data: {
                        receiver: receiver,
                        amount: amount,
                        memo: memo
                    }
                }
                tx = avalon.sign(wif, sender, tx)
                avalon.sendTransaction(tx, function(err, res) {
                    cb(err, res)
                })
                return;
            }
        },
        editProfile: function(json, cb) {
            if (!Session.get('activeUsername') || Session.get('isDTCDisabled')) return
            // avalon only - steemitwallet.com for steem
            var creator = Users.findOne({ username: Session.get('activeUsername') }).username
            if (!creator) return;
            var wif = Users.findOne({ username: Session.get('activeUsername'), network: 'avalon' }).privatekey
            if (wif) {
                var tx = {
                    type: 6,
                    data: {
                        json: json
                    }
                }
                tx = avalon.sign(wif, creator, tx)
                avalon.sendTransaction(tx, function(err, res) {
                    cb(err, res)
                })
                return;
            }
        },
        newAccount: function(username, pub, cb) {
            if (!Session.get('activeUsername') || Session.get('isDTCDisabled')) return
            // avalon only
            var creator = Users.findOne({ username: Session.get('activeUsername') }).username
            if (!creator) return;
            var wif = Users.findOne({ username: Session.get('activeUsername'), network: 'avalon' }).privatekey
            if (wif) {
                var tx = {
                    type: 0,
                    data: {
                        name: username,
                        pub: pub
                    }
                }
                tx = avalon.sign(wif, creator, tx)
                avalon.sendTransaction(tx, function(err, res) {
                    cb(err, res)
                })
                return;
            }
        },
        newKey: function(id, pub, types, cb) {
            if (!Session.get('activeUsername') || Session.get('isDTCDisabled')) return
            // avalon only
            var voter = Users.findOne({ username: Session.get('activeUsername') }).username
            if (!voter) return;
            var wif = Users.findOne({ username: Session.get('activeUsername'), network: 'avalon' }).privatekey
            if (wif) {
                var tx = {
                    type: 10,
                    data: {
                        id: id,
                        pub: pub,
                        types: types
                    }
                }
                tx = avalon.sign(wif, voter, tx)
                avalon.sendTransaction(tx, function(err, res) {
                    cb(err, res)
                })
                return;
            }
        },
        removeKey: function(id, cb) {
            if (!Session.get('activeUsername') || Session.get('isDTCDisabled')) return
            // avalon only
            var voter = Users.findOne({ username: Session.get('activeUsername') }).username
            if (!voter) return;
            var wif = Users.findOne({ username: Session.get('activeUsername'), network: 'avalon' }).privatekey
            if (wif) {
                var tx = {
                    type: 11,
                    data: {
                        id: id
                    }
                }
                tx = avalon.sign(wif, voter, tx)
                avalon.sendTransaction(tx, function(err, res) {
                    cb(err, res)
                })
                return;
            }
        },
        voteLeader: function(target, cb) {
            if (!Session.get('activeUsername') || Session.get('isDTCDisabled')) return
            // avalon only
            var voter = Users.findOne({ username: Session.get('activeUsername') }).username
            if (!voter) return;
            var wif = Users.findOne({ username: Session.get('activeUsername'), network: 'avalon' }).privatekey
            if (wif) {
                var tx = {
                    type: 1,
                    data: {
                        target: target
                    }
                }
                tx = avalon.sign(wif, voter, tx)
                avalon.sendTransaction(tx, function(err, res) {
                    cb(err, res)
                })
                return;
            }
        },
        unvoteLeader: function(target, cb) {
            if (!Session.get('activeUsername') || Session.get('isDTCDisabled')) return
            // avalon only
            var voter = Users.findOne({ username: Session.get('activeUsername') }).username
            if (!voter) return;
            var wif = Users.findOne({ username: Session.get('activeUsername'), network: 'avalon' }).privatekey
            if (wif) {
                var tx = {
                    type: 2,
                    data: {
                        target: target
                    }
                }
                tx = avalon.sign(wif, voter, tx)
                avalon.sendTransaction(tx, function(err, res) {
                    cb(err, res)
                })
                return;
            }
        }
    }
}

var genBody = function (author, permlink, title, snaphash, videohash, videoprovider, description) {
    if (FlowRouter.current().route.name == 'golive')
      return Template.upload.genBodyLivestream(author, permlink, title, snaphash, description)
    else {
      var body = '<center>'
      body += '<a href=\'https://new.d.tube/#!/v/' + author + '/' + permlink + '\'>'
      if (Session.get('overlayHash'))
        body += '<img src=\'https://snap1.d.tube/ipfs/' + Session.get('overlayHash') + '\'></a></center><hr>\n\n'
      else
        body += '<img src=\'' + snaphash + '\'></a></center><hr>\n\n'
      
      if (videoprovider == 'YouTube')
        body += 'https://www.youtube.com/watch?v=' + videohash + '\n\n'
      body += description
      body += '\n\n<hr>'
      body += '<a href=\'https://new.d.tube/#!/v/' + author + '/' + permlink + '\'> ▶️ DTube</a><br />'
      if (videoprovider == 'ipfs')
        body += '<a href=\'https://ipfs.io/ipfs/' + videohash + '\'> ▶️ IPFS</a>'
      if (videoprovider == 'YouTube')
        body += '<a href=\'https://www.youtube.com/watch?v=' + videohash + '\'> ▶️ YouTube</a>'
      return body
    }
}