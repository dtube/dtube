var JSOUN = require('jsoun')

Template.player.rendered = function () {
  Template.player.reset(this.data)

  Template.player.isGonnaCloseMirrors = null
  setTimeout(function(){
    $('.embed>iframe').hover(function(){
      if ($('.mirrors').is(':animated'))
        $('.mirrors').stop(true, true)
      $('.mirrors').show()
      clearTimeout(Template.player.isGonnaCloseMirrors)
    },function(){
      Template.player.isGonnaCloseMirrors = setTimeout(function() {
        $('.mirrors').fadeOut(2500)
      }, 1000)
    })
    $('.mirrors').hover(function(){
      clearTimeout(Template.player.isGonnaCloseMirrors)
    },function(){
      Template.player.isGonnaCloseMirrors = setTimeout(function() {
        $('.mirrors').fadeOut(2500)
      }, 1000)
    })
  }, 1000)
}

Template.player.helpers({
  availProviders: function() {
    var video = this
    if (video.json) video = video.json
    var provDisp = Providers.available(video)
    var provs = []
    for (let i = 0; i < provDisp.length; i++) {
      provs.push({
        disp: provDisp[i],
        logo: Providers.dispToLogo(provDisp[i])
      })
    }
    if (provs.length <= 1)
      return []
    return provs
  },
})

Template.player.events({
  'click .mirrorLogo': function() {
    Template.player.changeProvider(this.disp)
    $('.embed>iframe').hover(function(){
      if ($('.mirrors').is(':animated'))
        $('.mirrors').stop(true, true)
      $('.mirrors').show()
      clearTimeout(Template.video.isGonnaCloseMirrors)
    },function(){
      Template.video.isGonnaCloseMirrors = setTimeout(function() {
        $('.mirrors').fadeOut(2500)
      }, 1000)
    })
  },
})

Template.player.reset = function(data) {
  if (!data)
    data = Template.video.__helpers[" video"]()
  if (!data)
    data = Session.get('tmpVideo')
  if (!data || !data.json) return
  Template.player.init(data.author, data.link, data.json)
    return
  // switch (data.json.providerName) {
  //   case "Twitch":
  //     if (data.json.twitch_type && data.json.twitch_type == 'clip')
  //       Template.player.initTwitchClips(data.json.videoId)
  //     else
  //       Template.player.initTwitch(data.json.videoId)
  //     break;
  //   case "Dailymotion":
  //     Template.player.initDailymotion(data.json.videoId)
  //     break;
  //   case "Instagram":
  //     Template.player.initInstagram(data.json.videoId)
  //     break;
  //   case "LiveLeak":
  //     Template.player.initLiveLeak(data.json.videoId)
  //     break;
  //   case "Vimeo":
  //     Template.player.initVimeo(data.json.videoId)
  //     break;
  //   case "Facebook":
  //     Template.player.initFacebook(data.json.videoId, data.json.url)
  //     break;
  //   case "YouTube":
  //     Template.player.initYouTube(data.json.videoId)
  //     break;
  //   default:
  //     Template.player.init(data.author, data.link)
  //     break;
  // }
}

Template.player.init = function(author, link, json) {
  var options = ["true", "true"]
  if (UserSettings.get('defaultProvider'))
    options.push(UserSettings.get('defaultProvider'))
  if (author && link) {
    if (json) {
      var jsoun = {files: json.files}
      if (json.thumbnailUrl)
        jsoun.thumbnailUrl = json.thumbnailUrl
      jsoun = JSOUN.encode(jsoun)
      $('.ui.embed.player').embed({
        url: "https://emb.d.tube/#!//" + jsoun
        + "/" + options.join('/')
      });
    } else {
      $('.ui.embed.player').embed({
        url: "https://emb.d.tube/#!/" + author + '/' + link
        + "/" + options.join('/')
      });
    }
  }
  else if (Session.get('tmpVideo')) {
    options[0] = "false"
    var json = Session.get('tmpVideo').json
    delete json.title
    delete json.desc
    $('.ui.embed.player').embed({
      url: "https://emb.d.tube/#!//" + JSOUN.encode(json)
      + "/" + options.join('/')
    });

    // listen for duration coming from the player
    var eventMethod = window.addEventListener
        ? "addEventListener"
        : "attachEvent";
    var eventer = window[eventMethod];
    var messageEvent = eventMethod === "attachEvent"
      ? "onmessage"
      : "message";
    eventer(messageEvent, function (e) {
      // console.log(e)
      if (e.origin !== 'https://emb.d.tube') return;
      if (e.data && e.data.dur) {
        Template.addvideo.tmpVid({dur: e.data.dur})
        $('input[name="duration"]')[0].value = e.data.dur
      }
    });
  }
}

Template.player.changeProvider = function(provider) {
  UserSettings.set('defaultProvider', provider)
  Template.player.reset()
}

// Template.player.initYouTube = function(id) {
//   $('.ui.embed.player').embed({
//     url: "https://www.youtube.com/embed/" + id
//     + "?autoplay=1&showinfo=1&modestbranding=1"
//   });
// }

// Template.player.initTwitch = function(id) {
//   if (parseInt(id) == id)
//     $('.ui.embed.player').embed({
//       url: "https://player.twitch.tv/?video=v" + id
//       + "&autoplay=true&muted=false"
//     });
//   else
//     $('.ui.embed.player').embed({
//       url: "https://player.twitch.tv/?channel=" + id
//       + "&autoplay=true&muted=false"
//     });
// }

// Template.player.initTwitchClips = function(id) {
//   $('.ui.embed.player').embed({
//     url: "https://clips.twitch.tv/embed?clip=" + id
//     + "&autoplay=true&muted=false"
//   });
// }

// Template.player.initDailymotion = function(id) {
//   $('.ui.embed.player').embed({
//     url: "https://www.dailymotion.com/embed/video/" + id
//     + "?autoplay=true&mute=false"
//   });
// }

// Template.player.initInstagram = function(id) {
//   $('.ui.embed.player').embed({
//     url: "https://www.instagram.com/p/" + id + '/embed/'
//   });
// }

// Template.player.initFacebook = function(id, url) {
//   // autoplay way
//   $('.ui.embed.player').embed({
//     url: "https://www.facebook.com/v2.3/plugins/video.php?allowfullscreen=true&autoplay=true&container_width=800&href="
//     + encodeURI(url)
//   });

//   // original way
//   // $('.ui.embed.player').embed({
//   //   url: "https://www.facebook.com/video/embed?video_id=" + id
//   // });
// }

// Template.player.initLiveLeak = function(id) {
//   $('.ui.embed.player').embed({
//     url: "https://www.liveleak.com/e/" + id
//   });
// }

// Template.player.initVimeo = function(id) {
//   $('.ui.embed.player').embed({
//     url: "https://player.vimeo.com/video/" + id
//     + "?autoplay=1&muted=0"
//   });
// }