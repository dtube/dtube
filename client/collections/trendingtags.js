const moment = require('moment')
const excludedTags = [
  'dtube',
  '',
  'video',
  // we can add more if needed
]

TrendingTags = new Mongo.Collection(null)

TrendingTags.loadTopTags = function(limit, cb) {
  // caca
  // steem.api.getTrendingTags('dtube', limit, function(err, results) {
  //   if (err) console.log(err)
  //   for (var i = 0; i < results.length; i++)
  //     if (excludedTags.indexOf(results[i].name) == -1)
  //       TrendingTags.upsert(results[i], results[i])
  // });
  dateTo = moment().format('YYYY-MM-DD');
  dateFrom = moment().subtract(30,'d').format('YYYY-MM-DD');
  timeQ = 'created:['+dateFrom+' TO 2099-01-01]'
  AskSteem.trending({q: 'meta.video.info.title:* AND '+timeQ, types: 'tags', size: limit}, function(err, res) {
    if (err) console.log(err)
    var results = res.results
    for (var i = 0; i < results.length; i++)
      if (excludedTags.indexOf(results[i].term) == -1)
        TrendingTags.upsert(results[i], results[i])
  })
}