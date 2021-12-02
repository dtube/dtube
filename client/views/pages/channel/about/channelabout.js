Template.channelabout.rendered = function () {
    Template.settingsdropdown.nightMode()
  }

Template.channelabout.helpers({
    author: function () {
        let authorDetail = ChainUsers.findOne({ name: FlowRouter.getParam("author") })
        if (!authorDetail.created) authorDetail.created = {
            by: 'dtube',
            ts: 1593350655283 // timestamp of block #1
        }
        return authorDetail
    },
    userVideos: function () {
        return Videos.find({ 'info.author': FlowRouter.getParam("author"), source: 'chainByBlog' }).fetch()
    },
    user: function () {
        return {
            name: FlowRouter.getParam("author")
        }
    },
    subCount: function () {
        return ChainUsers.findOne({ name: FlowRouter.getParam("author") }).followersCount || 0
    },
    followingCount: function () {
        return ChainUsers.findOne({ name: FlowRouter.getParam("author") }).followsCount || 0
    },
    isEditingProfile: function() {
        return Session.get('isEditingProfile')
    },
    isNonZeroTs: ts => ts > 0
})


Template.channelabout.events({
    'click .button.editvideo': function () {
        Session.set('currentTab', 'about')
        FlowRouter.go('/c/' + FlowRouter.getParam("author") + '/about')
        Session.set('isEditingProfile', !Session.get('isEditingProfile'))
    },
    'submit .form': function() {
        event.preventDefault()
        var json = ChainUsers.findOne({ name: Session.get('activeUsername') }).json
        if (!json) json = {}
        if (!json.profile) json.profile = {}
        json.profile.avatar = event.target.profile_avatar.value.trim()
        json.profile.cover_image = event.target.profile_cover.value.trim()
        json.profile.about = event.target.profile_about.value.trim()
        json.profile.location = event.target.profile_location.value.trim()
        json.profile.website = event.target.profile_website.value.trim()
        json.profile.steem = event.target.profile_steem.value.trim().replace('@','')
        json.profile.hive = event.target.profile_hive.value.trim().replace('@','')
        json.profile.blurt = event.target.profile_blurt.value.trim().replace('@','')
        broadcast.avalon.editProfile(json, function(err, res) {
            if (err) Meteor.blockchainError(err)
            else {
                toastr.success(translate('GLOBAL_EDIT_PROFILE'))
                Session.set('isEditingProfile', false)
            }
        })
    },
    'click .openkeys': function() {
        Session.set('currentTab', 'keys')
        $('.menu .item').tab();
        $('.menu .item.keys').click()
        $('.menu .item.keys').addClass('active')
    },
    'click .openrewards': function() {
        Session.set('currentTab', 'rewards')
        $('.menu .item').tab();
        $('.menu .item.rewards').click()
        $('.menu .item.rewards').addClass('active')
    }
})
