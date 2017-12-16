Template.torrentStats.rendered = function () {
  if (typeof torrentRefresh !== 'undefined') clearInterval(torrentRefresh)
  torrentRefresh = setInterval(function(){
    Template.torrentStats.refreshStats();
  }, 1000)
  Template.torrentStats.refreshStats();
  Template.settingsdropdown.nightMode();
}

Template.torrentStats.refreshStats = function () {
  if (Torrent.torrents.length>0) {
    $('.ui.segments.statistics').removeClass('displaynone');
    Stats.upsert({_id: 'torrent'}, {
      _id: 'torrent',
      uploadSpeed: Torrent.uploadSpeed,
      numPeers:Torrent.torrents[0].numPeers
    })
  }
  else{
    // $('.ui.segments.statistics').addClass('displaynone');
  }
}

Template.torrentStats.helpers({
  stats: function() {
    return Stats.findOne({_id: 'torrent'})
  },
  uploadedVideo: function() {
    return Session.get('uploadedVideo')
  }
})
