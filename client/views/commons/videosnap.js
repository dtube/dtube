Template.videosnap.events({
  'click .remove': function() {
    var removeId = this._id
    Waka.db.Articles.remove(removeId.substring(0, removeId.length-1), function(r) {
      Videos.remove({_id: removeId}, function(r) {
        Videos.refreshWaka()
      })
    })
    event.preventDefault()
  }
})



Template.videosnap.rendered = function() {
  // $('snapimg')(function(){
  //       var img = new Image($(this)); // creating image element
  //       img.onload = function() { // trigger if the image was loaded
  //           $('.dimmer').removeClass('active');
  //       }
  //       img.onerror = function() { // trigger if the image wasn't loaded
  //       $('.dimmer').addClass('active');
  //       }
  //       img.onAbort = function() { // trigger if the image load was abort
  //         $('.dimmer').addClass('active');
  //       }
  //       img.src = $(this).attr('src'); // pass src to image object
  //   });

  // var img = document.querySelector('#snapimg')
  
  // function loaded() {
  //   $('.dimmer').removeClass('active');
  // }
  
  // if (img.complete) {
  //   loaded()
  // } else {
  //   img.addEventListener('load', loaded)
  //   img.addEventListener('error', function() {
  //     $('.dimmer').addClass('active');
  //   })
  // }

//   $('#snapimg').load(function(){
//     if($(this).height() > 100) {
//       $('.dimmer').removeClass('active');
//     }
// });
}


