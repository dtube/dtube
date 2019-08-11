
Template.verticalvideosnap.events({
  'click #remove': function () {
    WatchLater.remove(this._id)
    event.preventDefault()
  }
})

Template.verticalvideosnap.rendered = function () {
  $(this.firstNode.nextSibling).find('img').visibility({
    type       : 'image',
    transition : 'fade in',
    duration   : 1000
  })
  Template.settingsdropdown.nightMode();
 }

 Template.verticalvideosnap.helpers({

 })


