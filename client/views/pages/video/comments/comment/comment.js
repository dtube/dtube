Template.comment.events({

})

Template.comment.helpers({
    currentAuthor: function() {
        return FlowRouter.getParam("author")
    },
    picture: function(id) {
        let username = id.split('/')[1]
        if (id.split('/')[0] == 'steem') {
            return 'https://steemitimages.com/u/' + username + '/avatar/'
        } else if (id.split('/')[0] == 'dtc') {
            return 'https://avalon.oneloved.tube/image/avatar/' + username
        } else if (id.split('/')[0] == 'hive')
            return 'https://images.hive.blog/u/' + username + '/avatar'
    },
    hasVoted: function(one, two) {
        if (one || two) return true;
        return false;
    },
    votable: function(dtube, steem, hive) {
        if (dtube || steem || hive)
            return true
        else return false
    }

})
Template.comment.rendered = function() {
    Template.settingsdropdown.nightMode();
}


function updateComment(author, permlink, rshares) {
    var rootVideo = Videos.findOne({
        author: FlowRouter.getParam("author"),
        permlink: FlowRouter.getParam("permlink"),
        source: 'chainDirect'
    })
    for (let i = 0; i < rootVideo.comments.length; i++) {
        if (rootVideo.comments[i].author == author &&
            rootVideo.comments[i].permlink == permlink) {
            rootVideo.comments[i].active_votes.push({
                rshares: rshares,
                reputation: 25,
                voter: Session.get('activeUsername'),
                percent: rshares
            })
        }
    }
    Videos.upsert({ _id: rootVideo._id }, rootVideo)
}