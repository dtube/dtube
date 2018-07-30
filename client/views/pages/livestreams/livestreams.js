Template.livestreams.helpers({
    livestreams: function () {
      var list = Livestreams.find({}, {sort: {'created': -1}}).fetch()
      var uniqueStreams = []
      var streamers = []
      for (let i = 0; i < list.length; i++) {
        if (streamers.indexOf(list[i].author) == -1) {
          streamers.push(list[i].author)
          uniqueStreams.push(list[i])
        }        
      }
      var stats = LiveStats.find().fetch()
      var onlineStreams = []
      for (let i = 0; i < uniqueStreams.length; i++) {
        for (let y = 0; y < stats.length; y++) {
          if (stats[y]._id == uniqueStreams[i].author) {
            var onlineStream = uniqueStreams[i]
            onlineStream.viewers = stats[y].viewers
            onlineStreams.push(onlineStream)
          }
        }
      }
      var onlineStreamsByPayout = onlineStreams.sort(function(a,b) {
        var payoutA = parseFloat(a.pending_payout_value.split(' ')[0])
        var payoutB = parseFloat(b.pending_payout_value.split(' ')[0])
        return payoutB - payoutA
      })
      return onlineStreamsByPayout
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

    Livestreams.getStreamsByCreated(100, function(err) {
      if (err) console.log(err)
    })

    Livestreams.getStreamsByHot(100, function(err) {
      if (err) console.log(err)
    })
  }
  