var cheerio = require('cheerio')
refreshUploadStatus = null

Template.upload.rendered = function () {
  Session.set('uploadToken', null)
  Session.set('uploadVideoProgress', null)
  Session.set('tempSubtitles', [])
  Session.set('searchedLink', null)
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
  }
})

Template.upload.events({
  'submit .form': function (event) {
    event.preventDefault()
  },
  'keyup #youtubelink': function(event) {
    var url = $('#youtubelink').val()
    if (url == Session.get('searchedLink')) return
    Session.set('tempContent', null)
    Session.set('searchedLink', url)
    getYoutubeVideoData(url, function(content) {
      content.app = 'deadtube'
      console.log(content)
      Session.set('tempContent', content)
    })

  },
  'click .uploadsubmit': function(event) {
    broadcast.comment(null, null, Session.get('tempContent'), function(err, result) {
      console.log(result)
    })
  },
})

function getYoutubeVideoData(url, callback) {
  var videoId = url.split('v=')[1]
  var ampersandPosition = videoId.indexOf('&')
  if(ampersandPosition != -1)
    videoId = videoId.substring(0, ampersandPosition);

  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
      let video = JSON.parse(this.responseText);
      callback(sanitizeVideo(video));
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

function sanitizeVideo(video) {
  return {
    videoId: video.videoId,
    url: video.url,
    title: video.title,
    description: video.description,
    owner: video.owner,
    channelId: video.channelId,
    thumbnailUrl: video.thumbnailUrl,
    // embedURL: embedURL,
    datePublished: video.datePublished,
    genre: video.genre,
    // paid: paid,
    // unlisted: unlisted,
    isFamilyFriendly: video.isFamilyFriendly,
    duration: video.duration,
    // views: views,
    // regionsAllowed: video.regionsAllowed,
    // dislikeCount: dislikeCount,
    // likeCount: likeCount,
    channelThumbnailUrl: video.channelThumbnailUrl
  }
}