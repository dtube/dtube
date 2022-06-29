Template.election.rendered = () => {
    setTimeout(() => {
        Template.settingsdropdown.nightMode()
    },200)
    $('.ui.checkbox').checkbox({
        onChecked: () => $('.hidedisabledleaders').prop('checked') ? Session.set('hideDisabledLeaders',true) : null,
        onUnchecked: () => !$('.hidedisabledleaders').prop('checked') ? Session.set('hideDisabledLeaders',false): null
    })
    avalon.getBlockchainHeight((e,height) => {
        if (!e)
            Session.set('avalonLastBlock',height.count)
    })
}

Template.election.helpers({
    leaders: function(){
        var leaders = Session.get('leaders')
        if (leaders)
            for (let i = 0; i < leaders.length; i++)
                leaders[i].position = i+1
        return leaders
    },
    isVotingFor: function(name){
        var user = Users.findOne({username: Session.get('activeUsername'), network: 'avalon'})
        if (user && user.approves && user.approves.indexOf(name) > -1)
            return true

        return false
    },
    myOtherVotes: function(){
        var leaders = Session.get('leaders')
        var user = Users.findOne({username: Session.get('activeUsername'), network: 'avalon'})
        var approves = []
        if (user && user.approves) approves = user.approves
        if (leaders)
            for (let i = 0; i < leaders.length; i++)
                if (approves.indexOf(leaders[i].name) > -1)
                    approves.splice(approves.indexOf(leaders[i].name), 1)
        
        return approves
    },
    isInSchedule: (leaderIndex) => {
        let leaders = Session.get('leaders')
        let maxIndex = -1
        let maxLeaders = 15
        while (maxLeaders > 0 && maxIndex < leaders.length - 1) {
            maxIndex++
            if (leaders[maxIndex].pub_leader)
                maxLeaders--
        }
        return leaderIndex <= maxIndex && leaders[leaderIndex].pub_leader
    },
    isActive: (leaderIndex) => {
        let leaders = Session.get('leaders')
        return leaders[leaderIndex].pub_leader && leaders[leaderIndex].leaderStat && leaders[leaderIndex].leaderStat.last > Session.get('avalonLastBlock') - 28800
    },
    isDisabledShown: () => {
        return !Session.get('hideDisabledLeaders')
    }
})

Template.election.events({
    'click #votenew': function() {
        var username = $('#newleader').val()
        $('#newleader').val('')
        broadcast.avalon.voteLeader(username, function (err, result) {
            if (err) Meteor.blockchainError(err)
            else {
                avalon.getLeaders(function(err, res){
                    Session.set('leaders', res)
                })
                Users.refreshUsers([Session.get('activeUsername')])
                toastr.success(translate('GLOBAL_VOTE_LEADER', username))
            }
        })
    },
    'click .votetop': function(clickEvent) {
        var button = clickEvent.target
        var username = button.parentElement.getAttribute('data-username')
        broadcast.avalon.voteLeader(username, function (err, result) {
            if (err) Meteor.blockchainError(err)
            else {
                avalon.getLeaders(function(err, res){
                    Session.set('leaders', res)
                })
                Users.refreshUsers([Session.get('activeUsername')])
                toastr.success(translate('GLOBAL_VOTE_LEADER', username))
            }
        })
    },
    'click .unvotetop': function(clickEvent) {
        var button = clickEvent.target
        var username = button.parentElement.getAttribute('data-username')
        broadcast.avalon.unvoteLeader(username, function (err, result) {
            if (err) Meteor.blockchainError(err)
            else {
                avalon.getLeaders(function(err, res){
                    Session.set('leaders', res)
                })
                Users.refreshUsers([Session.get('activeUsername')])
                toastr.success(translate('GLOBAL_UNVOTE_LEADER', username))
            }
        })
    }
})