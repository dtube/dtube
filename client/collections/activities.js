Activities = new Mongo.Collection(null)

Activities.getAccountHistory = function (username) {
    steem.api.getAccountHistory(username, -1, 100, function (e, r) {
        if (!r || r.length < 1) return
        for (let i = 0; i < r.length; i++) {
            console.log(r[i])
            var op = r[i][1].op
            var date = r[i][1].timestamp
            Activities.filterOperations(op,date)
        }
    })
}

Activities.filterOperations = function (op, date) {
    switch (op[0]) {
        case "curation_reward":
            Activities.insert({ type: 'curation_reward', tx: op[1], date : date })
            break;
        case "vote":
            Activities.insert({ type: 'vote', tx: op[1], date : date })
            break;
        case "claim_reward_balance":
            Activities.insert({ type: 'claim_reward_balance', tx: op[1], date : date })
            break;
        case "comment":
            Activities.insert({ type: 'comment', tx: op[1], date : date })
            break;
        case "account_witness_vote":
            Activities.insert({ type: 'account_witness_vote', tx: op[1], date : date })
            break;
        case "transfer_to_vesting":
            Activities.insert({ type: 'transfer_to_vesting', tx: op[1], date : date })
            break;
        case "account_update":
            Activities.insert({ type: 'account_update', tx: op[1], date : date })
            break;
        case "custom_json":
            Activities.insert({ type: 'custom_json', tx: op[1], date : date })
            break;
    }
}