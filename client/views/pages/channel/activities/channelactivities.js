Template.channelactivities.rendered = function () {
    Activities.getAccountHistory(FlowRouter.getParam("author"), -1, 20)
    $('.ui.infinite.activities').visibility('refresh')
    $('.ui.activities').addClass('infinite')
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
    }
})

