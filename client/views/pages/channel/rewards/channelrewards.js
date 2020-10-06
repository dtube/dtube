const time_to_claim = 1000*60*60*24*7
const max_items_per_call = 50

Template.channelrewards.rendered = function() {
    setTimeout(() => Template.settingsdropdown.nightMode(),200)
    Session.set('finishedLoadingRewards', false)
    avalon.getVotesByAccount(Session.get('activeUsername'), 0, function(err, res) {
        if (res.length < max_items_per_call)
            Session.set('finishedLoadingRewards', true)
        for (let i = 0; i < res.length; i++) {
            if (!res[i].claimed)
                res[i].timeToClaim = res[i].ts+time_to_claim
            res[i].claimable = Math.floor(res[i].claimable)
        }
        Session.set('myRewards', res)
    })
    avalon.getRewardsPending(Session.get('activeUsername'), function(err, res) {
        if (err) console.log(err)
        else if (res && typeof res.total == 'number') {
            Session.set('myPendingRewards', res.total)
        }
    })
    avalon.getRewardsClaimed(Session.get('activeUsername'), function(err, res) {
        if (err) console.log(err)
        else if (res && typeof res.total == 'number') {
            Session.set('myClaimedRewards', res.total)
        }
    })
}

Template.channelrewards.helpers({
    'rewards': function(){
        return Session.get('myRewards')
    },
    myPendingRewards: function() {
        if (!Session.get('myPendingRewards'))
            return 0
        return Session.get('myPendingRewards')
    },
    myClaimedRewards: function() {
        if (!Session.get('myClaimedRewards'))
            return 0
        return Session.get('myClaimedRewards')
    },
    myTotalRewards: function() {
        if (!Session.get('myPendingRewards') || !Session.get('myClaimedRewards'))
            return 0
        return Session.get('myClaimedRewards') + Session.get('myPendingRewards')
    },
    isClaimable: function(vote){
        if (new Date().getTime() - vote.ts > time_to_claim)
            return true
        return false
    },
    isClaimed: function(vote){
        if (vote.claimed && vote.claimed > 0)
            return true
        return false
    },
    finishedLoading: function(){
        return Session.get('finishedLoadingRewards')
    }
})

Template.channelrewards.events({
    'click .claim': function (event) {
        var claim = this
        var button = event.target
        if (button.className.indexOf('claim button') == -1)
            button = event.target.parentElement
        
        button.classList.add('disabled')
        broadcast.avalon.claimReward(claim.author, claim.link, function(err, res) {
            if (err) {
                button.classList.remove('disabled')
                Meteor.blockchainError(err)
                return
            }
            toastr.success(translate('CHANNEL_REWARDS_CLAIMED_POPUP', claim.claimable/100), translate('USERS_SUCCESS'))            
            var myRewards = Session.get('myRewards')
            for (let i = 0; i < myRewards.length; i++) {
                if (myRewards[i].author == claim.author && myRewards[i].link == claim.link) {
                    myRewards[i].claimed = new Date().getTime()
                }
            }
            Session.set('myRewards',myRewards)
        })
    },
    'click #loadMoreRewardsBtn': function() {
        $('#loadMoreRewardsBtn').prop('disabled', true);
        var currentRewards = Session.get('myRewards')
        var lastRewardTime = currentRewards[currentRewards.length-1].contentTs
        avalon.getVotesByAccount(Session.get('activeUsername'), lastRewardTime, function(err, res) {
            $('#loadMoreRewardsBtn').prop('disabled', false);
            if (err) return
            if (res.length < max_items_per_call)
                Session.set('finishedLoadingRewards', true)
            for (let i = 0; i < res.length; i++) {
                if (!res[i].claimed)
                    res[i].timeToClaim = res[i].ts+time_to_claim
                res[i].claimable = Math.floor(res[i].claimable)
                currentRewards.push(res[i])
            }
            Session.set('myRewards', currentRewards)
        })
    }
})