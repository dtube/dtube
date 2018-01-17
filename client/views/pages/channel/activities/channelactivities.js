Template.channelactivities.rendered = function () {
    Activities.getAccountHistory(FlowRouter.getParam("author"), -1, 20)
    $('.ui.infinite.activities').visibility({
        once: false,
        observeChanges: true,
        onBottomVisible: function () {
            $('.ui.infinite.activities .loader').show()
            Activities.getAccountHistory(FlowRouter.getParam("author"))
            $('.ui.infinite.activities .loader').hide()
        }
    })
}

Template.channelactivities.helpers({
    activities: function () {
        var query = { 
            username: FlowRouter.getParam("author")
        }
        if (Session.get('activityTypeFilter'))
            query.type = { $in: Session.get('activityTypeFilter') }
        return Activities.find(query, { sort: { date: -1 }}).fetch()
    },
    isOnMobile: function () {
        if (/Mobi/.test(navigator.userAgent)) {
            return true;
        }
    }
})

Template.channelactivities.events({
    'click .checkbox.liked': function () {
        //Session.set('activityTypeFilter', )
    }
  })