import moment from 'moment-with-locales-es6'
import xss from 'xss'
import Autolinker from 'autolinker'

moment.locale(navigator.language);

var autolinkerOptions = {
  urls: {
    schemeMatches: true,
    wwwMatches: true,
    tldMatches: true
  },
  email: false,
  phone: false,
  mention: 'twitter',
  hashtag: false,
  stripPrefix: true,
  stripTrailingSlash: true,
  newWindow: true,
  truncate: {
    length: 0,
    location: 'end'
  },
  className: ''
}

Template.registerHelper('equals', function (one, two) {
  if (one == two) return true;
  return false;
});

Template.registerHelper('count', function (array) {
  if (!array) return 0;
  return array.length;
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

Template.registerHelper('userPic', function (username) {
  return 'https://img.busy.org/@' + username + '?width=96&height=96'
});

Template.registerHelper('subCount', function (username) {
  var count = SubCounts.findOne({ account: username })
  if (!count) return '<i class="loading spinner icon"></i>';
  return count.follower_count
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

Template.registerHelper('displayPayout', function (active, total, curator) {
  if (active && !total || !curator) return active
  if (!active || !total || !curator) return
  var payout = active
  if (total.split(' ')[0] > 0) {
    var amount = parseInt(total.split(' ')[0].replace('.', '')) + parseInt(curator.split(' ')[0].replace('.', ''))
    amount /= 1000
    payout = amount + ' SBD'
  }
  if (!payout) return
  var amount = payout.split(' ')[0]
  var currency = payout.split(' ')[1]
  amount = parseFloat(amount).toFixed(3)
  return amount;
})

Template.registerHelper('displayPayoutUpvote', function (share, rewards) {
  return (share*rewards).toFixed(3);
})

  Template.registerHelper('displayVoters', function(votes, isDownvote) {
    if (!votes) return
    votes.sort(function(a,b) {
      var rsa = parseInt(a.rshares)
      var rsb = parseInt(b.rshares)
      return rsb-rsa
    })
    if (isDownvote) votes.reverse()

    var rsharesTotal = 0;
    for (let i = 0; i < votes.length; i++)
      rsharesTotal += parseInt(votes[i].rshares)

    var top20 = []
    for (let i = 0; i < 20; i++) {
      if (i == votes.length) break
      votes[i].rsharespercent = parseInt(votes[i].rshares)/rsharesTotal
      if (parseInt(votes[i].rshares) <= 0 && !isDownvote) break;
      if (parseInt(votes[i].rshares) >= 0 && isDownvote) break;
      top20.push(votes[i])
    }
    return top20
  })

  Template.registerHelper('timeAgo', function (created) {
    if (!created) return
    return moment(created + 'Z').fromNow()
  })

  Template.registerHelper('timeDisplay', function (created) {
    if (!created) return
    return moment(created).format("ll")
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
    if (!video || !video.active_votes) return
    for (var i = 0; i < video.active_votes.length; i++) {
      if (video.active_votes[i].voter == Session.get('activeUsername')
        && parseInt(video.active_votes[i].percent) > 0)
        return true
    }
    return false
  })

  Template.registerHelper('hasDownvoted', function (video) {
    if (!video || !video.active_votes) return
    for (var i = 0; i < video.active_votes.length; i++) {
      if (video.active_votes[i].voter == Session.get('activeUsername')
        && parseInt(video.active_votes[i].percent) < 0)
        return true
    }
    return false
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
    if (video.net_rshares && video.net_rshares < 0) return true
    if (Session.get('nsfwSetting') == 'Show') return false
    if (!video || !video.tags) return false
    if (video.tags.indexOf('nsfw') > -1) return true
    return false
  })

  // Template.registerHelper('isNSFWFullyHidden', function (video) {
  //   if (Session.get('nsfwSetting') != 'Fully Hidden') return false
  //   if (!video || !video.content || !video.content.tags) return false
  //   if (video.content.tags.indexOf('nsfw') > -1) return true
  //   return false
  // })

  // Template.registerHelper('isNSFWFullyHiddensearch', function (video) {
  //   if (Session.get('nsfwSetting') != 'Fully Hidden') return false
  //   if (!video || !video.tags) return false
  //   if (video.tags.indexOf('nsfw') > -1) return true
  //   return false
  // })

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
      if (p1) text = text.replace(match, '<a href=\'#\' onclick=\'Template.video.setTime(' + seconds + ')\'>' + p1 + ':' + p2 + ':' + p3 + '</a>')
      else {
        if (!p2) return
        text = text.replace(match, '<a href=\'#\' onclick=\'Template.video.setTime(' + seconds + ')\'>' + p2 + ':' + p3 + '</a>')
      }
    })

    // use autolinker for links and mentions
    text = Autolinker.link(text, autolinkerOptions)

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
    return Meteor.getIpfsSrc(ipfsHash)
  })

  Meteor.getIpfsSrc = function (ipfsHash) {
    if (Session.get('ipfsGateway') == 'automatic') {
      var n = Session.get('remoteSettings').displayNodes.length - 1
      var i = ipfsHash.charCodeAt(ipfsHash.length - 1) % n
      return Session.get('remoteSettings').displayNodes[i] + '/ipfs/' + ipfsHash
    } else {
      return Session.get('ipfsGateway') + '/ipfs/' + ipfsHash
    }
  }

  Meteor.ipfsGatewayFor = function (ipfsHash) {
    var n = Session.get('remoteSettings').displayNodes.length - 1
    var i = ipfsHash.charCodeAt(ipfsHash.length - 1) % n
    return Session.get('remoteSettings').displayNodes[i].split('://')[1]
  }

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

  Template.registerHelper('getPercent', function (string) {
    return parseInt(string)
  })

  Template.registerHelper('displayReputation', function(string){
    return steem.formatter.reputation(string);
  })

  Template.registerHelper('displayAmount', function(string){
    return steem.formatter.amount(string);
  })

  Template.registerHelper('displayAccountValue', function(string){
    return steem.formatter.estimateAccountValue(string);
  })

  Template.registerHelper('displayVestingSteem', function(string){
    return steem.formatter.vestingSteem(string);
  })

  Template.registerHelper('displayVestToSteem', function(string){
    return steem.formatter.vestToSteem(string);
  })

  Template.registerHelper('displayDate', function (date) {
    return moment(date).format('MMMM Do YYYY');
  })

  Template.registerHelper('displayDateFull', function (date) {
    return moment(date).format('MMMM Do YYYY, h:mm:ss a');
  })

  Template.registerHelper('displayVotingPower', function (votingPower, lastVoteTime, precision) {
    var secondsPassedSinceLastVote = (new Date - new Date(lastVoteTime + "Z")) / 1000;
    votingPower += (10000 * secondsPassedSinceLastVote / 432000);
    return Math.min(votingPower / 100, 100).toFixed(precision)
  })


  Template.registerHelper('displayTotalAccountValue', function(account) {
    if (!account) return
    else {

        var total_steem = account.balance + account.savings_balance + account.reward_vesting_steem + account.reward_steem_balance + account.vesting_shares;
        var total_sbd = account.sbd_balance + account.sbd_balance_savings + account.savings_sbd_pending 
        console.log(total_steem)
        console.log(total_sbd)
      }
    })

  Template.registerHelper('displayFinalPayout', function (active, total, curator) {
    if (active && !total || !curator) return active
    if (!active || !total || !curator) return
    var payout = active
    if (total.split(' ')[0] > 0) {
      var amount = parseInt(total.split(' ')[0].replace('.', '')) + parseInt(curator.split(' ')[0].replace('.', ''))
      amount /= 1000
      payout = amount + ' SBD'
    }
    if (!payout) return
    var amount = payout.split(' ')[0]
    var currency = payout.split(' ')[1]
    amount = ((amount/2)*Session.get('steemprice')) + ((amount/2)*Session.get('steemdollarsprice'))
    return (amount.toFixed(2));
  })


  Template.registerHelper('getCoinMarketSBDPrice', function (votingPower, lastVoteTime, precision) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://api.coinmarketcap.com/v1/ticker/' + "steem-dollars" + '/', true);
    xhr.send();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                var ticker = JSON.parse(xhr.responseText)[0],
                    html = '';
                    Session.set('steemdollarsprice',(/\${PRICE_USD}/g, parseFloat(ticker.price_usd).toFixed(2)))
            } else {
              console.log("Error: API not responding!");
            }
        }
    }
  })
  

  Template.registerHelper('getCoinMarketSteemPrice', function (votingPower, lastVoteTime, precision) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://api.coinmarketcap.com/v1/ticker/' + "steem" + '/', true);
    xhr.send();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                var ticker = JSON.parse(xhr.responseText)[0],
                    html = '';
                    Session.set('steemprice',(/\${PRICE_USD}/g, parseFloat(ticker.price_usd).toFixed(2)))
            } else {
              console.log("Error: API not responding!");
            }
        }
    }
  })
  
