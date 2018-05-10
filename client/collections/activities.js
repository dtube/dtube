Activities = new Mongo.Collection(null)

Activities.getAccountHistory = function (username, cb) {
    if (Activities.find({ username: username }).fetch().length) {
        var lastActivity = Activities.findOne({ username: FlowRouter.getParam("author") }, { sort: { n: 1 } }).n
        steem.api.getAccountHistory(username, lastActivity, 50, function (e, r) {
            if (!r || r.length < 1) return
            for (let i = 0; i < r.length; i++) {
                Activities.filterOperations(username, r[i])
            }
            cb()
        })
    }
    else {
        steem.api.getAccountHistory(username, -1, 50, function (e, r) {
            if (!r || r.length < 1) return
            for (let i = 0; i < r.length; i++) {
                Activities.filterOperations(username, r[i])
            }
        })
    }
}

Activities.filterOperations = function (username, r) {
    var op = r[1].op
    var date = r[1].timestamp
    switch (op[0]) {
        case "curation_reward":
            Activities.upsert({ _id: r[1].block }, { username: username, type: 'curation_reward', tx: op[1], date: date, n: r[0] })
            break;
        case "vote":
            if (op[1].weight > 1) {
                Activities.upsert({ _id: r[1].trx_id }, { username: username, type: 'vote', tx: op[1], date: date, n: r[0] })
            }
            else {
                Activities.upsert({ _id: r[1].trx_id }, { username: username, type: 'unvote', tx: op[1], date: date, n: r[0] })
            }
            break;
        case "claim_reward_balance":
            Activities.upsert({ _id: r[1].trx_id }, { username: username, type: 'claim_reward_balance', tx: op[1], date: date, n: r[0] })
            break;
        case "comment":
            Activities.upsert({ _id: r[1].trx_id }, { username: username, type: 'comment', tx: op[1], date: date, n: r[0] })
            break;
        case "account_witness_vote":
            Activities.upsert({ _id: r[1].trx_id }, { username: username, type: 'account_witness_vote', tx: op[1], date: date, n: r[0] })
            break;
        case "transfer_to_vesting":
            Activities.upsert({ _id: r[1].trx_id }, { username: username, type: 'transfer_to_vesting', tx: op[1], date: date, n: r[0] })
            break;
        case "account_update":
            Activities.upsert({ _id: r[1].trx_id }, { username: username, type: 'account_update', tx: op[1], date: date, n: r[0] })
            break;
        case "custom_json":
            op[1].json = JSON.parse(op[1].json)
            switch (op[1].json[0]) {
                case "reblog":
                    Activities.upsert({ _id: r[1].block }, { username: username, type: 'reblog', tx: op[1].json, date: date, n: r[0] })
                    break;
                case "follow":
                    if (op[1].json[1].what == "blog") {
                        Activities.upsert({ _id: r[1].block }, { username: username, type: 'follow', tx: op[1].json, date: date, n: r[0] })
                    }
                    else {
                        Activities.upsert({ _id: r[1].block }, { username: username, type: 'unfollow', tx: op[1].json, date: date, n: r[0] })
                    }
                    break;
            }
    }
}