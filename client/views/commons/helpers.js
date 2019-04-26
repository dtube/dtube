import moment from 'moment-with-locales-es6'
moment.locale(navigator.language);
import xss from 'xss'
import Autolinker from 'dtube-autolinker'

// this contains all the global helpers frequently used in templates
// reuse them as much as possible
// they should always return cleanly and be fast
// as they rerun on each template rerender

Template.registerHelper('equals', function (one, two) {
  if (one == two) return true;
  return false;
});

Template.registerHelper('count', function (array) {
  if (!array) return 0;
  return array.length;
});

Template.registerHelper('isOnMobile', function () {
  if (/Mobi/.test(navigator.userAgent)) {
    return true;
  }
  return false;
});

Template.registerHelper('avalonOnboarding', function () {
  return Session.get('avalonOnboarding')
});

Template.registerHelper('session', function (key) {
  return Session.get(key)
});

Template.registerHelper('upvotes', function (active_votes) {
  if (!active_votes) return -1;
  var count = 0;
  for (var i = 0; i < active_votes.length; i++) {
    if (active_votes[i].percent > 0) count++
  }
  return count;
});

Template.registerHelper('downvotes', function (active_votes) {
  if (!active_votes) return -1;
  var count = 0;
  for (var i = 0; i < active_votes.length; i++) {
    if (active_votes[i].percent < 0) count++
  }
  return count;
});

Template.registerHelper('userPic', function (username, size) {
  if (!size || typeof size != 'string') size=''
  return 'https://avaimage.nannal.com/u/'+username+'/avatar/'+size
});

Template.registerHelper('userCover', function(coverurl) {
  return 'https://avaimage.nannal.com/2048x512/'+coverurl
})

Template.registerHelper('isReplying', function (content) {
  if (!Session.get('replyingTo')) return false
  if (!content) return false
  if (content.info) {
    if (Session.get('replyingTo').author == content.info.author && Session.get('replyingTo').permlink == content.info.permlink)
      return true
  } else {
    if (!content.author) return false
    if (Session.get('replyingTo').author == content.author && Session.get('replyingTo').permlink == content.permlink)
      return true
  }
  return false
});

Template.registerHelper('displayCurrency', function (string) {
  if (!string) return
  var amount = string.split(' ')[0]
  var currency = string.split(' ')[1]
  if (currency == 'SBD') return '$' + amount
  return amount;
})

function cuteNumber(num, digits) {
  if (typeof digits === 'undefined') digits = 2
  var units = ['K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y']
  var decimal
  var newNum = num

  for(var i=units.length-1; i>=0; i--) {
      decimal = Math.pow(1000, i+1)

      if(num <= -decimal || num >= decimal) {
          newNum = +(num / decimal).toFixed(digits) + units[i]
          break
      }
  }
  var limit = (newNum<0 ? 5 : 4)
  if (newNum.toString().length > limit && digits>0)
      return cuteNumber(num, digits-1)

  return newNum;
}

Template.registerHelper('displayPayout', function (ups, downs) {
  if (!ups && !downs) return 0
  return cuteNumber(ups - downs)
})

Template.registerHelper('displayMoney', function(amount) {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
})

Template.registerHelper('displayPayoutUpvote', function (share, rewards) {
  return (share * rewards).toFixed(3);
})

Template.registerHelper('displayVoters', function (votes, isDownvote) {
  if (!votes) return
  var newVotes = []
  for (let i = 0; i < votes.length; i++) {
    var updated = false
    for (let y = 0; y < newVotes.length; y++) {
      if (newVotes[y].u == votes[i].u) {
        updated = true
        if (votes[i].vt > 0 && !isDownvote)
          newVotes[y].vt = newVotes[y].vt + votes[i].vt
        if (votes[i].vt < 0 && isDownvote)
          newVotes[y].vt = newVotes[y].vt + votes[i].vt
        
        break
      }
    }
    if (!updated) {
      if ((votes[i].vt > 0 && !isDownvote) || (votes[i].vt < 0 && isDownvote))
        newVotes.push({u: votes[i].u, vt: votes[i].vt, ts: votes[i].ts})
    }
  }
  newVotes.sort(function (a, b) {
    return b.vt - a.vt
  })
  if (isDownvote) newVotes.reverse()

  var vtTotal = 0;
  for (let i = 0; i < newVotes.length; i++)
    vtTotal += newVotes[i].vt

  var top20 = []
  for (let i = 0; i < 20; i++) {
    if (i == newVotes.length) break
    if (newVotes[i].vt <= 0 && !isDownvote) break;
    if (newVotes[i].vt >= 0 && isDownvote) break;
    top20.push(newVotes[i])
  }
  return top20
})

