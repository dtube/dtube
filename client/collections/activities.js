Activities = new Mongo.Collection(null)

Activities.getAccountHistory = function (username) {
    if (Activities.find({ username: username }).fetch().length)
    {
        var lastActivity = Activities.findOne({ username: FlowRouter.getParam("author") }, { sort: { n: 1 } }).n
        steem.api.getAccountHistory(username, lastActivity, 20, function (e, r) {
            if (!r || r.length < 1) return
            for (let i = 0; i < r.length; i++) {
                Activities.filterOperations(username, r[i])
            }
        })
    }
    else
    {
        steem.api.getAccountHistory(username, -1, 20, function (e, r) {
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
            Activities.upsert({_id: r[1].block}, { username : username, type: 'curation_reward', tx: op[1], date : date, n : r[0] })
            break;
        case "vote":
            Activities.upsert({_id: r[1].trx_id}, { username : username, type: 'vote', tx: op[1], date : date, n : r[0] })
            break;
        case "claim_reward_balance":
            Activities.upsert({_id: r[1].trx_id}, { username : username, type: 'claim_reward_balance', tx: op[1], date : date, n : r[0] })
            break;
        case "comment":
            Activities.upsert({_id: r[1].trx_id}, { username : username, type: 'comment', tx: op[1], date : date, n : r[0] })
            break;
        case "account_witness_vote":
            Activities.upsert({_id: r[1].trx_id}, { username : username, type: 'account_witness_vote', tx: op[1], date : date, n : r[0] })
            break;
        case "transfer_to_vesting":
            Activities.upsert({_id: r[1].trx_id}, { username : username, type: 'transfer_to_vesting', tx: op[1], date : date, n : r[0] })
            break;
        case "account_update":
            Activities.upsert({_id: r[1].trx_id}, { username : username, type: 'account_update', tx: op[1], date : date, n : r[0] })
            break;
        case "custom_json":
            op[1].json = JSON.parse(op[1].json)
            Activities.upsert({_id: r[1].trx_id}, { username : username, type: 'custom_json', tx: op[1].json, date : date, n : r[0] })
            break;
    }
}