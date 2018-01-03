const excludedTags = [
  'dtube',
  // we can add more if needed
]

TrendingTags = new Mongo.Collection(null)

TrendingTags.loadTopTags = function(limit, cb) {
  steem.api.getTrendingTags('dtube', limit, function(err, results) {
    if (err) console.log(err)
    for (var i = 0; i < results.length; i++)
      if (excludedTags.indexOf(results[i].name) == -1)
        TrendingTags.upsert(results[i], results[i])
  });
}