var imagesLoaded = require('imagesloaded');
var moment = require('moment')
var moment_duration = require('moment-duration-format')

Template.verticalvideosnap.events({
  'click #remove': function () {
    console.log("click on remove");
    var removeId = this._id
    Waka.db.Articles.remove(removeId.substring(0, removeId.length - 1), function (r) {
      Videos.remove({ _id: removeId }, function (r) {
        Videos.refreshWaka()
      })
    })
    event.preventDefault()
  }
})

Template.verticalvideosnap.rendered = function () {
  Template.videosnap.snapLoaded();
}

Template.verticalvideosnap.snapLoaded = function () {
  $('#snapimg').imagesLoaded(function () {
    //$('#snapload').remove();
    //let cheat
  });
}

Template.verticalvideosnap.helpers({
  durationToTime : function seconds2time(seconds) {
    var time = moment.duration(seconds, 'seconds');
    if (moment.duration(seconds, 'seconds') === null) 
    {
      return "formatted";
    }
      else {
        var time = moment.duration(seconds, 'seconds');
        if (time.asHours() > 1) {
          var formatted = time.format("h:mm:ss", { trim: false });
        } else {
          var formatted = time.format("mm:ss", { trim: false });
        }
        return formatted;
      }
    }
})


