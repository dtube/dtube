var parse = require('url-parse')

Template.addvideo.rendered = function () {
    if (!Session.get('addVideoStep'))
        Session.set('addVideoStep', 'addvideoform')
    if (!Session.get('tmpVideo'))
        Session.set('tmpVideo', {})
}

Template.addvideo.tmpVid = function(data) {
    var tmpVideo = Session.get('tmpVideo')
    if (!tmpVideo.json) tmpVideo.json = {files: {}}
    Object.assign(tmpVideo.json, data)
    Session.set('tmpVideo', tmpVideo)
}

Template.addvideo.addFiles = function(tech, files) {
    var tmpVideo = Session.get('tmpVideo')
    if (!tmpVideo.json) tmpVideo.json = {files: {}}
    tmpVideo.json.files[tech] = files
    Session.set('tmpVideo', tmpVideo)
}

Template.addvideo.helpers({
    addVideoStep: function () {
      return Session.get('addVideoStep')
    }
})

Template.addvideoform.helpers({
    existsFiles: function() {
        var tmpVideo = Session.get('tmpVideo')
        if (!tmpVideo.json || !tmpVideo.json.files) return false
        if (Object.keys(tmpVideo.json.files).length > 0) return true
        return false
    }
})

Template.addvideoformfile.events({
    'click #dropzone': function (event) {
        $('#fileToUpload').click()
    },
    'change #fileToUpload': function (event) {
        Template.addvideoformfile.inputVideo(event.target)
    },
    'dropped #dropzone': function (event) {
        Template.addvideoformfile.inputVideo(event.originalEvent.dataTransfer)
    }
})

Template.addvideoformfile.inputVideo = function(dt) {
    if (!dt.files || dt.files.length == 0) {
        toastr.error(translate('UPLOAD_ERROR_UPLOAD_FILE'), translate('ERROR_TITLE'))
        return
    }
    var file = dt.files[0]
    if (file.type.split('/')[0] != 'video') {
        toastr.error(translate('UPLOAD_ERROR_WRONG_FORMAT'), translate('ERROR_TITLE'))
        return
    }

    Session.set('addVideoStep', 'addvideoformfileuploading')

    // checking best ipfs-uploader endpoint available
    Template.upload.setBestUploadEndpoint(function () {
      // uploading to ipfs
      Template.upload.uploadVideo(file, '#progressvideo', function (err, result) {
        if (err) {
          console.log(err)
          toastr.error(err, translate('UPLOAD_ERROR_IPFS_UPLOADING'))
          return
        } else {
          console.log('Uploaded video', result);
        }
      })
    });
}

Template.addvideo.verifyHash = function(hash) {
    // ex1: QmVsb6fZNhe5JNgTnjriNcv7a8vPhvS9f27eu5U7UnLTPk
    // start Qm
    if (hash[0] !== 'Q' || hash[1] !== 'm') return false
    // 46 chars
    if (hash.length !== 46) return false
    // base58 (who cares?)
    return true
}

Template.addvideoform.events({
    'click #addvideonext': function () {
        var options = $('input[type=radio]')
        var checked = null
        for (let i = 0; i < options.length; i++)
            if (options[i].checked)
                checked = options[i].value
        if (checked)
            Session.set('addVideoStep', 'addvideoform'+checked)
        
    },
    'click #addvideoback': function() {
        Session.set('addVideoStep', 'addvideopublish')
    }
})

Template.addvideoformp2p.events({
    'click #addvideonext': function () {
        var options = $('input[type=radio]')
        var checked = null
        for (let i = 0; i < options.length; i++)
            if (options[i].checked)
                checked = options[i].value
        if (checked)
            Session.set('addVideoStep', 'addvideoformp2p'+checked)
        if (checked == 'btfs' || checked == 'ipfs')
            setTimeout(function() {
                $('#gwoinfo').popup({
                    inline: true,
                    content: translate('DEFAULT_GATEWAY_OVERWRITE_INFO')
                })
            }, 200)
    }
})

