Template.channel.rendered = function() {
    if (Session.get('currentTab') === 'videos') {

    } else {
        $('.menu .item.videos').removeClass('active');
        $('.ui.bottom.attached.tab.videos').removeClass('active');
    }
    $('.menu .item.' + Session.get('currentTab')).addClass('active');
    $('.ui.bottom.attached.tab.' + Session.get('currentTab')).addClass('active');

    Session.set('relatedChannels', [])

    Template.sidebar.selectMenu();
    Template.settingsdropdown.nightMode();
    // $('.ui.maingrid').removeClass('container');

    $('.ui.sticky').sticky();
    $('.menu .item').tab();
    $('.ui.menu .videoshowmore.money').popup({
        inline: true,
        hoverable: true,
        position: 'bottom right',
        delay: {
            show: 100,
            hide: 0
        }
    })
    $('.ui.infinite')
        .visibility({
            once: false,
            observeChanges: true,
            onBottomVisible: function() {
                Template.channel.loadMore()
            }
        });
    reclick = false


}

Template.channel.loadMore = function() {
    $('.ui.infinite .loader').show()
    Videos.getVideosByBlog(FlowRouter.getParam("author"), 50, function(err, finished) {
        if (err) console.log(err)
        $('.ui.infinite .loader').hide()
        if (!err && $('.ui.infinite').height() < window.outerHeight && !finished)
            setTimeout(Template.channel.loadMore, 1000)
    })
}

Template.channel.helpers({
    mainUser: function() {
        return Users.findOne({ username: Session.get('activeUsername') })
    },
    user: function() {
        return {
            name: FlowRouter.getParam("author")
        }
    },
    author: function() {
        return ChainUsers.findOne({ name: FlowRouter.getParam("author") })
    },
    relatedChannels: function() {
        return Session.get('relatedChannels')
    },
    isLoggedOn: function() {
        return Session.get('activeUsername')
    },
    activeUser: function() {
        return Session.get('activeUsername')
    },
    userVideos: function() {
        var query = {
            'author': FlowRouter.getParam("author"),
            source: 'chainByBlog'
        }
        if (Session.get('activeUsername') != query.author)
            query["json.hide"] = { $ne: 1 }
        return Videos.find(query, { sort: { ts: -1 } }).fetch()
    },
    subCount: function() {
        return ChainUsers.findOne({ name: FlowRouter.getParam("author") }).followersCount || 0
    },
    followingCount: function() {
        return ChainUsers.findOne({ name: FlowRouter.getParam("author") }).followsCount || 0
    },
    currentTab: function() {
        return Session.get('currentTab')
    }
})


Template.channel.events({
    'click .subscribe': function() {
        var user = ChainUsers.findOne({ name: FlowRouter.getParam("author") })
        user.followersCount++
            ChainUsers.upsert({ _id: user._id }, user)
        Subs.insert({
            follower: Session.get('activeUsername'),
            following: FlowRouter.getParam("author"),
            what: ['blog']
        })
        broadcast.avalon.follow(FlowRouter.getParam("author"), function(err, result) {
            // alternative, inutile jusqua preuve du contraire
            // steem.api.getFollowCount(FlowRouter.getParam("author"), function(e,r) {
            //   SubCounts.upsert({_id: r.account}, r)
            // })
            if (err)
                Meteor.blockchainError(err)
        })
    },
    'click .editprofile': function() {
        FlowRouter.go('/c/'+Session.get('activeUsername')+'/about')
        Session.set('currentTab', 'about')
        Session.set('isEditingProfile', true)
    },
    'click .unsubscribe': function() {
        var user = ChainUsers.findOne({ name: FlowRouter.getParam("author") })
        user.followersCount--
            ChainUsers.upsert({ _id: user._id }, user)
        Subs.remove({
            follower: Session.get('activeUsername'),
            following: FlowRouter.getParam("author")
        })
        broadcast.avalon.unfollow(FlowRouter.getParam("author"), function(err, result) {
            // finished unfollowing
            if (err)
                Meteor.blockchainError(err)
        })
    },
    'click .item.about': function() {
        Session.set('currentTab', 'about')
        FlowRouter.go('/c/' + FlowRouter.getParam("author") + '/about')
    },
    'click .item.keys': function(e) {
        Session.set('currentTab', 'keys')
        if (!reclick) {
            reclick = true
            $('.menu .item').tab();
            $('.menu .item.keys').click()
            $('.menu .item.keys').addClass('active')
        }
        FlowRouter.go('/c/' + FlowRouter.getParam("author") + '/keys')
    },
    'click .item.rewards': function(e) {
        Session.set('currentTab', 'rewards')
        if (!reclick) {
            reclick = true
            $('.menu .item').tab();
            $('.menu .item.rewards').click()
            $('.menu .item.rewards').addClass('active')
        }
        FlowRouter.go('/c/' + FlowRouter.getParam("author") + '/rewards')
    },
    'click .item.videos': function() {
        Session.set('currentTab', 'videos')
        Template.channel.rendered()
        FlowRouter.go('/c/' + FlowRouter.getParam("author"))
    },
})