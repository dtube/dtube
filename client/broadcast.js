broadcast = {
    vote: function(author, permlink, weight, cb) {
        var voter = Users.findOne({ username: Session.get('activeUsername') }).username
        if (!voter) return;
        var wif = Users.findOne({ username: Session.get('activeUsername') }).privatekey
        if (wif) {
            steem.broadcast.vote(wif, voter, author, permlink, weight, function (err, result) {
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
        sc2.vote(voter, author, permlink, weight, function(err, result) {
            cb(err, result)
        })
    }
}