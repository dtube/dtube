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
}

Template.player.init = function(author, link, json) {
  json = JSON.parse(JSON.stringify(json))
  var options = ["true", "true"]
  if (UserSettings.get('defaultProvider') && Providers.available(json).indexOf(UserSettings.get('defaultProvider')) > -1) {
    options.push(UserSettings.get('defaultProvider'))
  }
    
  if (author && link) {
    if (json) {
      jsoun = Template.player.toJsoun(json)
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

Template.player.toJsoun = (json) => {
  delete json.desc
  delete json.description
  delete json.title
  delete json.tag
  delete json.hide
  delete json.refs
  delete json.genre
  delete json.datePublished
  delete json.channelThumbnailUrl
  delete json.channelId
  delete json.app
  delete json.owner
  delete json.isFamilyFriendly
  delete json.url
  return JSOUN.encode(json)
}

Template.player.changeProvider = function(provider) {
  UserSettings.set('defaultProvider', provider)
  Template.player.reset()
}