AskSteem = {
    getSearchSuggestions: function(query, cb) {
        $.get("https://api.asksteem.com/suggestions?term="+query, function(rawSuggestions) {
            cb(null, rawSuggestions)
        });
    },
    search: function(query, cb) {
        Session.set('search', {query: query})
        $.get("https://api.asksteem.com/search?include=meta&q=meta.video.info.title:* AND "+query, function(response) {
          Session.set('search', {query: query, response: response})
        });
        FlowRouter.go('/s/'+query)
    }
}