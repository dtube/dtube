SubCounts = new Mongo.Collection(null)

SubCounts.loadSubscribers = function(username) {
    steem.api.getFollowCount(username, function (e, r) {
        SubCounts.upsert({ _id: r.account }, r)
      })
}
