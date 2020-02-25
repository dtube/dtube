Template.publish.rendered = function() {
  Template.upload.burnRange()
}

Template.publish.helpers({
    tmpVideo: function () {
      return Session.get('tmpVideo')
    }
})