Template.registerHelper('topVoters', function (votes, x) {
  if (!votes || votes.length == 0) return []
  var votes = JSON.parse(JSON.stringify(votes))
  votes.sort(function (a, b) {
    return Math.abs(b.vt) - Math.abs(a.vt)
  })

  var top = []
  for (let i = 0; i < votes.length; i++) {
    if (top.length > x) {
      top[x].vt += votes[i].vt
      top[x].u = 'Everyone else'
      top[x].isGroup = true
      top[x].zindex = 0
    } else {
      votes[i].zindex = x-top.length
      top.push(votes[i])
    }
  }
  console.log(top)
  return top
})

Template.registerHelper('timeAgoReal', function (timestamp) {
  return moment(timestamp).fromNow()
})

Template.registerHelper('timeAgoTimestamp', function (timestamp) {
  return moment(timestamp*1000).fromNow()
})

Template.registerHelper('timeAgo', function (ts) {
  var date = new Date(ts)
  return moment(date).fromNow()
})

Template.registerHelper('timeDisplay', function (ts) {
  var date = new Date(parseInt(ts))
  return moment(date).format("ll")
})

Template.registerHelper('durationDisplay', function (seconds) {
  seconds = parseFloat(seconds)
  if (seconds > 3600) {
    return moment('2000-01-01 00:00:00').add(moment.duration(seconds * 1000)).format('HH:mm:ss')
  }
  else {
    return moment('2000-01-01 00:00:00').add(moment.duration(seconds * 1000)).format('mm:ss')
  }
})

Template.registerHelper('hasUpvoted', function (video) {
  if (!video || !video.votes) return
  for (var i = 0; i < video.votes.length; i++) {
    if (video.votes[i].u == Session.get('activeUsername')
      && video.votes[i].vt > 0)
      return true
  }
  return false
})

Template.registerHelper('hasDownvoted', function (video) {
  if (!video || !video.votes) return
  for (var i = 0; i < video.votes.length; i++) {
    if (video.votes[i].u == Session.get('activeUsername')
      && video.votes[i].vt < 0)
      return true
  }
  return false
})

Template.registerHelper('uniques', function (votes, type) {
  var counter = 0
  for (let i = 0; i < votes.length; i++) {
    if (votes[i].vt>0 && type == 'up')
      counter++
    if (votes[i].vt<0 && type == 'down')
      counter++
  }
  return counter
})

Template.registerHelper('lengthOf', function (array) {
  if (!array) return
  return array.length
})

Template.registerHelper('isPlural', function (array) {
  if (!array) return
  if (array.length == 1) return false
  return true
})

Template.registerHelper('isVideoHidden', function (video) {
  if (video.net_rshares && video.net_rshares < 0) return true
  if (Session.get('nsfwSetting') == 'Show') return false
  if (!video || !video.content || !video.content.tags) return false
  if (video.content.tags.indexOf('nsfw') > -1) return true
  return false
})

Template.registerHelper('isVideoHiddensearch', function (video) {
  if (!video) return false
  if (video.net_rshares && video.net_rshares < 0) return true
  if (Session.get('nsfwSetting') == 'Show') return false
  if (video.content) {
    if (video.content.tags.indexOf('nsfw') > -1) return true
  }
  if (video.tags) {
    if (video.tags.indexOf('nsfw') > -1) return true
  }
  return false
})

Template.registerHelper('syntaxed', function (text) {
  if (!text) return
  // escape the string for security
  text = xss(text, {
    whiteList: [],
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script']
  })

  // replace line breaks to html
  text = text.replace(/(?:\r\n|\r|\n)/g, '<br />');

  // time travelling stuff
  var re = /(?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d)/g
  text.replace(re, function (match, p1, p2, p3) {
    var seconds = parseInt(p3) + 60 * parseInt(p2)
    if (p1) seconds += 3600 * parseInt(p1)
    if (p1) text = text.replace(match, '<a class="seekTo" onclick=\'Template.video.seekTo(' + seconds + ')\'>' + p1 + ':' + p2 + ':' + p3 + '</a>')
    else {
      if (!p2) return
      text = text.replace(match, '<a class="seekTo" onclick=\'Template.video.seekTo(' + seconds + ')\'>' + p2 + ':' + p3 + '</a>')
    }
  })

  // use autolinker for links and mentions
  text = Autolinker.link(text, {
    urls: {
      schemeMatches: true,
      wwwMatches: true,
      tldMatches: true
    },
    email: false,
    phone: false,
    mention: 'dtube',
    hashtag: 'dtube',
    stripPrefix: false,
    stripTrailingSlash: false,
    newWindow: true,
    className: ''
  })

  return text
})

