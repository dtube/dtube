Activities = new Mongo.Collection(null)

Activities.getAccountHistory = function (username, cb) {
    if (Activities.find({ username: username }).fetch().length) {
        var lastActivity = Activities.findOne({ username: FlowRouter.getParam("author") }, { sort: { n: 1 } }).n
        avalon.getAccountHistory(username, lastActivity, function (e, r) {
            for (let i = 0; i < r.length; i++) {
                if (!r[i].txs || r[i].txs.length < 1) return
                for (let y = 0; y < r[i].txs.length; y++)
                    Activities.filterOperations(username, r[i].txs[y], r[i]._id)
            }
            cb()
        })
    }
    else {
        avalon.getAccountHistory(username, 0, function (e, r) {
            if (!r) return
            for (let i = 0; i < r.length; i++) {
                if (!r[i].txs || r[i].txs.length < 1) return
                for (let y = 0; y < r[i].txs.length; y++)
                    Activities.filterOperations(username, r[i].txs[y], r[i]._id)
            }
            cb()
        })
    }
}

Activities.filterOperations = function (username, tx, blockId) {
    switch (tx.type) {
        case 0:
            Activities.upsert({ _id: tx.signature }, { _id: tx.signature, username: username, type: 'newAccount', tx: tx, date: tx.ts, n: blockId })
            break;
        case 1:
            Activities.upsert({ _id: tx.signature }, { _id: tx.signature, username: username, type: 'approveNodeOwner', tx: tx, date: tx.ts, n: blockId })
            break;
        case 2:
            Activities.upsert({ _id: tx.signature }, { _id: tx.signature, username: username, type: 'disapproveNodeOwner', tx: tx, date: tx.ts, n: blockId })
            break;
        case 3:
            Activities.upsert({ _id: tx.signature }, { _id: tx.signature, username: username, type: 'transfer', tx: tx, date: tx.ts, n: blockId })
            break;
        case 4:
            if (tx.data.pa && tx.data.pp)
                Activities.upsert({ _id: tx.signature }, { _id: tx.signature, username: username, type: 'comment', tx: tx, date: tx.ts, n: blockId })
            else
                Activities.upsert({ _id: tx.signature }, { _id: tx.signature, username: username, type: 'publish', tx: tx, date: tx.ts, n: blockId })
            break;
        case 5:
            if (tx.data.vt > 0) {
                Activities.upsert({ _id: tx.signature }, { _id: tx.signature, username: username, type: 'vote', tx: tx, date: tx.ts, n: blockId })
            }
            else {
                Activities.upsert({ _id: tx.signature }, { _id: tx.signature, username: username, type: 'downvote', tx: tx, date: tx.ts, n: blockId })
            }
            break;

        case 3:
            Activities.upsert({ _id: tx.signature }, { _id: tx.signature, username: username, type: 'editProfile', tx: tx, date: tx.ts, n: blockId })
            break;
        
        case 7:
            Activities.upsert({ _id: tx.signature }, { _id: tx.signature, username: username, type: 'follow', tx: tx, date: tx.ts, n: blockId })
            break;
        case 8:
            Activities.upsert({ _id: tx.signature }, { _id: tx.signature, username: username, type: 'unfollow', tx: tx, date: tx.ts, n: blockId })
            break;
    }
}