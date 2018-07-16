Template.livestreams.helpers({
    livestreams: function () {
      return Livestreams.find().fetch()
    }
  })
  
  Template.livestreams.rendered = function () {
    Livestreams.getStreams(function(err) {
        if (err) console.log('Error fetching livestreams list')
        $('.ui.infinite')
        .visibility({
          once: false,
          observeChanges: true,
          onBottomVisible: function() {
            // $('.ui.infinite .loader').show()
            // Videos.getVideosBy('hot', 50, function(err){
            //   if (err) console.log(err)
            //   $('.ui.infinite .loader').hide()
            // })
          }
        });
    })
  }
  