Template.registerHelper('humanFilesize', function (bits, si) {
  var thresh = si ? 1000 : 1024;
  if (Math.abs(bits) < thresh) {
    return bits + ' B';
  }
  var units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  var u = -1;
  do {
    bits /= thresh;
    ++u;
  } while (Math.abs(bits) >= thresh && u < units.length - 1);
  return bits.toFixed(1) + ' ' + units[u];
})

Template.registerHelper('ipfsSrc', function (ipfsHash) {
  if (!ipfsHash) return ''
  if (Session.get('ipfsGateway') == 'automatic') {
    var n = Session.get('remoteSettings').displayNodes.length - 1
    var i = ipfsHash.charCodeAt(ipfsHash.length - 1) % n
    return Session.get('remoteSettings').displayNodes[i] + '/ipfs/' + ipfsHash
  } else {
    return Session.get('ipfsGateway') + '/ipfs/' + ipfsHash
  }
})

Template.registerHelper('isSubscribedTo', function (following) {
  var sub = Subs.findOne({ follower: Session.get('activeUsername'), following: following })
  if (sub) return true
  return false;
})

Template.registerHelper('isResteemed', function (array) {
  if (array && array.length && array.length > 0) return true
  return false
})

Template.registerHelper('getEmbedCode', function (author, permlink) {
  var code = '<iframe width="560" height="315" src="https://emb.d.tube/#!/@@@author@@@/@@@permlink@@@" frameborder="0" allowfullscreen></iframe>'
  code = code.replace('@@@author@@@', author)
  code = code.replace('@@@permlink@@@', permlink)
  return code
})

Template.registerHelper('getSteemGProp', function () {
  // if (!Session.get('steemGlobalProp'))
  //   steem.api.getDynamicGlobalProperties(function (err, result) {
  //     if (result)
  //       Session.set('steemGlobalProp', result)
  //   })
})

Template.registerHelper('getPercent', function (string) {
  return parseInt(string)
})

Template.registerHelper('displayShortDescription', function (string) {
  return string.substring(0, 130)
})

Template.registerHelper('displayReputation', function (string) {
  return 0
})

Template.registerHelper('displayDate', function (date) {
  return moment(date).format('MMMM Do YYYY');
})

Template.registerHelper('displayDateFull', function (date) {
  return moment(date).format('MMMM Do YYYY, h:mm:ss a');
})

Template.registerHelper('displayVotingPower', function (user) {
  return cuteNumber(avalon.votingPower(user))
})

Template.registerHelper('displayBandwidth', function (user) {
  return cuteNumber(avalon.bandwidth(user))
})

Template.registerHelper('displaySteemPower', function (vesting_shares) {
  // if (vesting_shares) {
  //   var SP = Market.vestToSteemPower(vesting_shares.split(' ')[0])
  //   return `${SP.toFixed(3)} SP`
  // }
  return 0
})

Template.registerHelper('displaySavings', function (savings_balance, savings_sbd_balance) {
  return 0;
  if (!savings_balance || !savings_sbd_balance) return
  else {
    var savings_balance = parseFloat(savings_balance.split(' ')[0]);
    var savings_sbd_balance = parseFloat(savings_sbd_balance.split(' ')[0]);
    var amount = savings_balance * Session.get('steemprice') + savings_sbd_balance ** Session.get('steemdollarsprice')
    if (isNaN(amount)) return 0 + ' $'
    else return (amount + ' $')
  }
})

Template.registerHelper('arrayify',function(obj){
  var result = [];
  for (var key in obj) result.push({key:key,value:obj[key]});
  return result;
});

Template.registerHelper('inputTags',function (tags) {
  if (!tags) return ''
  var ok = []
  for (var i = 0; i < tags.length; i++) {
    if (tags[i].startsWith(Meteor.settings.public.beneficiary))
      continue;
    ok.push(tags[i])
  }
  return ok.join(',')
});

Template.registerHelper('activeUsername', function() {
  return Session.get('activeUsername')
})

Template.registerHelper('subCount', function() {
  var user = ChainUsers.findOne({ name: FlowRouter.getParam("author") })
  if (user)
    return user.followersCount
  else
    return 0
})