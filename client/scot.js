// this file interact with the SCOT API (also called Tribes) from Steem-Engine.com

Scot = {
    config: {
        api: [
            'https://scot-api.steem-engine.com',
            // 'http://localhost:8080'
        ]
    },
    getDiscussionsBy: function(type, limit, lastAuthor, lastLink, cb) {
        var query = '?token='+Session.get('scot').token
        query += '&limit='+limit
        query += '&tag=dtube'
        if (lastAuthor && lastLink) {
            query += '&start_author='+lastAuthor
            query += '&start_permlink='+lastLink
        }
        fetch(Scot.randomNode()+'/get_discussions_by_'+type+query, {
            method: 'get',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            }
        }).then(res => res.json()).then(function(res) {
            cb(null, res)
        })
    },
    getDiscussionsByBlog: function(author, lastAuthor, lastLink, cb) {
        var query = '?token='+Session.get('scot').token
        query += '&limit=50'
        query += '&tag='+author
        if (lastAuthor && lastLink) {
            query += '&start_author='+lastAuthor
            query += '&start_permlink='+lastLink
        }
        console.log(query)
        fetch(Scot.randomNode()+'/get_discussions_by_blog'+query, {
            method: 'get',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            }
        }).then(res => res.json()).then(function(res) {
            cb(null, res)
        })
    },
    getFeed: function() {
        // https://scot-api.steem-engine.com/get_feed?token=SCT&account=holger80&limit=10&start_entry_id=1
    },
    getRewards: function(author, link, cb) {
        fetch(Scot.randomNode()+'/@'+author+'/'+link, {
            method: 'get',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            }
        }).then(res => res.json()).then(function(res) {
            console.log(res)
            var distScot = []
            for (const key in res) {
                var dist = 0
                if (res[key].pending_token)
                    dist += res[key].pending_token
                if (res[key].total_payout_value)
                    dist += res[key].total_payout_value
                distScot.push({token: key, value: dist})
            }
            cb(null, distScot)
        })
    },
    formatCurrency: function(dist, scotConfig) {
        if (!dist || !scotConfig) return ''
        for (let i = 0; i < dist.length; i++)
          if (dist[i].token == scotConfig.token) {
            var number = dist[i].value
            if (scotConfig.precision > 0)
              number /= Math.pow(10, scotConfig.precision)
            if (scotConfig.displayedPrecision > 0)
              number = number.toFixed(scotConfig.displayedPrecision)
            return number+' '+scotConfig.token
          }
          
        return '0 '+scotConfig.token
    },
    randomNode: () => {
        var nodes = Scot.config.api
        if (typeof nodes === 'string') return nodes
        else return nodes[Math.floor(Math.random()*nodes.length)]
    }
}