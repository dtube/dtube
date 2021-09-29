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
            return javalon.config.api + '/image/avatar/' + username
        } else if (id.split('/')[0] == 'hive') {
            return 'https://images.hive.blog/u/' + username + '/avatar'
        } else if (id.split('/')[0] == 'blurt')
            return 'https://imgp.blurt.world/profileimage/' + username
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