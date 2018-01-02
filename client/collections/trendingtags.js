TrendingTags = new Mongo.Collection(null)

TrendingTags.loadTags = function(tag,limite, cb) {
  steem.api.getTrendingTags(tag, limite, function(err, results) {
    if (err) console.log(err)
    for (var i = 0; i < results.length; i++)
    TrendingTags.upsert(results[i], results[i])
  });
}