var mom = require('moment')
var moment = require('moment-duration-format')
var imagesLoaded = require('imagesloaded');

Template.videosnap.events({
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
  
Template.videosnap.rendered = function () {
  Template.videosnap.snapLoaded();
  console.log(Videos.length);
}

Template.videosnap.snapLoaded = function () {
  $('#snapimg').imagesLoaded(function () {
    //$('#snapload').remove();
    //let cheat
  });
}
Template.videosnap.durationToTime = function seconds2time(seconds) {
  var duration = mom.duration(seconds, 'seconds');
  if (duration.asHours() > 1) {
    var formatted = duration.format("h:mm:ss", { trim: false });
  } else {
    var formatted = duration.format("mm:ss", { trim: false });
  }
  console.log(formatted); // 01:03:40
  return formatted;
}


