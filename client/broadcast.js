broadcast = {
    newAccount: function(username, pub, cb) {
        var creator = Users.findOne({ username: Session.get('activeUsername') }).username
        if (!creator) return;
        var wif = Users.findOne({ username: Session.get('activeUsername') }).privatekey
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
    vote: function(author, permlink, weight, tag, cb) {
        var voter = Users.findOne({ username: Session.get('activeUsername') }).username
        if (!voter) return;
        var wif = Users.findOne({ username: Session.get('activeUsername') }).privatekey
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
            // steem.broadcast.vote(wif, voter, author, permlink, weight, function (err, result) {
            //     cb(err, result)
            // })
            return;
        }
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
        var voter = Users.findOne({ username: Session.get('activeUsername') }).username
        if (!voter) return;
        var wif = Users.findOne({ username: Session.get('activeUsername') }).privatekey
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
    comment: function(parentAuthor, parentPermlink, jsonMetadata, cb) {
        var voter = Users.findOne({ username: Session.get('activeUsername') }).username
        if (!voter) return;
        var permlink = jsonMetadata.videoId || Template.upload.createPermlink(9)
        var wif = Users.findOne({ username: Session.get('activeUsername') }).privatekey
        var tx = {
            type: 4,
            data: {
                link: permlink,
                json: jsonMetadata
            }
        }
        if (parentAuthor && parentPermlink) {
            tx.data.pa = parentAuthor
            tx.data.pp = parentPermlink
        }
        tx = avalon.sign(wif, voter, tx)
        avalon.sendTransaction(tx, function(err, res) {
            cb(err, res)
            Users.refreshUsers([Session.get('activeUsername')])
        })
        return;
    },
    reblog: function(author, permlink, cb) {
        var reblogger = Users.findOne({ username: Session.get('activeUsername') }).username
        if (!reblogger) return;
        var wif = Users.findOne({ username: Session.get('activeUsername') }).privatekey
        if (wif) {
            steem.broadcast.customJson(
                wif,
                [],
                [reblogger],
                'follow',
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