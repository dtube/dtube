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
}

Template.videosnap.snapLoaded = function () {
  $('#snapimg').imagesLoaded(function () {
    //$('#snapload').remove();
    //let cheat
  });
}


