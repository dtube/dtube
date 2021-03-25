var parallel = require('run-parallel')

broadcast = {
    multi: {
        comment: function(paSteem, ppSteem, paHive, ppHive, paAvalon, ppAvalon, body, jsonMetadata, tag, burn, cb, publishVP) {
            if (!tag) tag = ''
            tag = tag.toLowerCase().trim()
            let authorAvalon = !Session.get('isDTCDisabled') ? Session.get('activeUsername') : null
            let permlinkAvalon = Template.publish.createPermlink(jsonMetadata)

            let authorHive = !Session.get('isHiveDisabled') ? Session.get('activeUsernameHive') : null
            let authorSteem = !Session.get('isSteemDisabled') ? Session.get('activeUsernameSteem') : null
                // Steem cannot have capital letters in permlink :,(
            let permlinkSteem = Template.publish.randomPermlink(11) // Hive permlink is the same as Steem

            // one of the parent author/permlinks should not be undefined to be a comment op
            let isComment = (paAvalon && ppAvalon) || (paSteem && ppSteem) || (paHive && ppHive)
            let canPostToAvalon = authorAvalon && (!isComment || paAvalon && ppAvalon)
            let canPostToHive = authorHive && (!isComment || paHive && ppHive)
            let canPostToSteem = authorSteem && (!isComment || paSteem && ppSteem)

            let jsonSteem = JSON.parse(JSON.stringify(jsonMetadata))
            let jsonAvalon = JSON.parse(JSON.stringify(jsonMetadata))
            let jsonHive = JSON.parse(JSON.stringify(jsonMetadata))
            jsonSteem.refs = []
            jsonAvalon.refs = []
            jsonHive.refs = []
            if (canPostToAvalon && canPostToHive && canPostToSteem) {
                jsonSteem.refs = ['dtc/' + authorAvalon + '/' + permlinkAvalon, 'hive/' + authorHive + '/' + permlinkSteem]
                jsonAvalon.refs = ['steem/' + authorSteem + '/' + permlinkSteem, 'hive/' + authorHive + '/' + permlinkSteem]
                jsonHive.refs = ['dtc/' + authorAvalon + '/' + permlinkAvalon, 'steem/' + authorSteem + '/' + permlinkSteem]
            } else if (canPostToAvalon && canPostToHive) {
                jsonAvalon.refs = ['hive/' + authorHive + '/' + permlinkSteem]
                jsonHive.refs = ['dtc/' + authorAvalon + '/' + permlinkAvalon]
            } else if (canPostToAvalon && canPostToSteem) {
                jsonAvalon.refs = ['steem/' + authorSteem + '/' + permlinkSteem]
                jsonSteem.refs = ['dtc/' + authorAvalon + '/' + permlinkAvalon]
            } else if (canPostToHive && canPostToSteem) {
                jsonSteem.refs = ['hive/' + authorHive + '/' + permlinkSteem]
                jsonHive.refs = ['steem/' + authorSteem + '/' + permlinkSteem]
            }

            let transactions = []

            if (canPostToAvalon)
                if (burn)
                    transactions.push(function(callback) {
                        broadcast.avalon.promotedComment(permlinkAvalon, paAvalon, ppAvalon, jsonAvalon, tag, burn, callback, null, publishVP)
                    })
                else
                    transactions.push(function(callback) {
                        broadcast.avalon.comment(permlinkAvalon, paAvalon, ppAvalon, jsonAvalon, tag, false, callback, null, publishVP)
                    })

            if (canPostToSteem)
                transactions.push(function(callback) {
                    broadcast.steem.comment(permlinkSteem, paSteem, ppSteem, body, jsonSteem, [tag], callback)
                })

            if (canPostToHive)
                transactions.push((callback) => {
                    broadcast.hive.comment(permlinkSteem, paHive, ppHive, body, jsonHive, [tag], callback)
                })

            parallel(transactions, function(err, results) {
                cb(err, results)
            })
        },
        editComment: (refs, json, body, cb) => {
            // For editing existing post/comment only
            if (!refs || refs === []) return cb('Nothing to edit')

            let networks = []
            for (let i = 0; i < refs.length; i++) {
                let toEdit = refs[i].split('/')
                networks.push(toEdit[0])
            }

            let jsonAvalon = Object.assign({}, json)
            let jsonSteem = Object.assign({}, json)
            let jsonHive = Object.assign({}, json)
            if (networks.includes('dtc') && networks.includes('steem') && networks.includes('hive')) {
                jsonAvalon.refs = [refs[networks.indexOf('steem')], refs[networks.indexOf('hive')]]
                jsonSteem.refs = [refs[networks.indexOf('dtc')], refs[networks.indexOf('hive')]]
                jsonHive.refs = [refs[networks.indexOf('dtc')], refs[networks.indexOf('steem')]]
            } else if (networks.includes('dtc') && networks.includes('steem')) {
                jsonAvalon.refs = [refs[networks.indexOf('steem')]]
                jsonSteem.refs = [refs[networks.indexOf('dtc')]]
            } else if (networks.includes('dtc') && networks.includes('hive')) {
                jsonAvalon.refs = [refs[networks.indexOf('hive')]]
                jsonHive.refs = [refs[networks.indexOf('dtc')]]
            } else if (networks.includes('hive') && networks.includes('steem')) {
                jsonHive.refs = [refs[networks.indexOf('steem')]]
                jsonSteem.refs = [refs[networks.indexOf('hive')]]
            }

            // Get content from each chain to check for parent posts (in case of comment edits)
            let getops = {}

            if (networks.includes('steem') && Session.get('activeUsernameSteem') && !Session.get('isSteemDisabled')) {
                let steemref = refs[networks.indexOf('steem')].split('/')
                getops.steem = (callback) => {
                    steem.api.getContent(steemref[1], steemref[2], callback)
                }
            }

            if (networks.includes('dtc') && Session.get('activeUsername') && !Session.get('isDTCDisabled')) {
                let avalonref = refs[networks.indexOf('dtc')].split('/')
                getops.dtc = (callback) => {
                    avalon.getContent(avalonref[1], avalonref[2], callback)
                }
            }

            if (networks.includes('hive') && Session.get('activeUsernameHive') && !Session.get('isHiveDisabled')) {
                let hiveref = refs[networks.indexOf('hive')].split('/')
                getops.hive = (callback) => {
                    hive.api.getContent(hiveref[1], hiveref[2], callback)
                }
            }

            // if getops is still empty, there's nothing to edit (perhaps both steem and dtc broadcasts are disabled)
            if (getops === {}) return cb('Nothing to edit')

            parallel(getops, (errs, originalposts) => {
                if (errs) return cb('Error get content')

                // Broadcast edits
                let broadcastops = []
                if (originalposts.steem) {
                    let newSteemJsonMeta = JSON.parse(originalposts.steem.json_metadata)
                    newSteemJsonMeta.video = jsonSteem
                    let steemtx = [
                        ['comment', {
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
                        broadcast.steem.send(steemtx, callback)
                    })
                }

                if (originalposts.hive) {
                    let newHiveJsonMeta = JSON.parse(originalposts.hive.json_metadata)
                    newHiveJsonMeta.video = jsonHive
                    let hivetx = [
                        ['comment', {
                            parent_author: originalposts.hive.parent_author,
                            parent_permlink: originalposts.hive.parent_permlink,
                            author: originalposts.hive.author,
                            permlink: originalposts.hive.permlink,
                            title: jsonHive.title,
                            body: body || originalposts.hive.body,
                            json_metadata: JSON.stringify(newHiveJsonMeta)
                        }]
                    ]
                    broadcastops.push((callback) => {
                        broadcast.hive.send(hivetx, callback)
                    })
                }

                if (originalposts.dtc) {
                    broadcastops.push((callback) => {
                        broadcast.avalon.comment(originalposts.dtc.link, originalposts.dtc.pa, originalposts.dtc.pp, jsonAvalon, '', true, callback)
                    })
                }

                parallel(broadcastops, (errors, results) => {
                    if (errors) return cb('Error tx broadcast')
                    cb(null, results)
                })
            })
        },
        vote: function(refs, wAvalon, wSteem, wHive, tagAvalon, tipAvalon, cb) {
            var transactions = []

            for (let i = 0; i < refs.length; i++) {
                const ref = refs[i].split('/')
                if (ref[0] == 'dtc')
                    if (Session.get('activeUsername') && !Session.get('isDTCDisabled'))
                        transactions.push(function(callback) {
                            broadcast.avalon.vote(ref[1], ref[2], wAvalon, tagAvalon, tipAvalon, callback)
                        })

                if (ref[0] == 'steem')
                    if (Session.get('activeUsernameSteem') && !Session.get('isSteemDisabled'))
                        transactions.push(function(callback) {
                            broadcast.steem.vote(ref[1], ref[2], wSteem, callback)
                        })
                if (ref[0] == 'hive')
                    if (Session.get('activeUsernameHive') && !Session.get('isHiveDisabled'))
                        transactions.push((callback) => {
                            broadcast.hive.vote(ref[1], ref[2], wHive, callback)
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
            if (!permlink) permlink = Template.publish.randomPermlink(11)
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
            broadcast.steem.send(operations, function(err, res) {
                if (!err && res && res.operations)
                    res = res.operations[0][1].author + '/' + res.operations[0][1].permlink
                if (!err && res && res.data && res.data.operations)
                    res = res.data.operations[0][1].author + '/' + res.data.operations[0][1].permlink
                cb(err, res)
            })
        },
        vote: function(author, permlink, weight, cb) {
            if (!Session.get('activeUsernameSteem') || Session.get('isSteemDisabled')) return
            var voter = Users.findOne({ username: Session.get('activeUsernameSteem'), network: 'steem' }).username
            if (!voter) return;
            //Steem keychain.
            //Tested working!
            if (Users.findOne({ username: Session.get('activeUsernameSteem'), network: 'steem' }).type == "keychain") {
                if (!steem_keychain) {
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
                steem.broadcast.vote(wif, voter, author, permlink, weight, function(err, result) {
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
            if (Users.findOne({ username: Session.get('activeUsernameSteem'), network: 'steem' }).type == "keychain") {
                console.log("");
                if (!steem_keychain) {
                    cb('LOGIN_ERROR_KEYCHAIN_NOT_INSTALLED')
                    return;
                }
                var operations = JSON.stringify(
                    ['subscribe', {
                        community: "hive-196037"
                    }]
                );
                steem_keychain.requestCustomJson(voter, "community", "Posting", operations, "community", function(response) {
                    console.log(response);
                    cb(response.error, response)
                });
                return;
            }
            var wif = Users.findOne({ username: Session.get('activeUsernameSteem'), network: 'steem' }).privatekey
            if (wif) {
                steem.broadcast.customJson(
                    wif, [], [voter],
                    'community',
                    JSON.stringify(
                        ['subscribe', {
                            community: "hive-196037"
                        }]
                    ),
                    function(err, result) {
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
            if (Users.findOne({ username: Session.get('activeUsernameSteem'), network: 'steem' }).type == "keychain") {
                console.log("");
                if (!steem_keychain) {
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
                steem_keychain.requestCustomJson(voter, "follow", "Posting", operations, "follow", function(response) {
                    console.log(response);
                    cb(response.error, response)
                });
                return;
            }
            var wif = Users.findOne({ username: Session.get('activeUsernameSteem'), network: 'steem' }).privatekey
            if (wif) {
                steem.broadcast.customJson(
                    wif, [], [voter],
                    'follow',
                    JSON.stringify(
                        ['follow', {
                            follower: voter,
                            following: following,
                            what: ['blog']
                        }]
                    ),
                    function(err, result) {
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
            if (Users.findOne({ username: Session.get('activeUsernameSteem'), network: 'steem' }).type == "keychain") {
                if (!steem_keychain) {
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
                steem_keychain.requestCustomJson(voter, "follow", "Posting", operations, "unfollow", function(response) {
                    console.log(response);
                    cb(response.error, response)
                });
                return;
            }

            var wif = Users.findOne({ username: Session.get('activeUsernameSteem'), network: 'steem' }).privatekey
            if (wif) {
                steem.broadcast.customJson(
                    wif, [], [voter],
                    'follow',
                    JSON.stringify(
                        ['follow', {
                            follower: voter,
                            following: following,
                            what: []
                        }]
                    ),
                    function(err, result) {
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
            if (Users.findOne({ username: Session.get('activeUsernameSteem'), network: 'steem' }).type == "keychain") {
                if (!steem_keychain) {
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
                steem_keychain.requestCustomJson(reblogger, "follow", "Posting", operations, "resteem", function(response) {
                    console.log(response);
                    cb(response.error, response)
                });
                return;
            }
            var wif = Users.findOne({ username: Session.get('activeUsernameSteem'), network: 'steem' }).privatekey
            if (wif) {
                steem.broadcast.customJson(
                    wif, [], [reblogger],
                    'reblog',
                    JSON.stringify(
                        ['reblog', {
                            account: reblogger,
                            author: author,
                            permlink: permlink
                        }]
                    ),
                    function(err, result) {
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
            if (Users.findOne({ username: Session.get('activeUsernameSteem'), network: 'steem' }).type == "keychain") {
                if (!steem_keychain) {
                    cb('LOGIN_ERROR_KEYCHAIN_NOT_INSTALLED')
                    return;
                }
                steem_keychain.requestBroadcast(voter, operations, "Posting", function(response) {
                    console.log(response);
                    cb(response.error, response)
                });
                return;
            }
            var wif = Users.findOne({ username: Session.get('activeUsernameSteem'), network: 'steem' }).privatekey
            if (wif) {
                steem.broadcast.send({ operations: operations, extensions: [] }, { posting: wif },
                    function(err, result) {
                        cb(err, result)
                    }
                )
                return;
            }
        },
        decrypt_memo: (memo, cb) => {
            if (!Session.get('activeUsernameSteem')) return
            if (Users.findOne({ username: Session.get('activeUsernameSteem'), network: 'steem' }).type == 'keychain') {
                if (!steem_keychain) return cb('LOGIN_ERROR_KEYCHAIN_NOT_INSTALLED')
                steem_keychain.requestVerifyKey(Session.get('activeUsernameSteem'), memo, 'Posting', (response) => {
                    cb(response.error, response.result.substr(1))
                })
                return
            }
            let wif = Users.findOne({ username: Session.get('activeUsernameSteem'), network: 'steem' }).privatekey
            let decoded = steem.memo.decode(wif, memo).substr(1)
            cb(null, decoded)
        }
    },
    avalon: {
        comment: function(permlink, parentAuthor, parentPermlink, jsonMetadata, tag, isEditing, cb, newWif, publishVP) {
            if (!permlink) {
                permlink = Template.publish.randomPermlink(11)
                if (jsonMetadata.videoId)
                    permlink = String(jsonMetadata.videoId)
            }
            if (!Session.get('activeUsername') || Session.get('isDTCDisabled')) return
            let activeuser = Users.findOne({username: Session.get('activeUsername'), network: 'avalon'})
            if (!newWif && activeuser.allowedTxTypes && activeuser.allowedTxTypes.indexOf(4) == -1)
                return missingPermission.handler('COMMENT',
                    (newWif)=>broadcast.avalon.comment(permlink,parentAuthor,parentPermlink,jsonMetadata,tag,isEditing,cb,newWif),
                    ()=>cb('missing required permission COMMENT'))
            let voter = activeuser.username
            if (!voter) return;
            let wif = activeuser.privatekey
            if (newWif) wif = newWif
            let weight = UserSettings.get('voteWeight') * 100
            let tx = {
                type: 4,
                data: {
                    link: permlink,
                    json: jsonMetadata,
                    vt: Math.floor(avalon.votingPower(activeuser) * weight / 10000)
                }
            }
            if (publishVP) tx.data.vt = publishVP
            if (isEditing) tx.data.vt = 1 // Spend only 1 VP for editing existing content
            if (tag) tx.data.tag = tag
            else tx.data.tag = ""
            if (parentAuthor && parentPermlink) {
                tx.data.pa = parentAuthor
                tx.data.pp = parentPermlink
            }
            tx = avalon.sign(wif, voter, tx)
            avalon.sendTransaction(tx, function(err, res) {
                if (!err) res = tx.sender + '/' + tx.data.link
                cb(err, res)
                Users.refreshUsers([Session.get('activeUsername')])
            })
            return;
        },
        promotedComment: function(permlink, parentAuthor, parentPermlink, jsonMetadata, tag, burn, cb, newWif, publishVP) {
            if (!permlink) {
                permlink = Template.publish.randomPermlink(11)
                if (jsonMetadata.videoId)
                    permlink = String(jsonMetadata.videoId)
            }
            if (!Session.get('activeUsername') || Session.get('isDTCDisabled')) return
                // can be cross posted but wont be promoted on steem
            let activeuser = Users.findOne({username: Session.get('activeUsername'), network: 'avalon'})
            if (!newWif && activeuser.allowedTxTypes && activeuser.allowedTxTypes.indexOf(13) == -1)
                return missingPermission.handler('PROMOTED_COMMENT',
                    (newWif)=>broadcast.avalon.promotedComment(permlink,parentAuthor,parentPermlink,jsonMetadata,tag,burn,cb,newWif),
                    ()=>cb('missing required permission PROMOTED_COMMENT'))
            let voter = activeuser.username
            if (!voter) return;
            let wif = activeuser.privatekey
            if (newWif) wif = newWif
            let weight = UserSettings.get('voteWeight') * 100
            let tx = {
                type: 13,
                data: {
                    link: permlink,
                    json: jsonMetadata,
                    burn: burn,
                    vt: Math.floor(avalon.votingPower(activeuser) * weight / 10000)
                }
            }
            if (publishVP) tx.data.vt = publishVP
            if (tag) tx.data.tag = tag
            else tx.data.tag = ""
            if (parentAuthor && parentPermlink) {
                tx.data.pa = parentAuthor
                tx.data.pp = parentPermlink
            }
            tx = avalon.sign(wif, voter, tx)
            avalon.sendTransaction(tx, function(err, res) {
                if (!err) res = tx.sender + '/' + tx.data.link
                cb(err, res)
                Users.refreshUsers([Session.get('activeUsername')])
            })
            return;
        },
        vote: function(author, permlink, weight, tag, tip, cb, newWif) {
            if (!Session.get('activeUsername') || Session.get('isDTCDisabled')) return
                // cross vote possible
            let activeuser = Users.findOne({username: Session.get('activeUsername'), network: 'avalon'})
            if (!newWif && tip <= 0 && activeuser.allowedTxTypes && activeuser.allowedTxTypes.indexOf(5) == -1)
                return missingPermission.handler('VOTE',
                    (newWif)=>broadcast.avalon.vote(author,permlink,weight,tag,tip,cb,newWif),
                    ()=>cb('missing required permission VOTE'))
            else if (!newWif && tip > 0 && activeuser.allowedTxTypes && activeuser.allowedTxTypes.indexOf(19) == -1)
                return missingPermission.handler('TIPPED_VOTE',
                        (newWif)=>broadcast.avalon.vote(author,permlink,weight,tag,tip,cb,newWif),
                        ()=>cb('missing required permission TIPPED_VOTE'))
            let voter = activeuser.username
            if (!voter) return;
            let wif = activeuser.privatekey
            let vt = Math.floor(avalon.votingPower(activeuser) * weight / 10000)
            if (newWif) wif = newWif
            if (wif) {
                let tx = {
                    type: 5,
                    data: {
                        author: author,
                        link: permlink,
                        vt: vt,
                        tag: tag
                    }
                }
                if (tip > 0) {
                    tx = {
                       type: 19,
                        data: {
                            author: author,
                            link: permlink,
                            vt: vt,
                            tag: tag,
                            tip: tip
                        }
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
        follow: function(following, cb, newWif) {
            if (!Session.get('activeUsername') || Session.get('isDTCDisabled')) return
                // cross follow possible
            let activeuser = Users.findOne({username: Session.get('activeUsername'), network: 'avalon'})
            if (!newWif && activeuser.allowedTxTypes && activeuser.allowedTxTypes.indexOf(7) == -1)
                return missingPermission.handler('FOLLOW',
                    (newWif)=>broadcast.avalon.follow(following,cb,newWif),
                    ()=>cb('missing required permission FOLLOW'))
            let voter = activeuser.username
            if (!voter) return;
            let wif = activeuser.privatekey
            if (newWif) wif = newWif
            if (wif) {
                let tx = {
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
        unfollow: function(following, cb, newWif) {
            if (!Session.get('activeUsername') || Session.get('isDTCDisabled')) return
                // cross unfollow possible
            let activeuser = Users.findOne({username: Session.get('activeUsername'), network: 'avalon'})
            if (!newWif && activeuser.allowedTxTypes && activeuser.allowedTxTypes.indexOf(8) == -1)
                return missingPermission.handler('UNFOLLOW',
                    (newWif)=>broadcast.avalon.unfollow(following,cb,newWif),
                    ()=>cb('missing required permission UNFOLLOW'))
            let voter = activeuser.username
            if (!voter) return;
            let wif = activeuser.privatekey
            if (newWif) wif = newWif
            if (wif) {
                let tx = {
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
        transfer: function(receiver, amount, memo, cb, newWif) {
            if (!Session.get('activeUsername') || Session.get('isDTCDisabled')) return
                // avalon only
            let activeuser = Users.findOne({username: Session.get('activeUsername'), network: 'avalon'})
            if (!newWif && activeuser.allowedTxTypes && activeuser.allowedTxTypes.indexOf(3) == -1)
                return missingPermission.handler('TRANSFER',
                    (newWif)=>broadcast.avalon.transfer(receiver,amount,memo,cb,newWif),
                    ()=>cb('missing required permission TRANSFER'))
            let sender = activeuser.username
            if (!sender) return;
            let wif = activeuser.privatekey
            if (newWif) wif = newWif
            if (wif) {
                let tx = {
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
        editProfile: function(json, cb, newWif) {
            if (!Session.get('activeUsername') || Session.get('isDTCDisabled')) return
                // avalon only - steemitwallet.com for steem
            let activeuser = Users.findOne({username: Session.get('activeUsername'), network: 'avalon'})
            if (!newWif && activeuser.allowedTxTypes && activeuser.allowedTxTypes.indexOf(6) == -1)
                return missingPermission.handler('USER_JSON',
                    (newWif)=>broadcast.avalon.editProfile(json,cb,newWif),
                    ()=>cb('missing required permission USER_JSON'))
            let creator = activeuser.username
            if (!creator) return;
            let wif = activeuser.privatekey
            if (newWif) wif = newWif
            if (wif) {
                let tx = {
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
        newAccount: function(username, pub, cb, newWif) {
            if (!Session.get('activeUsername') || Session.get('isDTCDisabled')) return
                // avalon only
            let activeuser = Users.findOne({username: Session.get('activeUsername'), network: 'avalon'})
            if (!newWif && activeuser.allowedTxTypes && activeuser.allowedTxTypes.indexOf(0) == -1)
                return missingPermission.handler('NEW_ACCOUNT',
                    (newWif)=>broadcast.avalon.newAccount(username,pub,cb,newWif),
                    ()=>cb('missing required permission NEW_ACCOUNT'))
            let creator = activeuser.username
            if (!creator) return;
            let wif = activeuser.privatekey
            if (newWif) wif = newWif
            if (wif) {
                let tx = {
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
        newKey: function(id, pub, types, cb, newWif) {
            if (!Session.get('activeUsername') || Session.get('isDTCDisabled')) return
                // avalon only
            let activeuser = Users.findOne({username: Session.get('activeUsername'), network: 'avalon'})
            if (!newWif && activeuser.allowedTxTypes && activeuser.allowedTxTypes.indexOf(10) == -1)
                return missingPermission.handler('NEW_KEY',
                    (newWif)=>broadcast.avalon.newKey(id,pub,types,cb,newWif),
                    ()=>cb('missing required permission NEW_KEY'))
            let voter = activeuser.username
            if (!voter) return;
            let wif = activeuser.privatekey
            if (newWif) wif = newWif
            if (wif) {
                let tx = {
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
        removeKey: function(id, cb, newWif) {
            if (!Session.get('activeUsername') || Session.get('isDTCDisabled')) return
                // avalon only
            let activeuser = Users.findOne({username: Session.get('activeUsername'), network: 'avalon'})
            if (!newWif && activeuser.allowedTxTypes && activeuser.allowedTxTypes.indexOf(11) == -1)
                return missingPermission.handler('REMOVE_KEY',
                    (newWif)=>broadcast.avalon.removeKey(id,cb,newWif),
                    ()=>cb('missing required permission REMOVE_KEY'))
            let voter = activeuser.username
            if (!voter) return;
            let wif = activeuser.privatekey
            if (newWif) wif = newWif
            if (wif) {
                let tx = {
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
        changePassword: (pub, cb, newWif) => {
            if (!Session.get('activeUsername') || Session.get('isDTCDisabled')) return
                // avalon only
            let activeuser = Users.findOne({username: Session.get('activeUsername'), network: 'avalon'})
            if (!newWif && activeuser.allowedTxTypes && activeuser.allowedTxTypes.indexOf(12) == -1)
                return missingPermission.handler('CHANGE_PASSWORD',
                    (newWif)=>broadcast.avalon.changePassword(pub,cb,newWif),
                    ()=>cb('missing required permission CHANGE_PASSWORD'))
            let voter = activeuser.username
            let wif = activeuser.privatekey
            if (newWif) wif = newWif
            if (voter && wif) {
                let tx = {
                    type: 12,
                    data: {
                        pub: pub
                    }
                }
                tx = avalon.sign(wif, voter, tx)
                avalon.sendTransaction(tx, (err, res) => cb(err, res))
                return
            }
        },
        voteLeader: function(target, cb, newWif) {
            if (!Session.get('activeUsername') || Session.get('isDTCDisabled')) return
                // avalon only
            let activeuser = Users.findOne({username: Session.get('activeUsername'), network: 'avalon'})
            if (!newWif && activeuser.allowedTxTypes && activeuser.allowedTxTypes.indexOf(1) == -1)
                return missingPermission.handler('APPROVE_NODE_OWNER',
                    (newWif)=>broadcast.avalon.voteLeader(target,cb,newWif),
                    ()=>cb('missing required permission APPROVE_NODE_OWNER'))
            let voter = activeuser.username
            if (!voter) return;
            let wif = activeuser.privatekey
            if (newWif) wif = newWif
            if (wif) {
                let tx = {
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
        unvoteLeader: function(target, cb, newWif) {
            if (!Session.get('activeUsername') || Session.get('isDTCDisabled')) return
                // avalon only
            let activeuser = Users.findOne({username: Session.get('activeUsername'), network: 'avalon'})
            if (!newWif && activeuser.allowedTxTypes && activeuser.allowedTxTypes.indexOf(2) == -1)
                return missingPermission.handler('DISAPPROVE_NODE_OWNER',
                    (newWif)=>broadcast.avalon.unvoteLeader(target,cb,newWif),
                    ()=>cb('missing required permission DISAPPROVE_NODE_OWNER'))
            let voter = activeuser.username
            if (!voter) return;
            let wif = activeuser.privatekey
            if (newWif) wif = newWif
            if (wif) {
                let tx = {
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
        },
        claimReward: function(author, link, cb, newWif) {
            if (!Session.get('activeUsername') || Session.get('isDTCDisabled')) return
            let activeuser = Users.findOne({username: Session.get('activeUsername'), network: 'avalon'})
            if (!newWif && activeuser.allowedTxTypes && activeuser.allowedTxTypes.indexOf(17) == -1)
            return missingPermission.handler('CLAIM_REWARD',
                    (newWif)=>broadcast.avalon.claimReward(author,link,cb,newWif),
                    ()=>cb('missing required permission CLAIM_REWARD'))
            let voter = activeuser.username
            if (!voter) return;
            let wif = activeuser.privatekey
            if (newWif) wif = newWif
            if (wif) {
                let tx = {
                    type: 17,
                    data: {
                        author: author,
                        link: link
                    }
                }
                tx = avalon.sign(wif, voter, tx)
                avalon.sendTransaction(tx, function(err, res) {
                    cb(err, res)
                })
                return;
            }
        },
        decrypt_memo: (memo,cb) => {
            let username = Users.findOne({ username: Session.get('activeUsername'), network: 'avalon' }).username
            let wif = Users.findOne({ username: Session.get('activeUsername'), network: 'avalon' }).privatekey
            if (!username || !wif) return
            avalon.decrypt(wif,memo,(e,decrypted) => {
                if (e)
                    cb(e.error)
                else
                    cb(null,decrypted)
            })
        }
    },
    hive: {
        comment: function(permlink, parentAuthor, parentPermlink, body, jsonMetadata, tags, cb) {
            if (!permlink) permlink = Template.publish.randomPermlink(11)
            if (!parentAuthor) parentAuthor = ''
            if (!parentPermlink) parentPermlink = 'hive-196037'
            if (!Session.get('activeUsernameHive') || Session.get('isHiveDisabled')) return
            let voter = Users.findOne({ username: Session.get('activeUsernameHive'), network: 'hive' }).username
            if (!voter) return;
            let author = Session.get('activeUsernameHive')
            let title = jsonMetadata.title
            finalTags = ['dtube']

            for (let i = 0; i < tags.length; i++)
                if (finalTags.indexOf(tags[i]) == -1)
                    finalTags.push(tags[i])

            if (!body)
                body = genSteemBody(author, permlink, jsonMetadata)

            var jsonMetadata = {
                video: jsonMetadata,
                tags: finalTags,
                app: Meteor.settings.public.app
            }

            let percent_hbd = 10000
            if ($('input[name=powerup]')[0] && $('input[name=powerup]')[0].checked)
                percent_hbd = 0

            let operations = [
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
                    max_accepted_payout: '1000000.000 HBD',
                    percent_hbd: percent_hbd,
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
            ]

            operations[0][1].parent_author = parentAuthor
            operations[0][1].parent_permlink = parentPermlink
            broadcast.hive.send(operations, function(err, res) {
                if (!err && res && res.operations)
                    res = res.operations[0][1].author + '/' + res.operations[0][1].permlink
                if (!err && res && res.data && res.data.operations)
                    res = res.data.operations[0][1].author + '/' + res.data.operations[0][1].permlink
                cb(err, res)
            })
        },
        vote: function(author, permlink, weight, cb) {
            if (!Session.get('activeUsernameHive') || Session.get('isHiveDisabled')) return
            let voter = Users.findOne({ username: Session.get('activeUsernameHive'), network: 'hive' })
            if (!voter.username) return;

            if (voter.type == "keychain") {
                if (!hive_keychain) {
                    return cb('LOGIN_ERROR_KEYCHAIN_NOT_INSTALLED')
                }
                hive_keychain.requestVote(Session.get('activeUsernameHive'), permlink, author, weight, function(response) {
                    console.log(response);
                    cb(response.error, response)
                })
                return
            }

            let wif = voter.privatekey
            if (wif) {
                hive.broadcast.vote(wif, voter, author, permlink, weight, function(err, result) {
                    cb(err, result)
                })
                return
            }
        },
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
            if (voter.type == "keychain") {
                if (!hive_keychain) {
                    return cb('LOGIN_ERROR_HIVE_KEYCHAIN_NOT_INSTALLED')
                }
                hive_keychain.requestCustomJson(voter.username, "community", "Posting", operations, "community", (response) => {
                    cb(response.error, response)
                })
                return
            }
            let wif = voter.privatekey
            if (wif) hive.broadcast.customJson(
                wif, [], [voter.username],
                'community',
                operations,
                (err, result) => cb(err, result)
            )
        },
        send: (operations, cb) => {
            if (!Session.get('activeUsernameHive') || Session.get('isHiveDisabled')) return
            let voter = Users.findOne({ username: Session.get('activeUsernameHive'), network: 'hive' }).username
            if (!voter) return;

            if (Users.findOne({ username: Session.get('activeUsernameHive'), network: 'hive' }).type == "keychain") {
                if (!hive_keychain) return cb('LOGIN_ERROR_HIVE_KEYCHAIN_NOT_INSTALLED')

                hive_keychain.requestBroadcast(voter, operations, "Posting", (response) => {
                    console.log(response);
                    cb(response.error, response)
                })
                return
            }

            let wif = Users.findOne({ username: Session.get('activeUsernameHive'), network: 'hive' }).privatekey
            if (wif) {
                hive.broadcast.send({ operations: operations, extensions: [] }, { posting: wif },
                    function(err, result) {
                        cb(err, result)
                    }
                )
                return
            }
        },
        decrypt_memo: (memo, cb) => {
            if (!Session.get('activeUsernameHive')) return
            if (Users.findOne({ username: Session.get('activeUsernameHive'), network: 'hive' }).type == 'keychain') {
                if (!hive_keychain) return cb(translate('LOGIN_ERROR_HIVE_KEYCHAIN_NOT_INSTALLED'))
                hive_keychain.requestVerifyKey(Session.get('activeUsernameHive'), memo, 'Posting', (response) => {
                    cb(response.error, response.result.substr(1))
                })
                return
            }
            let wif = Users.findOne({ username: Session.get('activeUsernameHive'), network: 'hive' }).privatekey
            let decoded = hive.memo.decode(wif, memo).substr(1)
            cb(null, decoded)
        }
    }
}

missingPermission = {
    handler: (permission,retry,cancel) => {
        Session.set('requiredPermission',permission)
        missingPermission.retry = (newWif) => {
            if (!newWif)
                return toastr.error(translate('MISSING_PERMISSIONS_PROCEED_NOKEY'),translate('ERROR_TITLE'))
            retry(newWif)
            $('#retryKey').val('')
            $('.nopermission').hide()
        }
        missingPermission.cancel = () => {
            cancel()
            $('#retryKey').val('')
            $('.nopermission').hide()
        }
        return $('.nopermission').show()
    }
}

var genSteemBody = function(author, permlink, video) {
    var body = '<center>'
    body += '<a href=\'https://d.tube/#!/v/' + author + '/' + permlink + '\'>'
    if (Videos.getOverlayUrl({ json: video }))
        body += '<img src=\'' + Videos.getOverlayUrl({ json: video }) + '\' ></a></center><hr>\n\n'
    else
        body += '<img src=\'' + Videos.getThumbnailUrl({ json: video }) + '\' ></a></center><hr>\n\n'

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