Template.addvideoformp2pbtfs.rendered = function() {
    var tmpVideo = Session.get('tmpVideo')
    if (!tmpVideo.json || !tmpVideo.json.files || !tmpVideo.json.files.btfs)
        return
    var files = tmpVideo.json.files.btfs
    if (files.vid && files.vid["src"])
        $('input[name="vid.src"]')[0].value = files.vid["src"]
    if (files.vid && files.vid["240"])
        $('input[name="vid.240"]')[0].value = files.vid["240"]
    if (files.vid && files.vid["480"])
        $('input[name="vid.480"]')[0].value = files.vid["480"]
    if (files.vid && files.vid["720"])
        $('input[name="vid.720"]')[0].value = files.vid["720"]
    if (files.vid && files.vid["1080"])
        $('input[name="vid.1080"]')[0].value = files.vid["1080"]
    if (files.img && files.img["spr"])
        $('input[name="img.spr"]')[0].value = files.img["spr"]
    if (files.gw)
        $('input[name="gw"]')[0].value = files.gw
}
Template.addvideoformp2pipfs.rendered = function() {
    var tmpVideo = Session.get('tmpVideo')
    if (!tmpVideo.json || !tmpVideo.json.files || !tmpVideo.json.files.ipfs)
        return
    var files = tmpVideo.json.files.ipfs
    if (files.vid && files.vid["src"])
        $('input[name="vid.src"]')[0].value = files.vid["src"]
    if (files.vid && files.vid["240"])
        $('input[name="vid.240"]')[0].value = files.vid["240"]
    if (files.vid && files.vid["480"])
        $('input[name="vid.480"]')[0].value = files.vid["480"]
    if (files.vid && files.vid["720"])
        $('input[name="vid.720"]')[0].value = files.vid["720"]
    if (files.vid && files.vid["1080"])
        $('input[name="vid.1080"]')[0].value = files.vid["1080"]
    if (files.img && files.img["spr"])
        $('input[name="img.spr"]')[0].value = files.img["spr"]
    if (files.gw)
        $('input[name="gw"]')[0].value = files.gw
}

Template.addvideoformp2pbtfs.events({
    'click #addvideofinish': function () {
        var files = Template.addvideohashes.fillHashes()
        if (files) {
            Template.addvideo.addFiles('btfs', files)
            Session.set('addVideoStep', 'addvideopublish')
        }
        
    }
})
Template.addvideoformp2pipfs.events({
    'click #addvideofinish': function () {
        var files = Template.addvideohashes.fillHashes()
        if (files) {
            Template.addvideo.addFiles('ipfs', files)
            Session.set('addVideoStep', 'addvideopublish')
        }
    }
})
Template.addvideoformfileuploaded.events({
    'click #addvideofinish': function () {
        var files = Template.addvideohashes.fillHashes()
        if (files) {
            Template.addvideo.addFiles('btfs', files)
            Session.set('addVideoStep', 'addvideopublish')
        }
    }
})

Template.addvideoformp2p.events({
    'click #addvideoback': function () {
        Session.set('addVideoStep', 'addvideoform')
    }
})
Template.addvideoformp2pbtfs.events({
    'click #addvideoback': function () {
        Session.set('addVideoStep', 'addvideoformp2p')
    }
})
Template.addvideoformp2pipfs.events({
    'click #addvideoback': function () {
        Session.set('addVideoStep', 'addvideoformp2p')
    }
})
Template.addvideoformp2ptorrent.events({
    'click #addvideoback': function () {
        Session.set('addVideoStep', 'addvideoformp2p')
    }
})

Template.addvideoform3p.events({
    'click #addvideoback': function () {
        Session.set('addVideoStep', 'addvideoform')
    }
})

Template.addvideoformfile.events({
    'click #addvideoback': function () {
        Session.set('addVideoStep', 'addvideoform')
    }
})

Template.addvideoform3p.events({
    'click #addvideonext': function() {
        Template.addvideoform3p.grabData($('#remotelink')[0].value, function(content) {
            Template.addvideo.addFiles('youtube', content.videoId)
            Template.addvideo.tmpVid({title: content.title})
            Template.addvideo.tmpVid({desc: content.description})
            Template.addvideo.tmpVid({dur: content.duration})
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
        getOEmbedData(url, function(content) {
          cb(content)
        })
      else if (urlInfo.pathname.split('/')[1] == 'videos')
        getOEmbedData(url, function(content) {
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