Template.activity.helpers({
    getTitle: function (author, permlink) {
        var video = Videos.findOne({ 'author': author, 'link': permlink })
        if (video) return video.json.title;
    },
    getSnap: function (author, permlink) {
        var video = Videos.findOne({ 'author': author, 'link': permlink })
        if (video)
            return video.json.thumbnailUrl;
    },
    user: function () {
        return {
            name: FlowRouter.getParam("author")
        }
    }
})


Template.activity.events({
    'click a': function () {
        $('.ui.menu').find('.item').tab('change tab', 'first')
    }
  })

  
Template.activity.rendered = function(){
    Template.settingsdropdown.nightMode();
  }