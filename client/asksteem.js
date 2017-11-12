AskSteem = {
    getSearchSuggestions: function(query, cb) {
        $.get("https://api.asksteem.com/suggestions?term="+query, function(rawSuggestions) {
            cb(null, rawSuggestions)
        });
    }
}