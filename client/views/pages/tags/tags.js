Template.tags.helpers({
    currentTag: function () {
        return FlowRouter.getParam("tag")
    },
    tagVideos: function() {
        return Videos.find({
            source: 'askSteem',
            'askSteemQuery.tags': FlowRouter.getParam("tag")
        }).fetch()
    },
    isOnMobile: function () {
        if (/Mobi/.test(navigator.userAgent)) { 
            return true;
        }
    }
})

Template.tags.onRendered(function () {
    Template.sidebar.resetActiveMenu()
    $('.ui.selection.dropdown').dropdown({
      onChange: function(value, text, $selectedItem) {
        console.log(value,text,$selectedItem)
      }
    });
});
