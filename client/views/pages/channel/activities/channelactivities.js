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
        return Activities.find({ username: FlowRouter.getParam("author") }, { sort: { date: -1 } }).fetch()
    },
    isOnMobile: function () {
        if (/Mobi/.test(navigator.userAgent)) {
            return true;
        }
    }
})

Template.channelactivities.events({
    'click .checkbox.liked': function () {
        Activities.direct.update({ username: FlowRouter.getParam("author"), type : 'vote' }, { sort: { date: -1 } })
    }
  })