Template.player.rendered = function () {
  switch (this.data.json.providerName) {
    case "Twitch":
      if (this.data.json.twitch_type && this.data.json.twitch_type == 'clip')
        Template.player.initTwitchClips(this.data.json.videoId)
      else
        Template.player.initTwitch(this.data.json.videoId)
      break;
    case "Dailymotion":
      Template.player.initDailymotion(this.data.json.videoId)
      break;
    case "Instagram":
      Template.player.initInstagram(this.data.json.videoId)
      break;
    case "LiveLeak":
      Template.player.initLiveLeak(this.data.json.videoId)
      break;
    case "Vimeo":
      Template.player.initVimeo(this.data.json.videoId)
      break;
    case "Facebook":
      Template.player.initFacebook(this.data.json.videoId, this.data.json.url)
      break;
    case "YouTube":
      Template.player.initYouTube(this.data.json.videoId)
      break;
    default:
      Template.player.init(this.data.author, this.data.link)
      break;
  }
}

Template.player.init = function(author, link) {
  $('.ui.embed.player').embed({
    url: "https://emb.d.tube/#!/" + author + '/' + link
    + "/true/true"
  });
}

Template.player.initYoutube = function(id) {
  $('.ui.embed.player').embed({
    url: "https://www.youtube.com/embed/" + id
    + "?autoplay=1&showinfo=1&modestbranding=1"
  });
}

Template.player.initTwitch = function(id) {
  if (parseInt(id) == id)
    $('.ui.embed.player').embed({
      url: "https://player.twitch.tv/?video=v" + id
      + "&autoplay=true&muted=false"
    });
  else
    $('.ui.embed.player').embed({
      url: "https://player.twitch.tv/?channel=" + id
      + "&autoplay=true&muted=false"
    });
}

Template.player.initTwitchClips = function(id) {
  $('.ui.embed.player').embed({
    url: "https://clips.twitch.tv/embed?clip=" + id
    + "&autoplay=true&muted=false"
  });
}

Template.player.initDailymotion = function(id) {
  $('.ui.embed.player').embed({
    url: "https://www.dailymotion.com/embed/video/" + id
    + "?autoplay=true&mute=false"
  });
}

Template.player.initInstagram = function(id) {
  $('.ui.embed.player').embed({
    url: "https://www.instagram.com/p/" + id + '/embed/'
  });
}

Template.player.initFacebook = function(id, url) {
  // autoplay way
  $('.ui.embed.player').embed({
    url: "https://www.facebook.com/v2.3/plugins/video.php?allowfullscreen=true&autoplay=true&container_width=800&href="
    + encodeURI(url)
  });

  // original way
  // $('.ui.embed.player').embed({
  //   url: "https://www.facebook.com/video/embed?video_id=" + id
  // });
}

Template.player.initLiveLeak = function(id) {
  $('.ui.embed.player').embed({
    url: "https://www.liveleak.com/e/" + id
  });
}

Template.player.initVimeo = function(id) {
  $('.ui.embed.player').embed({
    url: "https://player.vimeo.com/video/" + id
    + "?autoplay=1&muted=0"
  });
}