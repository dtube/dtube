const time_to_claim = 1000 * 60 * 60 * 24 * 7
const max_items_per_call = 50

Template.channelrewards.rendered = function () {
    setTimeout(() => Template.settingsdropdown.nightMode(), 200)
    Session.set('finishedLoadingRewards', false)
    Session.set('currentRewardsDisplay', 'pending')
    avalon.getPendingVotesByAccount(Session.get('activeUsername'), 0, function (err, res) {
        if (res.length < max_items_per_call)
            Session.set('finishedLoadingRewards', true)
        for (let i = 0; i < res.length; i++) {
            if (!res[i].claimed)
                res[i].timeToClaim = res[i].ts + time_to_claim
            res[i].claimable = Math.floor(res[i].claimable)
        }
        Session.set('myRewards', res)
    })
    avalon.getPendingRewards(Session.get('activeUsername'), function (err, res) {
        if (err) console.log(err)
        else if (res && typeof res.total == 'number') {
            Session.set('myPendingRewards', res.total)
        }
    })
    avalon.getClaimedRewards(Session.get('activeUsername'), function (err, res) {
        if (err) console.log(err)
        else if (res && typeof res.total == 'number') {
            Session.set('myClaimedRewards', res.total)
        }
    })
    avalon.getClaimableRewards(Session.get('activeUsername'), function (err, res) {
        if (err) console.log(err)
        else if (res && typeof res.total == 'number') {
            Session.set('myClaimableRewards', res.total)
        }
    })
}

Template.channelrewards.helpers({
    'rewards': function () {
        return Session.get('myRewards')
    },
    myPendingRewards: function () {
        if (!Session.get('myPendingRewards'))
            return 0
        return Session.get('myPendingRewards')
    },
    myClaimedRewards: function () {
        if (!Session.get('myClaimedRewards'))
            return 0
        return Session.get('myClaimedRewards')
    },
    myClaimableRewards: function () {
        if (!Session.get('myClaimableRewards'))
            return 0
        return Session.get('myClaimableRewards')
    },
    myTotalRewards: function () {
        var total = 0
        if (Session.get('myPendingRewards'))
            total += Session.get('myPendingRewards')
        if (Session.get('myClaimedRewards'))
            total += Session.get('myClaimedRewards')
        if (Session.get('myClaimableRewards'))
            total += Session.get('myClaimableRewards')
        return total
    },
    isClaimable: function (vote) {
        if (new Date().getTime() - vote.ts > time_to_claim)
            return true
        return false
    },
    isClaimed: function (vote) {
        if (vote.claimed && vote.claimed > 0)
            return true
        return false
    },
    finishedLoading: function () {
        return Session.get('finishedLoadingRewards')
    },
    currentRewardsDisplay: function () {
        return Session.get('currentRewardsDisplay')
    }
})

