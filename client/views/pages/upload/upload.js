var cheerio = require('cheerio')
var parse = require('url-parse')
refreshUploadStatus = null

Template.upload.rendered = function () {
  Session.set('uploadToken', null)
  Session.set('uploadVideoProgress', null)
  Session.set('tempSubtitles', [])
  Session.set('searchedLink', null)
  Session.set('publishBurn', 0)
  $('.ui.sticky')
    .sticky({
      context: '#videouploadsteps'
    });
}

Template.upload.createPermlink = function (length) {
  var text = "";
  var possible = "abcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j]; 1
    array[j] = temp;
  }
}

Template.upload.helpers({
  tempContent: function () {
    return Session.get('tempContent')
  },
  searchedLink: function () {
    return Session.get('searchedLink')
  },
  publishBurn: function () {
    return Session.get('publishBurn')
  }
})

Template.upload.events({
  'submit .form': function (event) {
    event.preventDefault()
  },
  'keyup #remotelink': function(event) {
    var url = $('#remotelink').val()
    if (url == Session.get('searchedLink')) return
    Session.set('tempContent', null)
    Session.set('searchedLink', url)
    grabData(url, function(content) {
      console.log(content)
      Session.set('tempContent', content)
      var balance = Users.findOne({username: Session.get('activeUsername')}).balance
      var step = Math.pow(10, balance.toString().length - 1)/100
      if (step<1) step = 1
      $('#burn-range').range({
        min: 0,
        max: 100,
        start: Session.get('publishBurn'),
        onChange: function(val) { 
          Session.set('publishBurn', logSlider(parseInt(val), balance))
        }
      });
    })
  },
  'click .uploadsubmit': function(event) {
    var content = Session.get('tempContent')
    content.title = $('#contentTitle').val()
    content.description = $('#contentDescription').val()
    var burn = parseInt(Session.get('publishBurn'))
    if (burn > 0) {
      broadcast.promotedComment(null, null, content, null, burn, function(err, result) {
        if (err) toastr.error(Meteor.blockchainError(err))
        else FlowRouter.go('/v/' + Session.get('activeUsername') + "/" + Session.get('tempContent').videoId)
      })
    } else {
      broadcast.comment(null, null, content, null, function(err, result) {
        if (err) toastr.error(Meteor.blockchainError(err))
        else FlowRouter.go('/v/' + Session.get('activeUsername') + "/" + Session.get('tempContent').videoId)
      })
    }
  },
})

function grabData(url, cb) {
  var urlInfo = parse(url, true)
  switch (urlInfo.host) {
    case 'www.youtube.com':
      getYoutubeVideoData(url, function(content) {
        cb(content)
      })
      break;

    case 'www.instagram.com':
    case 'www.dailymotion.com':
    case 'clips.twitch.tv':
    case 'www.twitch.tv':
    case 'vimeo.com':
      getOEmbedData(url, function(content) {
        cb(content)
      })
      break;
  
    default:
      getOpenGraphData(url, function(content) {
        cb(content)
      })
      break;
  }
}

function getOpenGraphData(url, callback) {
  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
      let video = JSON.parse(this.responseText).data;
      callback(sanitizeVideo(video, url));
    }
  }
  xhr.open("GET", 'https://bran.nannal.com/opengraph/'+encodeURIComponent(url));
  //xhr.setRequestHeader("User-Agent", "Mozilla/5.0 (X11; Linux x86_64; rv:42.0) Gecko/20100101 Firefox/42.0")
  xhr.send();
}

function getOEmbedData(url, callback) {
  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
      let video = JSON.parse(this.responseText);
      callback(sanitizeVideo(video, url));
    }
  }
  xhr.open("GET", 'https://bran.nannal.com/oembed/'+encodeURIComponent(url));
  //xhr.setRequestHeader("User-Agent", "Mozilla/5.0 (X11; Linux x86_64; rv:42.0) Gecko/20100101 Firefox/42.0")
  xhr.send();
}

function getYoutubeVideoData(url, callback) {
  var videoId = url.split('v=')[1]
  var ampersandPosition = videoId.indexOf('&')
  if(ampersandPosition != -1)
    videoId = videoId.substring(0, ampersandPosition);

  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
      let video = JSON.parse(this.responseText);
      callback(sanitizeVideo(video, url));
    }
  }
  xhr.open("GET", 'https://bran.nannal.com/youtube/'+videoId);
  //xhr.setRequestHeader("User-Agent", "Mozilla/5.0 (X11; Linux x86_64; rv:42.0) Gecko/20100101 Firefox/42.0")
  xhr.send();
}

