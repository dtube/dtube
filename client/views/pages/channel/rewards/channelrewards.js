Template.channelrewards.rendered = function() {
    avalon.getRewards(Session.get('activeUsername'), function(err, res) {
        Session.set('myRewards', res)
    })
}

Template.channelrewards.helpers({
    'rewards': function(){
        var rewards = []
        var rawRewards = Session.get('myRewards')
        if (rawRewards)
            for (let i = 0; i < rawRewards.length; i++) {
                rewards.push({
                    source: rawRewards[i]._id.split('/').slice(0,2).join('/'),
                    ts: rawRewards[i].ts,
                    dist: rawRewards[i].dist
                })
            }
        return rewards
    }
})