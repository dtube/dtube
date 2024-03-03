const time_to_claim = 1000 * 60 * 60 * 24 * 7
const max_items_per_call = 50
Template.votes.rendered = () => setTimeout(() => Template.settingsdropdown.nightMode(),1500)
Template.votes.helpers({
    allNetworks: function() {
        var a = Session.get('allNet')
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a
    },
    video: function() {
        var videos = Videos.find({
            'author': FlowRouter.getParam("author"),
            'link': FlowRouter.getParam("permlink")
        }).fetch()
        for (var i = 0; i < videos.length; i++) {
            if (videos[i].source == 'chainDirect') {
                var title = ''
                if (videos[i].title) title = videos[i].title
                if (videos[i].json) title = videos[i].json.title
                Session.set("pageTitle", title)
                return videos[i]
            }
        }

        for (var i = 0; i < videos.length; i++) {
            if (videos[i].source == 'chainByBlog') return videos[i]
            if (videos[i].source == 'chainByHot') return videos[i]
            if (videos[i].source == 'chainByCreated') return videos[i]
            if (videos[i].source == 'chainByTrending') return videos[i]
        }

        if (videos && videos[0]) return videos[0]
        return;
    },

    isClaimable: function(vote) {
        if (new Date().getTime() - vote.ts > time_to_claim)
            return true
        return false
    },
    isClaimed: function(vote) {
        if (vote.claimed && vote.claimed > 0)
            return true
        return false
    }
})

Template.votes.helpers({
    votePercentage: function(number) {
        return parseInt(number) / 100
    },
})

Template.votes.events({
    'click .item.votenetwork': function(event) {
        $('.votenetwork.tab').removeClass('active');
        $('.votenetwork.item').removeClass('active');
        $('.votenetwork.item.' + event.target.dataset.tab).addClass('active');
        $('.votenetwork.tab.' + event.target.dataset.tab).addClass('active');
    },
})