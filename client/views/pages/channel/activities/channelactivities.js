Template.channelactivities.rendered = function() {
    //Activities.getAccountHistory(FlowRouter.getParam("author"), -1, 20)
    Template.settingsdropdown.nightMode()
    setTimeout(() => {
        $('.ui.infinite.activities').visibility({
            once: false,
            observeChanges: true,
            onBottomVisible: function() {
                $('.ui.infinite.activities .loader').show()
                Activities.getAccountHistory(FlowRouter.getParam("author"), function() {
                    $('.ui.infinite.activities .loader').hide()
                })
            }
        })
        $('.ui.filter.checkbox').checkbox({
            onChecked: function() {
                Template.channelactivities.addFilterType(this.name);
            },
            onUnchecked: function() {
                Template.channelactivities.removeFilterType(this.name);
            }
        })
    }, 500);

}

Template.channelactivities.helpers({
    activities: function() {
        var query = {
            username: FlowRouter.getParam("author")
        }
        if (Session.get('activityTypeFilter')) {
            query.type = { $in: Session.get('activityTypeFilter') }
            return Activities.find(query, { sort: { date: -1 } }).fetch()
        } else {
            (Session.set('activityTypeFilter'), [])
            return Activities.find({ username: FlowRouter.getParam("author") }, { sort: { date: -1 } }).fetch()
        }
    },
    explorerUsername: () => {
        return FlowRouter.getParam("author")
    }
})

Template.channelactivities.addFilterType = function(type) {
    var types = []
    if (Session.get('activityTypeFilter')) {
        types = Session.get('activityTypeFilter')
    }
    types.push(type);
    Session.set('activityTypeFilter', types)
}

Template.channelactivities.removeFilterType = function(type) {
    var types = Session.get('activityTypeFilter')
    types = types.filter(function(item) {
        return item !== type
    })
    if (types.length)
        Session.set('activityTypeFilter', types)
    else {
        Session.set('activityTypeFilter', )
    }
}