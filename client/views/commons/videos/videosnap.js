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
  },
  // 'mouseenter .spritehash'() {
  //   console.log("click on remove");
  //   $(this).animate({
  //     'background-position-x': '0',
  //     'background-position-y': '-3080px'
  // }, 1000, 'linear');
  // },
  // 'mouseleave .spritehash': function () {
  //   console.log("click on remove");
  //   $(this).animate({
  //     'background-position-x': '0',
  //     'background-position-y': '0'
  // }, 1000, 'linear');
  // }
})
  

Template.videosnap.rendered = function () {
  // var random = Template.upload.createPermlink(10)
  // this.firstNode.id = random
  // Template.videosnap.createSnap(random)
  Template.videosnap.snapLoaded();
}

Template.videosnap.snapLoaded = function () {
  $('#snapimg').imagesLoaded(function () {
    //$('#snapload').remove();
    //let cheat
  });
}


// Template.videosnap.createSnap = function (elemId) {
//   console.log(elemId)
//     $("#" + elemId).transition('slide down')
// }
