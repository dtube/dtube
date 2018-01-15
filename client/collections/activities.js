Activities = new Mongo.Collection(null)

Activities.getAccountHistory = function (username) {
    steem.api.getAccountHistory(username, -1, 100, function (e, r) {
        if (!r || r.length < 1) return
        for (let i = 0; i < r.length; i++) {
            var op = r[i][1].op
            var date = r[i][1].timestamp
            Activities.filterOperations(username,op,date)
        }
    })
}

Activities.filterOperations = function (username, op, date) {
    switch (op[0]) {
        case "curation_reward":
            Activities.insert({username : username, type: 'curation_reward', tx: op[1], date : date })
            break;
        case "vote":
            Activities.insert({username : username, type: 'vote', tx: op[1], date : date })
            break;
        case "claim_reward_balance":
            Activities.insert({username : username, type: 'claim_reward_balance', tx: op[1], date : date })
            break;
        case "comment":
            Activities.insert({username : username, type: 'comment', tx: op[1], date : date })
            break;
        case "account_witness_vote":
            Activities.insert({username : username, type: 'account_witness_vote', tx: op[1], date : date })
            break;
        case "transfer_to_vesting":
            Activities.insert({username : username, type: 'transfer_to_vesting', tx: op[1], date : date })
            break;
        case "account_update":
            Activities.insert({username : username, type: 'account_update', tx: op[1], date : date })
            break;
        case "custom_json":
            Activities.insert({username : username, type: 'custom_json', tx: op[1], date : date })
            break;
    }
}