Template.tags.onRendered(function () {
    Template.sidebar.resetActiveMenu()
    $('.ui.selection.dropdown').dropdown({
    });
});

Template.tags.helpers({
    currentTag: function () {
        return FlowRouter.getParam("tag")
    },
    tagVideos: function() {
        var sort = {}
        sort[Session.get('tagSortBy')] = -1
        return Videos.find({
            source: 'askSteem',
            'askSteemQuery.tags': FlowRouter.getParam("tag")
        }, {
            sort: sort
        }).fetch()
    },
    moreThan20: function() {
        return Session.get('tagCount') > 20
    }
})

Template.tags.events({
    'click .period': function(event) {
        Session.set('tagCount',0)
        Videos.remove({source:'askSteem'})
        Session.set('tagDays', $(event.target).data('value'))
        Videos.getVideosByTags(1, [FlowRouter.getParam("tag")], Session.get('tagDays'), Session.get('tagSortBy'), 'desc', Session.get('tagDuration'),0, function(err, response) {})
        // Videos.getVideosByTags(2, [FlowRouter.getParam("tag")], Session.get('tagDays'), Session.get('tagSortBy'), 'desc', Session.get('tagDuration'), function(err, response) {})
        // Videos.getVideosByTags(3, [FlowRouter.getParam("tag")], Session.get('tagDays'), Session.get('tagSortBy'), 'desc', Session.get('tagDuration'), function(err, response) {})
    },
    'click .sortby': function(event) {
        Videos.remove({source:'askSteem'})
        Session.set('tagSortBy', $(event.target).data('value'))
        Videos.getVideosByTags(1, [FlowRouter.getParam("tag")], Session.get('tagDays'), Session.get('tagSortBy'), 'desc', Session.get('tagDuration'),0, function(err, response) {})
        // Videos.getVideosByTags(2, [FlowRouter.getParam("tag")], Session.get('tagDays'), Session.get('tagSortBy'), 'desc', Session.get('tagDuration'), function(err, response) {})
        // Videos.getVideosByTags(3, [FlowRouter.getParam("tag")], Session.get('tagDays'), Session.get('tagSortBy'), 'desc', Session.get('tagDuration'), function(err, response) {})
    },
    'click .duration': function(event) {
        Session.set('tagCount',0)
        Videos.remove({source:'askSteem'})
        Session.set('tagDuration', $(event.target).data('value'))
        Videos.getVideosByTags(1, [FlowRouter.getParam("tag")], Session.get('tagDays'), Session.get('tagSortBy'), 'desc', Session.get('tagDuration'),0, function(err, response) {})
        // Videos.getVideosByTags(2, [FlowRouter.getParam("tag")], Session.get('tagDays'), Session.get('tagSortBy'), 'desc', Session.get('tagDuration'), function(err, response) {})
        // Videos.getVideosByTags(3, [FlowRouter.getParam("tag")], Session.get('tagDays'), Session.get('tagSortBy'), 'desc', Session.get('tagDuration'), function(err, response) {})
    },
    'click .morebtn': function(event) {
        let itemsCurrentlyDisplayed = Videos.find({source:'askSteem'}).count()
        Videos.getVideosByTags(1, [FlowRouter.getParam("tag")], Session.get('tagDays'), Session.get('tagSortBy'), 'desc', Session.get('tagDuration'),itemsCurrentlyDisplayed, function(err, response) {})
    }
})
