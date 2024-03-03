var parse = require('url-parse')

Template.addvideoform3p.rendered = () => Template.settingsdropdown.nightMode()
Template.addvideoform3p.helpers({
  providers: function() {
    return Providers.all3p()
  }
})

Template.addvideoform3p.events({
    'click #addvideoback': function () {
        Session.set('addVideoStep', 'addvideoform')
    },
    'click #addvideonext': function() {
        $('#addvideonext').addClass('disabled')
        $('#addvideonext i').removeClass('arrow right blue')
        $('#addvideonext i').addClass('asterisk loading')
        $('#addvideonext i').css('background', 'transparent')
        Template.addvideoform3p.grabData($('#remotelink')[0].value, function(content) {
            console.log(content)
            Template.addvideo.addFiles(Providers.dispToId(content.providerName), content.videoId)
            Template.addvideo.tmpVid({title: content.title})
            Template.addvideo.tmpVid({desc: content.description})
            Template.addvideo.tmpVid({dur: content.duration})
            if (content.providerName != 'YouTube' && content.thumbnailUrl)
              Template.addvideo.tmpVid({thumbnailUrl: content.thumbnailUrl})
            Session.set('addVideoStep', 'addvideopublish')
        })
    }
})

Template.addvideoform3p.grabData = function(url, cb) {
  var urlInfo = parse(url, true)
  switch (urlInfo.host) {
    case 'www.youtube.com':
    case 'm.youtube.com':
    case 'music.youtube.com':
    case 'youtu.be':
      getYoutubeVideoData(url, function(content) {
        cb(content)
      })
      break;

    case 'www.instagram.com':
    case 'www.dailymotion.com':
    case 'clips.twitch.tv':
    case 'vimeo.com':
      getOEmbedData(url, function(content) {
        cb(content)
      })
      break;

    case 'www.twitch.tv':
    case 'twitch.tv':
      if (urlInfo.pathname.split('/')[2] == 'clip')
        getOpenGraphData(url, function(content) {
          cb(content)
        })
      else if (urlInfo.pathname.split('/')[1] == 'videos')
        getOpenGraphData(url, function(content) {
          cb(content)
        })
      else
        getOpenGraphData(url, function(content) {
          cb(content)
        })
      break;  

    case 'www.facebook.com':
    default:
      getOpenGraphData(url, function(content) {
        cb(content)
      })
      break;
  }
}

function getOEmbedData(url, callback) {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (this.readyState === 4 && this.status === 200) {
        let video = JSON.parse(this.responseText);
        callback(sanitizeVideo(video, url));
      }
    }
    xhr.open("GET", 'https://avalon.d.tube/oembed/'+encodeURIComponent(url));
    //xhr.setRequestHeader("User-Agent", "Mozilla/5.0 (X11; Linux x86_64; rv:42.0) Gecko/20100101 Firefox/42.0")
    xhr.send();
}


function getOpenGraphData(url, callback) {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (this.readyState === 4 && this.status === 200) {
        let video = JSON.parse(this.responseText).data;
        callback(sanitizeVideo(video, url));
      }
    }
    xhr.open("GET", 'https://avalon.d.tube/opengraph/'+encodeURIComponent(url));
    //xhr.setRequestHeader("User-Agent", "Mozilla/5.0 (X11; Linux x86_64; rv:42.0) Gecko/20100101 Firefox/42.0")
    xhr.send();
}  

function getYoutubeVideoData(url, callback) {
    var videoId = ''
    if (url.indexOf('v=') == -1)
      videoId = url.split('/')[url.split('/').length-1]
    else {
      videoId = url.split('v=')[1]
      var ampersandPosition = videoId.indexOf('&')
      if(ampersandPosition != -1)
        videoId = videoId.substring(0, ampersandPosition);
    }
  
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (this.readyState === 4 && this.status === 200) {
        let video = null
        try {
            video = JSON.parse(this.responseText);
        } catch (error) {
            return toastr.error(translate('UPLOAD_ERROR_YOUTUBE_API'), translate('ERROR_TITLE'))
        }
        
        // like gmail
        function decodeHtml(html) {
          var txt = document.createElement("textarea");
          txt.innerHTML = html;
          return txt.value;
        }
        video.description = decodeHtml(video.description)
        video.description = video.description.replace(/<style([\s\S]*?)<\/style>/gi, '');
        video.description = video.description.replace(/<script([\s\S]*?)<\/script>/gi, '');
        video.description = video.description.replace(/<\/div>/ig, '\n');
        video.description = video.description.replace(/<\/li>/ig, '\n');
        video.description = video.description.replace(/<li>/ig, '  *  ');
        video.description = video.description.replace(/<\/ul>/ig, '\n');
        video.description = video.description.replace(/<\/p>/ig, '\n');
        video.description = video.description.replace(/<br\s*[\/]?>/gi, "\n");
        video.description = video.description.replace(/<[^>]+>/ig, '');
        callback(sanitizeVideo(video, url));
      }
    }
    xhr.open("GET", 'https://avalon.d.tube/youtube/'+videoId);
    //xhr.setRequestHeader("User-Agent", "Mozilla/5.0 (X11; Linux x86_64; rv:42.0) Gecko/20100101 Firefox/42.0")
    xhr.send();
}