Template.channelrewards.events({
    'click .claim': function (event) {
        var claim = this
        var button = event.target
        if (button.className.indexOf('claim button') == -1)
            button = event.target.parentElement

        button.classList.add('disabled')
        broadcast.avalon.claimReward(claim.author, claim.link, function (err, res) {
            if (err) {
                button.classList.remove('disabled')
                Meteor.blockchainError(err)
                return
            }
            toastr.success(translate('CHANNEL_REWARDS_CLAIMED_POPUP', claim.claimable / 100), translate('USERS_SUCCESS'))
            var myRewards = Session.get('myRewards')
            for (let i = 0; i < myRewards.length; i++) {
                if (myRewards[i].author == claim.author && myRewards[i].link == claim.link) {
                    myRewards[i].claimed = new Date().getTime()
                }
            }
            Session.set('myRewards', myRewards)
        })
    },
    'click #loadMoreRewardsBtn': function () {
        $('#loadMoreRewardsBtn').prop('disabled', true);
        var currentType = Session.get('currentRewardsDisplay')
        var currentRewards = Session.get('myRewards')
        var lastRewardTime = currentRewards[currentRewards.length - 1].contentTs
        if (currentType === 'pending') {
            avalon.getPendingVotesByAccount(Session.get('activeUsername'), lastRewardTime, function (err, res) {
                $('#loadMoreRewardsBtn').prop('disabled', false);
                if (err) return
                if (res.length < max_items_per_call)
                    Session.set('finishedLoadingRewards', true)
                for (let i = 0; i < res.length; i++) {
                    if (!res[i].claimed)
                        res[i].timeToClaim = res[i].ts + time_to_claim
                    res[i].claimable = Math.floor(res[i].claimable)
                    currentRewards.push(res[i])
                }
                Session.set('myRewards', currentRewards)
            })
        }
        else if (currentType === 'claimable') {
            avalon.getClaimableVotesByAccount(Session.get('activeUsername'), lastRewardTime, function (err, res) {
                $('#loadMoreRewardsBtn').prop('disabled', false);
                if (err) return
                if (res.length < max_items_per_call)
                    Session.set('finishedLoadingRewards', true)
                for (let i = 0; i < res.length; i++) {
                    if (!res[i].claimed)
                        res[i].timeToClaim = res[i].ts + time_to_claim
                    res[i].claimable = Math.floor(res[i].claimable)
                    currentRewards.push(res[i])
                }
                Session.set('myRewards', currentRewards)
            })
        }
        else if (currentType === 'claimed') {
            avalon.getClaimedVotesByAccount(Session.get('activeUsername'), lastRewardTime, function (err, res) {
                $('#loadMoreRewardsBtn').prop('disabled', false);
                if (err) return
                if (res.length < max_items_per_call)
                    Session.set('finishedLoadingRewards', true)
                for (let i = 0; i < res.length; i++) {
                    if (!res[i].claimed)
                        res[i].timeToClaim = res[i].ts + time_to_claim
                    res[i].claimable = Math.floor(res[i].claimable)
                    currentRewards.push(res[i])
                }
                Session.set('myRewards', currentRewards)
            })
        }
        else if (currentType === 'total') {
            avalon.getVotesByAccount(Session.get('activeUsername'), lastRewardTime, function (err, res) {
                $('#loadMoreRewardsBtn').prop('disabled', false);
                if (err) return
                if (res.length < max_items_per_call)
                    Session.set('finishedLoadingRewards', true)
                for (let i = 0; i < res.length; i++) {
                    if (!res[i].claimed)
                        res[i].timeToClaim = res[i].ts + time_to_claim
                    res[i].claimable = Math.floor(res[i].claimable)
                    currentRewards.push(res[i])
                }
                Session.set('myRewards', currentRewards)
            })
        }
    },
    'click .reward.btn': function (event) {
        var type = event.target.name
        var currentRewards = []
        Session.set('currentRewardsDisplay', type)
        Session.set('finishedLoadingRewards', false)
        Session.set('myRewards', null)

        if (type === 'pending') {
            avalon.getPendingVotesByAccount(Session.get('activeUsername'), 0, function (err, res) {
                $('#loadMoreRewardsBtn').prop('disabled', false);
                if (err) return
                if (res.length < max_items_per_call)
                    Session.set('finishedLoadingRewards', true)
                for (let i = 0; i < res.length; i++) {
                    if (!res[i].claimed)
                        res[i].timeToClaim = res[i].ts + time_to_claim
                    res[i].claimable = Math.floor(res[i].claimable)
                    currentRewards.push(res[i])
                }
                Session.set('myRewards', currentRewards)
            })
        }
        else if (type === 'claimable') {
            avalon.getClaimableVotesByAccount(Session.get('activeUsername'), 0, function (err, res) {
                $('#loadMoreRewardsBtn').prop('disabled', false);
                if (err) return
                if (res.length < max_items_per_call)
                    Session.set('finishedLoadingRewards', true)
                for (let i = 0; i < res.length; i++) {
                    if (!res[i].claimed)
                        res[i].timeToClaim = res[i].ts + time_to_claim
                    res[i].claimable = Math.floor(res[i].claimable)
                    currentRewards.push(res[i])
                }
                Session.set('myRewards', currentRewards)
            })
        }
        else if (type === 'claimed') {
            avalon.getClaimedVotesByAccount(Session.get('activeUsername'), 0, function (err, res) {
                $('#loadMoreRewardsBtn').prop('disabled', false);
                if (err) return
                if (res.length < max_items_per_call)
                    Session.set('finishedLoadingRewards', true)
                for (let i = 0; i < res.length; i++) {
                    if (!res[i].claimed)
                        res[i].timeToClaim = res[i].ts + time_to_claim
                    res[i].claimable = Math.floor(res[i].claimable)
                    currentRewards.push(res[i])
                }
                Session.set('myRewards', currentRewards)
            })
        }
        else if (type === 'total') {
            avalon.getVotesByAccount(Session.get('activeUsername'), 0, function (err, res) {
                $('#loadMoreRewardsBtn').prop('disabled', false);
                if (err) return
                if (res.length < max_items_per_call)
                    Session.set('finishedLoadingRewards', true)
                for (let i = 0; i < res.length; i++) {
                    if (!res[i].claimed)
                        res[i].timeToClaim = res[i].ts + time_to_claim
                    res[i].claimable = Math.floor(res[i].claimable)
                    currentRewards.push(res[i])
                }
                Session.set('myRewards', currentRewards)
            })
        }
    }
})