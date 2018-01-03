const moment = require('moment')
const excludedTags = [
  'dtube',
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
  AskSteem.trending({q: 'zzz AND '+timeQ, types: 'tags', size: limit}, function(err, res) {
    if (err) console.log(err)
    console.log(res)
      // for (var i = 0; i < results.length; i++)
      //   if (excludedTags.indexOf(results[i].name) == -1)
      //     TrendingTags.upsert(results[i], results[i])
  })
}