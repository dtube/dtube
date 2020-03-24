var parallel = require('run-parallel')

broadcast = {
    multi: {
        comment: function(paSteem, ppSteem, paAvalon, ppAvalon, body, jsonMetadata, tag, burn, cb) {
            if (!tag) tag = ''
            tag = tag.toLowerCase().trim()
            var authorAvalon = Session.get('activeUsername')
            var permlinkAvalon = Template.publish.createPermlink(jsonMetadata)

            var authorSteem = Session.get('activeUsernameSteem')
            // Steem cannot have capital letters in permlink :,(
            var permlinkSteem = Template.publish.randomPermlink(11)
            
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
                        broadcast.avalon.comment(permlinkAvalon, paAvalon, ppAvalon, jsonAvalon, tag, false, callback)
                    })

            if (Session.get('activeUsernameSteem') && !Session.get('isSteemDisabled'))
                transactions.push(function(callback) {
                    broadcast.steem.comment(permlinkSteem, paSteem, ppSteem, body, jsonSteem, [tag], callback)
                })

            parallel(transactions, function(err, results) {
                cb(err, results)
            })
        },
        editComment: (refs,json,body,cb) => {
            // For editing existing post/comment only
            if (!refs || refs === []) return cb('Nothing to edit')

            let networks = []
            for (let i = 0; i < refs.length; i++) {
                let toEdit = refs[i].split('/')
                networks.push(toEdit[0])
            }

            let jsonAvalon = Object.assign({},json)
            let jsonSteem = Object.assign({},json)
            if (networks.includes('dtc') && networks.includes('steem')) {
                jsonAvalon.refs = [refs[networks.indexOf('steem')]]
                jsonSteem.refs = [refs[networks.indexOf('dtc')]]
            }

            // Get content from each chain to check for parent posts (in case of comment edits)
            let getops = {}

            if (networks.includes('steem') && Session.get('activeUsernameSteem') && !Session.get('isSteemDisabled')) {
                let steemref = refs[networks.indexOf('steem')].split('/')
                getops.steem = (callback) => {
                    steem.api.getContent(steemref[1],steemref[2],callback)
                }
            }

            if (networks.includes('dtc') && Session.get('activeUsername') && !Session.get('isDTCDisabled')) {
                let avalonref = refs[networks.indexOf('dtc')].split('/')
                getops.dtc = (callback) => {
                    avalon.getContent(avalonref[1],avalonref[2],callback)
                }
            }

            // if getops is still empty, there's nothing to edit (perhaps both steem and dtc broadcasts are disabled)
            if (getops === {}) return cb('Nothing to edit')

            parallel(getops,(errs,originalposts) => {
                if (errs) return cb('Error get content')

                // Broadcast edits
                let broadcastops = []
                if (originalposts.steem) {
                    let newSteemJsonMeta = JSON.parse(originalposts.steem.json_metadata)
                    newSteemJsonMeta.video = jsonSteem
                    let steemtx = [
                        ['comment',{
                            parent_author: originalposts.steem.parent_author,
                            parent_permlink: originalposts.steem.parent_permlink,
                            author: originalposts.steem.author,
                            permlink: originalposts.steem.permlink,
                            title: jsonSteem.title,
                            body: body || originalposts.steem.body,
                            json_metadata: JSON.stringify(newSteemJsonMeta)
                        }]
                    ]
                    broadcastops.push((callback) => {
                        broadcast.steem.send(steemtx,callback)
                    })
                }

                if (originalposts.dtc) {
                    broadcastops.push((callback) => {
                        broadcast.avalon.comment(originalposts.dtc.link,originalposts.dtc.pa,originalposts.dtc.pp,jsonAvalon,'',true,callback)
                    })
                }

                parallel(broadcastops,(errors,results) => {
                    if (errors) return cb('Error tx broadcast')
                    cb(null,results)
                })
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
            if (!parentPermlink) parentPermlink = 'hive-196037'
            if (!Session.get('activeUsernameSteem') || Session.get('isSteemDisabled')) return
            var voter = Users.findOne({ username: Session.get('activeUsernameSteem'), network: 'steem' }).username
            if (!voter) return;
            var author = Session.get('activeUsernameSteem')
            var title = jsonMetadata.title
            finalTags = ['dtube']
            if (Session.get('scot'))
                finalTags.push(Session.get('scot').tag)
            for (let i = 0; i < tags.length; i++)
                if (finalTags.indexOf(tags[i]) == -1)
                    finalTags.push(tags[i])

            if (!body)
                body = genSteemBody(author, permlink, jsonMetadata)

            // console.log(body)
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
                  parent_permlink: 'dtube',
                  author: author,
                  category: 'hive-196037',
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
            operations[0][1].parent_author = parentAuthor
            operations[0][1].parent_permlink = parentPermlink
            broadcast.steem.send(operations, function (err, res) {
                if (!err && res && res.operations)
                    res = res.operations[0][1].author+'/'+res.operations[0][1].permlink
                if (!err && res && res.data && res.data.operations)
                    res = res.data.operations[0][1].author+'/'+res.data.operations[0][1].permlink
                cb(err, res)
            })
        },
        vote: function(author, permlink, weight, cb) {
            if (!Session.get('activeUsernameSteem') || Session.get('isSteemDisabled')) return
            var voter = Users.findOne({ username: Session.get('activeUsernameSteem'), network: 'steem' }).username
            if (!voter) return;
            //Steem keychain.
            //Tested working!
            if(Users.findOne({ username: Session.get('activeUsernameSteem'), network: 'steem' }).type == "keychain") {
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
        },
        subHive: function(cb) {
            if (!Session.get('activeUsernameSteem') || Session.get('isSteemDisabled')) return
            var voter = Users.findOne({ username: Session.get('activeUsernameSteem'), network: 'steem' }).username
            if (!voter) return;
            //Steem keychain support.
            //Tested working
            if(Users.findOne({ username: Session.get('activeUsernameSteem'), network: 'steem' }).type == "keychain") {
                console.log("");
                if(!steem_keychain) {
                    cb('LOGIN_ERROR_KEYCHAIN_NOT_INSTALLED')
                    return;
                }
                var operations = JSON.stringify(
                        ['subscribe', {
                            community: "hive-196037"
                        }]
                    );
                steem_keychain.requestCustomJson(voter, "community", "Posting", operations , "community" ,function(response) {
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
                    'community',
                    JSON.stringify(
                        ['subscribe', {
                            community: "hive-196037"
                        }]
                    ),
                    function (err, result) {
                        cb(err, result)
                    }
                );
                return;
            }
        },
        follow: function(following, cb) {
            if (!Session.get('activeUsernameSteem') || Session.get('isSteemDisabled')) return
            var voter = Users.findOne({ username: Session.get('activeUsernameSteem'), network: 'steem' }).username
            if (!voter) return;
            //Steem keychain support.
            //Tested working
            if(Users.findOne({ username: Session.get('activeUsernameSteem'), network: 'steem' }).type == "keychain") {
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
        },
        unfollow: function(following, cb) {
            if (!Session.get('activeUsernameSteem') || Session.get('isSteemDisabled')) return
            var voter = Users.findOne({ username: Session.get('activeUsernameSteem'), network: 'steem' }).username
            if (!voter) return;
            //Steem keychain
            //Tested working.
            if(Users.findOne({ username: Session.get('activeUsernameSteem'), network: 'steem' }).type == "keychain") {
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
        },
        reblog: function(author, permlink, cb) {
            if (!Session.get('activeUsernameSteem') || Session.get('isSteemDisabled')) return
            var reblogger = Users.findOne({ username: Session.get('activeUsernameSteem'), network: 'steem' }).username
            if (!reblogger) return;
            //Steem keychain support
            //Tested working.
            if(Users.findOne({ username: Session.get('activeUsernameSteem'), network: 'steem' }).type == "keychain") {
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
        },
        send: function(operations, cb) {
            if (!Session.get('activeUsernameSteem') || Session.get('isSteemDisabled')) return
            var voter = Users.findOne({ username: Session.get('activeUsernameSteem'), network: 'steem' }).username
            if (!voter) return;
            //Steem keychain
            //Tested with extension.
            if(Users.findOne({ username: Session.get('activeUsernameSteem'), network: 'steem' }).type == "keychain") {
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
        },
        decrypt_memo: (memo,cb) => {
            if (!Session.get('activeUsernameSteem')) return
            if (Users.findOne({ username: Session.get('activeUsernameSteem'), network: 'steem'}).type == 'keychain') {
                if (!steem_keychain) return cb('LOGIN_ERROR_KEYCHAIN_NOT_INSTALLED')
                steem_keychain.requestVerifyKey(Session.get('activeUsernameSteem'),memo,'Posting',(response) => {
                    cb(response.error,response.result.substr(1))
                })
                return
            }
            let wif = Users.findOne({ username: Session.get('activeUsernameSteem'), network: 'steem' }).privatekey
            let decoded = steem.memo.decode(wif,memo).substr(1)
            cb(null,decoded)
        }
    },
    avalon: {
        comment: function(permlink, parentAuthor, parentPermlink, jsonMetadata, tag, isEditing, cb) {
            if (!permlink) {
                permlink = Template.upload.createPermlink(11)
                if (jsonMetadata.videoId)
                permlink = String(jsonMetadata.videoId)
            }
            if (!Session.get('activeUsername') || Session.get('isDTCDisabled')) return
            // cross posting possible
            var voter = Users.findOne({ username: Session.get('activeUsername'), network: 'avalon' }).username
            if (!voter) return;
            var wif = Users.findOne({ username: Session.get('activeUsername'), network: 'avalon' }).privatekey
            var weight = UserSettings.get('voteWeight') * 100
            var tx = {
                type: 4,
                data: {
                    link: permlink,
                    json: jsonMetadata,
                    vt: Math.floor(avalon.votingPower(Users.findOne({username: Session.get('activeUsername'), network: 'avalon'}))*weight/10000)
                }
            }
            if (isEditing) tx.data.vt = 1 // Spend only 1 VP for editing existing content
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
            var voter = Users.findOne({ username: Session.get('activeUsername'), network: 'avalon' }).username
            if (!voter) return;
            var wif = Users.findOne({ username: Session.get('activeUsername'), network: 'avalon' }).privatekey
            var weight = UserSettings.get('voteWeight') * 100
            var tx = {
                type: 13,
                data: {
                    link: permlink,
                    json: jsonMetadata,
                    burn: burn,
                    vt: Math.floor(avalon.votingPower(Users.findOne({username: Session.get('activeUsername'), network: 'avalon'}))*weight/10000)
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
            var voter = Users.findOne({ username: Session.get('activeUsername'), network: 'avalon' }).username
            if (!voter) return;
            var wif = Users.findOne({ username: Session.get('activeUsername'), network: 'avalon' }).privatekey
            var vt = Math.floor(avalon.votingPower(Users.findOne({username: Session.get('activeUsername'), network: 'avalon'}))*weight/10000)
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
            var voter = Users.findOne({ username: Session.get('activeUsername'), network: 'avalon' }).username
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
            var voter = Users.findOne({ username: Session.get('activeUsername'), network: 'avalon' }).username
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
            var sender = Users.findOne({ username: Session.get('activeUsername'), network: 'avalon' }).username
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
            var creator = Users.findOne({ username: Session.get('activeUsername'), network: 'avalon' }).username
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
            var creator = Users.findOne({ username: Session.get('activeUsername'), network: 'avalon' }).username
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
            var voter = Users.findOne({ username: Session.get('activeUsername'), network: 'avalon' }).username
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
            var voter = Users.findOne({ username: Session.get('activeUsername'), network: 'avalon' }).username
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
            var voter = Users.findOne({ username: Session.get('activeUsername'), network: 'avalon' }).username
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
            var voter = Users.findOne({ username: Session.get('activeUsername'), network: 'avalon' }).username
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
    },
    hive: {
        subHive: () => {
            if (!Session.get('activeUsernameHive') || Session.get('isHiveDisabled')) return
            let voter = Users.findOne({ username: Session.get('activeUsernameHive'), network: 'hive' })
            if (!voter.username) return;

            let operations = JSON.stringify(
                ['subscribe', {
                    community: "hive-196037"
                }]
            )

            // Hive Keychain
            if(voter.type == "keychain") {
                if(!hive_keychain) {
                    return cb('LOGIN_ERROR_HIVE_KEYCHAIN_NOT_INSTALLED')
                }
                hive_keychain.requestCustomJson(voter.username, "community", "Posting", operations , "community" ,(response) => {
                    cb(response.error, response)
                })
                return
            }
            let wif = voter.privatekey
            if (wif) hive.broadcast.customJson(
                wif,
                [],
                [voter.username],
                'community',
                operations,
                (err, result) => cb(err, result)
            )
        }
    }
}

var genSteemBody = function(author, permlink, video) {
    var body = '<center>'
    body += '<a href=\'https://d.tube/#!/v/' + Session.get('activeUsernameSteem') + '/' + permlink + '\'>'
    if (Videos.getOverlayUrl({json: video}))
        body += '<img src=\'' + Videos.getOverlayUrl({json: video}) + '\' ></a></center><hr>\n\n'
    else
        body += '<img src=\'' + Videos.getThumbnailUrl({json: video}) + '\' ></a></center><hr>\n\n'

    if ($('textarea[name=body]')[0] && $('textarea[name=body]')[0].value.length > 0)
        body += $('textarea[name=body]')[0].value
    else if (video.desc)
        body += video.desc
    else if (video.description)
        body += video.description

    body += '\n\n<hr>'
    body += '<a href=\'https://d.tube/#!/v/' + author + '/' + permlink + '\'> ▶️ DTube</a><br />'
    
    var files = video.files
    if (!files) return body
    if (files.ipfs && files.ipfs.vid && files.ipfs.vid.src)
        body += '<a href=\'https://ipfs.io/ipfs/' + files.ipfs.vid.src + '\'> ▶️ IPFS</a><br />'
    if (files.btfs && files.btfs.vid && files.btfs.vid.src)
        body += '<a href=\'https://btfs.d.tube/btfs/' + files.btfs.vid.src + '\'> ▶️ BTFS</a><br />'
    if (files.sia && files.sia.vid && files.sia.vid.src)
        body += '<a href=\'https://siasky.net/' + files.sia.vid.src + '\'> ▶️ Skynet</a><br />'

    // todo link to 3rd parties ?
    return body
}