function parseVideoInfo (body, videoId) {
  function extractValue ($, attribute) {
    if ($ && $.length) {
      return $.attr(attribute) || undefined
    }
    return undefined
  }
  
  function parseDuration (raw) {
    var m = /^[a-z]*(?:(\d+)M)?(\d+)S$/i.exec(raw)
    if (!m) return
  
    var minutes = m[1] ? parseInt(m[1], 10) : 0
    var seconds = m[2] ? parseInt(m[2], 10) : 0
    return minutes * 60 + seconds
  }
  
  function parseVotes (raw) {
    var rawCleaned = raw.split(',').join('')
    return parseInt(rawCleaned, 10)
  }

  var $ = cheerio.load(body)

  var url = extractValue($('.watch-main-col link[itemprop="url"]'), 'href')
  var title = extractValue(
    $('.watch-main-col meta[itemprop="name"]'),
    'content'
  )
  var descriptionHtml = $('.watch-main-col #eow-description').html()
  descriptionHtml = descriptionHtml.replace(/\<br\\?>/g, "\n")
  var description = jQuery("<div>"+descriptionHtml+"</div>").text();
  var owner = $('.yt-user-info > a').text()
  var channelId = extractValue(
    $('.watch-main-col meta[itemprop="channelId"]'),
    'content'
  )
  var thumbnailUrl = extractValue(
    $('.watch-main-col link[itemprop="thumbnailUrl"]'),
    'href'
  )
  var embedURL = extractValue(
    $('.watch-main-col link[itemprop="embedURL"]'),
    'href'
  )
  var datePublished = extractValue(
    $('.watch-main-col meta[itemprop="datePublished"]'),
    'content'
  )
  var genre = extractValue(
    $('.watch-main-col meta[itemprop="genre"]'),
    'content'
  )

  var paid = extractValue(
    $('.watch-main-col meta[itemprop="paid"]'),
    'content'
  )
  paid = paid ? paid === 'True' : undefined

  var unlisted = extractValue(
    $('.watch-main-col meta[itemprop="unlisted"]'),
    'content'
  )
  unlisted = unlisted ? unlisted === 'True' : undefined

  var isFamilyFriendly = extractValue(
    $('.watch-main-col meta[itemprop="isFamilyFriendly"]'),
    'content'
  )
  isFamilyFriendly = isFamilyFriendly && isFamilyFriendly === 'True'

  var duration = extractValue(
    $('.watch-main-col meta[itemprop="duration"]'),
    'content'
  )
  duration = duration ? parseDuration(duration) : undefined

  var regionsAllowed = extractValue(
    $('.watch-main-col meta[itemprop="regionsAllowed"]'),
    'content'
  )
  regionsAllowed = regionsAllowed ? regionsAllowed.split(',') : undefined

  var views = extractValue(
    $('.watch-main-col meta[itemprop="interactionCount"]'),
    'content'
  )
  views = views ? parseInt(views, 10) : undefined

  var dislikeCount = $(
    '.like-button-renderer-dislike-button-unclicked span'
  ).text()
  dislikeCount = dislikeCount ? parseVotes(dislikeCount) : undefined

  var likeCount = $('.like-button-renderer-like-button-unclicked span').text()
  likeCount = likeCount ? parseVotes(likeCount) : undefined

  var channelThumbnailUrl =  $('.yt-user-photo .yt-thumb-clip img').data('thumb')

  return {
    videoId: videoId,
    url: url,
    title: title,
    description: description,
    owner: owner,
    channelId: channelId,
    thumbnailUrl: thumbnailUrl,
    // embedURL: embedURL,
    datePublished: datePublished,
    genre: genre,
    // paid: paid,
    // unlisted: unlisted,
    isFamilyFriendly: isFamilyFriendly,
    duration: duration,
    // views: views,
    regionsAllowed: regionsAllowed,
    // dislikeCount: dislikeCount,
    // likeCount: likeCount,
    channelThumbnailUrl: channelThumbnailUrl
  }
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

function videoIdFromUrl(video, url) {
  var urlInfo = parse(url, true)
  switch (urlInfo.host) {
    case "www.twitch.tv":
      if (video.twitch_type == 'clip')
        return urlInfo.pathname.replace('/twitch/clip/', '')
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
      console.log(urlInfo)
      return urlInfo.query.v || urlInfo.pathname.split('/')[3]
      break;

    case "www.liveleak.com":
      return urlInfo.query.t
      break;
  
    default:
      break;
  }
  console.log(urlInfo)
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
      return 'YouTube'
      break;
  
    default:
      return 'Unknown Provider'
      break;
  }
}

function logSlider(position, maxburn) {
  if (position == 0) return 0
  // position will be between 1 and 100
  var minp = 0;
  var maxp = 100;

  // The result should be between 1 and maxburn
  var minv = Math.log(1);
  var maxv = Math.log(maxburn);

  // calculate adjustment factor
  var scale = (maxv-minv) / (maxp-minp);

  return Math.round(Math.exp(minv + scale*(position-minp)))
}