function sanitizeVideo(video, url) {
  console.log(video)
    var newVid = {
      videoId: video.videoId || video.video_id,
      url: video.url || video.ogUrl,
      title: video.title || video.ogTitle,
      description: video.description || video.ogDescription,
      owner: video.owner || video.curator_name || video.author_name,
      ownerUrl: video.owner_url || video.author_url,
      channelId: video.channelId,
      thumbnailUrl: video.thumbnailUrl || video.thumbnail_url,
      thumbnailWidth: video.thumbnail_width || video.width,
      thumbnailHeight: video.thumbnail_height || video.height,
      datePublished: video.datePublished || video.upload_date,
      genre: video.genre,
      game: video.game,
      isFamilyFriendly: video.isFamilyFriendly,
      duration: video.duration || video.video_length,
      channelThumbnailUrl: video.channelThumbnailUrl,
      providerName: video.provider_name,
      providerUrl: video.provider_url,
      twitch_type: video.twitch_type
    }
    if (video.ogImage) {
      newVid.thumbnailUrl = video.ogImage.url
      newVid.thumbnailWidth = video.ogImage.width
      newVid.thumbnailHeight = video.ogImage.height
    }
    if (video.twitterImage && video.twitterImage.url && !newVid.thumbnailUrl)
      newVid.thumbnailUrl = video.twitterImage.url
    for (var f in newVid) { 
      if (newVid[f] === null || newVid[f] === undefined) {
        delete newVid[f];
      }
    }
    if (!newVid.url) newVid.url = url
    if (!newVid.videoId) newVid.videoId = videoIdFromUrl(newVid, url)
    if (!newVid.providerName) newVid.providerName = providerNameFromUrl(url)
    newVid.app = Meteor.settings.public.app || 'dtube'
    return newVid
}

function providerNameFromUrl(url) {
    var urlInfo = parse(url, true)
    switch (urlInfo.host) {
      case "www.liveleak.com":
        return 'LiveLeak'
        break;
  
      case "www.facebook.com":
        return 'Facebook'
        break;
  
      case "www.youtube.com":
      case 'm.youtube.com':
      case 'music.youtube.com':
      case 'youtu.be':
        return 'YouTube'
        break;
  
      case "www.twitch.tv":
      case "clips.twitch.tv":
      case "twitch.tv":
        return 'Twitch'
        break;
    
      default:
        return 'Unknown Provider'
        break;
    }
}

function videoIdFromUrl(video, url) {
    var urlInfo = parse(url, true)
    switch (urlInfo.host) {
      case "www.twitch.tv":
      case "clips.twitch.tv":
      case "twitch.tv":
        if (video.twitch_type == 'clip')
          return urlInfo.pathname.split('/')[3]
        else if (urlInfo.pathname.split('/')[2] == 'clip')
          return urlInfo.pathname.split('/')[3]
        else if (urlInfo.pathname.split('/')[1] == 'videos')
          return urlInfo.pathname.split('/')[2]
        else
          return urlInfo.pathname.split('/')[1]
        break;
  
      case "www.dailymotion.com":
        return urlInfo.pathname.replace('/video/', '')
        break;
  
      case "www.instagram.com":
        return urlInfo.pathname.replace('/p/', '').replace('/', '')
        break;
  
      case "www.facebook.com":
        // https://www.facebook.com/zap.magazine/videos/278373702868688/
        // https://www.facebook.com/watch/?v=1371488622995266
        return urlInfo.query.v || urlInfo.pathname.split('/')[3]
        break;
  
      case "www.liveleak.com":
        return urlInfo.query.t
        break;

      case 'www.youtube.com':
      case 'm.youtube.com':
      case 'music.youtube.com':
        return urlInfo.query.v
        break;

      case 'youtu.be':
        return urlInfo.pathname.split('/')[1]
        break;
      default:
        break;
    }
    console.log(urlInfo)
}