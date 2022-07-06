import moment from 'moment-with-locales-es6'
moment.locale(navigator.language);
import xss from 'xss'
import Autolinker from 'dtube-autolinker'

// this contains all the global helpers frequently used in templates
// reuse them as much as possible
// they should always return cleanly and be fast
// as they rerun on each template rerender

Template.registerHelper('equals', function(one, two) {
    if (one == two) return true;
    return false;
});


Template.registerHelper('or', function(one, two) {
    if (one || two) return true;
    return false;
});

Template.registerHelper('or3', function(one, two, three) {
  if (one || two || three) return true;
  return false;
});

Template.registerHelper('and', function(one,two) {
    return one && two
})

Template.registerHelper('not', function(itm) {
    return !itm
})

Template.registerHelper('count', function(array) {
    if (!array) return 0;
    return array.length;
});

Template.registerHelper('pipe', function(one, two) {
    return one || two
});

Template.registerHelper('isOnMobile', function() {
    if (/Mobi/.test(navigator.userAgent)) {
        return true;
    }
    return false;
});

Template.registerHelper('isOnIDevice', function() {
    var iDevices = [
        'iPad Simulator',
        'iPhone Simulator',
        'iPod Simulator',
        'iPad',
        'iPhone',
        'iPod'
    ];

    if (!!navigator.platform) {
        while (iDevices.length) {
            if (navigator.platform === iDevices.pop()) { return true; }
        }
    }

    return false;
});

Template.registerHelper('isTabletOrLower', function() {
    if (window.innerWidth < 1180) {
        return true;
    }
    return false;
});

Template.registerHelper('session', function(key) {
    return Session.get(key)
});

Template.registerHelper('upvotes', function(active_votes) {
    if (!active_votes) return -1;
    var count = 0;
    for (var i = 0; i < active_votes.length; i++) {
        if (active_votes[i].percent > 0) count++
    }
    return count;
});

Template.registerHelper('downvotes', function(active_votes) {
    if (!active_votes) return -1;
    var count = 0;
    for (var i = 0; i < active_votes.length; i++) {
        if (active_votes[i].percent < 0) count++
    }
    return count;
});

Template.registerHelper('mergeComments', function(dtc, steem, hive, blurt) {
    function mergeTree(dtc, steem, hive, blurt) {
        if (!steem && !dtc && !hive && !blurt) return []
        if (!steem && !hive && !blurt) return dtc
        if (!dtc && !hive && !blurt) return steem
        if (!dtc && !steem && !blurt) return hive
        if (!dtc && !steem && !hive) return blurt
        var length = dtc.length
        if (steem && steem.length > length) length = steem.length
        if (hive && hive.length > length) length = hive.length
        if (blurt && blurt.length > length) length = blurt.length
            // console.log('comment length',length)
        var tree = []
        for (let i = 0; i < length; i++) {
            if (dtc && dtc[i]) {
                if (tree.length == 0) {
                    tree.push(JSON.parse(JSON.stringify(dtc[i])))
                } else {
                    var exists = false
                    for (let y = 0; y < tree.length; y++) {
                        if (tree[y].json.refs && tree[y].json.refs.indexOf(dtc[i]._id) > -1) {
                            exists = true
                            tree[y].comments = mergeTree(tree[y].comments, dtc[i].comments)
                            tree[y].dist = dtc[i].dist
                            tree[y].votes = dtc[i].votes
                            tree[y].ups += dtc[i].votes
                            tree[y].downs += dtc[i].votes
                        }
                    }
                    if (!exists) tree.push(JSON.parse(JSON.stringify(dtc[i])))
                }
            }
            if (steem && steem[i]) {
                if (tree.length == 0) {
                    tree.push(JSON.parse(JSON.stringify(steem[i])))
                } else {
                    var exists = false
                    for (let y = 0; y < tree.length; y++) {
                        if (tree[y].json.refs && tree[y].json.refs.indexOf(steem[i]._id) > -1) {
                            exists = true
                            tree[y].comments = mergeTree(tree[y].comments, steem[i].comments)
                            tree[y].distSteem = steem[i].distSteem
                            tree[y].votesSteem = steem[i].votesSteem
                            tree[y].ups += steem[i].votes
                            tree[y].downs += steem[i].votes
                        }
                    }
                    if (!exists) tree.push(JSON.parse(JSON.stringify(steem[i])))
                }
            }
            if (hive && hive[i]) {
                if (tree.length == 0) {
                    tree.push(JSON.parse(JSON.stringify(hive[i])))
                } else {
                    var exists = false
                    for (let y = 0; y < tree.length; y++) {
                        if (tree[y].json.refs && tree[y].json.refs.indexOf(hive[i]._id) > -1) {
                            exists = true
                            tree[y].comments = mergeTree(tree[y].comments, hive[i].comments)
                            tree[y].distSteem = hive[i].distSteem
                            tree[y].votesSteem = hive[i].votesSteem
                            tree[y].ups += hive[i].votes
                            tree[y].downs += hive[i].votes
                        }
                    }
                    if (!exists) tree.push(JSON.parse(JSON.stringify(hive[i])))
                }
            }
            if (blurt && blurt[i]) {
              if (tree.length == 0) {
                  tree.push(JSON.parse(JSON.stringify(blurt[i])))
              } else {
                  var exists = false
                  for (let y = 0; y < tree.length; y++) {
                      if (tree[y].json.refs && tree[y].json.refs.indexOf(blurt[i]._id) > -1) {
                          exists = true
                          tree[y].comments = mergeTree(tree[y].comments, blurt[i].comments)
                          tree[y].distSteem = blurt[i].distSteem
                          tree[y].votesSteem = blurt[i].votesSteem
                          tree[y].ups += blurt[i].votes
                          tree[y].downs += blurt[i].votes
                      }
                  }
                  if (!exists) tree.push(JSON.parse(JSON.stringify(blurt[i])))
              }
          }
        }
        return tree
    }
    return mergeTree(dtc, steem, hive, blurt)
})

Template.registerHelper('userPic', function(username, size) {
    if (!size || typeof size != 'string') size = ''
    return javalon.config.api + '/image/avatar/' + username + '/' + size
});

Template.registerHelper('userPicSteem', function(username, size) {
    if (!size || typeof size != 'string') size = ''
    return 'https://steemitimages.com/u/' + username + '/avatar/' + size
});

Template.registerHelper('userPicHive', (username, size) => {
    if (!size || typeof size != 'string') size = ''
    return 'https://images.hive.blog/u/' + username + '/avatar/' + size
})

Template.registerHelper('userPicBlurt', (username, size) => {
  if (!size || typeof size != 'string') size = ''
  return 'https://imgp.blurt.world/profileimage/' + username + '/' + size
})

Template.registerHelper('userCover', function(username) {
    return javalon.config.api + '/image/cover/' + username
})

Template.registerHelper('isReplying', function(content) {
    if (!Session.get('replyingTo')) return false
    if (!content) return false
    if (!content.author) return false
    if (Session.get('replyingTo').id == content._id)
        return true
    return false
});

Template.registerHelper('isReplyingRoot', function() {
    if (!Session.get('replyingTo')) return true
    return false
});

Template.registerHelper('displayCurrency', function(string) {
    if (!string) return
    var amount = string.split(' ')[0]
    var currency = string.split(' ')[1]
    if (currency == 'SBD') return '$' + amount
    return amount;
})

function cuteNumber(num, digits) {
    if (num > 1) num = Math.round(num)
    if (typeof digits === 'undefined') digits = 2
    var units = ['K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y']
    var decimal
    var newNum = num

    for (var i = units.length - 1; i >= 0; i--) {
        decimal = Math.pow(1000, i + 1)

        if (num <= -decimal || num >= decimal) {
            newNum = +(num / decimal).toFixed(digits) + units[i]
            break
        }
    }
    var limit = (newNum < 0 ? 5 : 4)
    if (newNum.toString().length > limit && digits > 0)
        return cuteNumber(num, digits - 1)
    return newNum;
}

Template.registerHelper('displayPayout', function(ups, downs) {
    if (!ups && !downs) return 0
    return cuteNumber(ups - downs)
})

Template.registerHelper('displayRewards', function(dtc, steem, scot, hive, blurt) {
    var rewards = []
    if (Session.get('scot') && scot) {
        return Scot.formatCurrency(scot, Session.get('scot'))
    }
    if ((hive || hive == 0) && (steem || steem == 0)) {
        let HBDPlusSBD = hive + steem
        rewards.push('$' + HBDPlusSBD.toFixed(3))
    } else if (steem || steem === 0) rewards.push('$' + steem)
    else if (hive || hive == 0) rewards.push('$' + hive)
    else if (blurt || blurt == 0) rewards.push('BLURT' + blurt)
    if (dtc || dtc === 0) rewards.push(Blaze._globalHelpers['displayMoney'](dtc, 0, 'DTC'))
    if (!rewards || rewards.length == 0) return '0 DTC'
    return rewards.join(' + ')
})

Template.registerHelper('displayMoney', function(amount, shorten, symbol) {
    amount = Math.round(amount)
    amount = amount / 100
    var string = ''
    if (shorten) {
        amount = cuteNumber(amount)
        string = amount
    } else {
        string = amount.toString()
        if (symbol)
            string += ' '
    }
    string += symbol
    return string
})

Template.registerHelper('displayScot', function(distScot, scot) {
    return Scot.formatCurrency(distScot, scot)
})

Template.registerHelper('displayVotingPower', function(user, shorten) {
    if (shorten)
        return cuteNumber(avalon.votingPower(user)) + 'VP'
    else {
        var string = avalon.votingPower(user).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
        return string + ' VP'
    }
})

Template.registerHelper('displayBandwidth', function(user) {
    return cuteNumber(avalon.bandwidth(user))
})

Template.registerHelper('displayPayoutUpvote', function(share, rewards) {
    return (Number(share) * rewards).toFixed(3);
})

Template.registerHelper('displayVoters', function(votes, isDownvote) {
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
                newVotes.push({ u: votes[i].u, vt: votes[i].vt, ts: votes[i].ts })
        }
    }
    newVotes.sort(function(a, b) {
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

Template.registerHelper('topVoters', function(votes, votesSteem, votesHive, votesBlurt, x) {
    if (!votes || votes.length == 0) votes = []
    if (!votesSteem || votesSteem.length == 0) votesSteem = []
    if (!votesHive || votesHive.length == 0) votesHive = []
    if (!votesBlurt || votesBlurt.length == 0) votesBlurt = []
    var votes = JSON.parse(JSON.stringify(votes))
    var votesSteem = JSON.parse(JSON.stringify(votesSteem))
    var votesHive = JSON.parse(JSON.stringify(votesHive))
    var votesBlurt = JSON.parse(JSON.stringify(votesBlurt))
    votes.sort(function(a, b) {
        return Math.abs(b.vt) - Math.abs(a.vt)
    })
    votesSteem.sort(function(a, b) {
        return Math.abs(parseInt(b.rshares)) - Math.abs(parseInt(a.rshares))
    })
    votesHive.sort((a, b) => {
        return Math.abs(parseInt(b.rshares)) - Math.abs(parseInt(a.rshares))
    })
    votesBlurt.sort((a, b) => {
      return Math.abs(parseInt(b.rshares)) - Math.abs(parseInt(a.rshares))
    })

    var top = []
    for (let i = 0; i < votes.length; i++) {
        top.push(votes[i])
    }

    var topSteem = []
    for (let i = 0; i < votesSteem.length; i++) {
        topSteem.push(votesSteem[i])
    }

    let topHive = []
    for (let i = 0; i < votesHive.length; i++) {
        topHive.push(votesHive[i])
    }

    let topBlurt = []
    for (let i = 0; i < votesBlurt.length; i++) {
        topBlurt.push(votesBlurt[i])
    }

    var realTop = []
    if (!x) {
        x = top.length + topSteem.length + topHive.length + topBlurt.length
    }
    for (let i = 0; i < x; i++) {
        if (top[i]) {
            top[i].network = 'dtc'
            if (top[i].vt < 0)
                top[i].downvote = true
            realTop.push(top[i])
        }

        if (topSteem[i]) {
            topSteem[i].network = 'steem'
            if (parseInt(topSteem[i].rshares) < 0)
                topSteem[i].downvote = true
            realTop.push(topSteem[i])
        }

        if (topHive[i]) {
            topHive[i].network = 'hive'
            if (parseInt(topHive[i].rshares) < 0)
                topHive[i].downvote = true
            realTop.push(topHive[i])
        }

        if (topBlurt[i]) {
          topBlurt[i].network = 'blurt'
          realTop.push(topBlurt[i])
        }
    }
    var zi = 800
    for (let i = 0; i < realTop.length; i++) {
        realTop[i].zindex = zi
        zi--
    }
    return realTop
})

Template.registerHelper('nonTopVotesCount', function(votes, votesSteem, votesHive, votesBlurt, x) {
    var total = 0
    if (votes)
        if (votes.length >= x)
            total += votes.length - x
    if (votesSteem)
        if (votesSteem.length >= x)
            total += votesSteem.length - x
    if (votesHive)
        if (votesHive.length >= x)
            total += votesHive.length - x
    if (votesBlurt)
        if (votesBlurt.length >= x)
            total += votesBlurt.length - x
    if (total == 0) return
    return total
})

Template.registerHelper('timeAgoReal', function(timestamp) {
    return moment(timestamp).fromNow()
})

Template.registerHelper('timeAgoTimestamp', function(timestamp) {
    return moment(timestamp * 1000).fromNow()
})

Template.registerHelper('timeAgo', function(ts) {
    var date = new Date(ts)
    return moment(date).fromNow()
})

Template.registerHelper('timeDisplay', function(ts) {
    var date = new Date(parseInt(ts))
    return moment(date).format("ll")
})

Template.registerHelper('durationDisplay', function(seconds) {
    seconds = parseFloat(seconds)
    if (seconds > 3600) {
        return moment('2000-01-01 00:00:00').add(moment.duration(seconds * 1000)).format('HH:mm:ss')
    } else {
        return moment('2000-01-01 00:00:00').add(moment.duration(seconds * 1000)).format('mm:ss')
    }
})

Template.registerHelper('hasUpvoted', function(video) {
    if (!video) return false

    if (video.votes && Session.get('activeUsername'))
        for (var i = 0; i < video.votes.length; i++) {
            if (video.votes[i].u == Session.get('activeUsername') &&
                video.votes[i].vt > 0)
                return true
        }
    if (video.votesSteem && Session.get('activeUsernameSteem'))
        for (var i = 0; i < video.votesSteem.length; i++) {
            if (video.votesSteem[i].voter == Session.get('activeUsernameSteem') &&
                parseInt(video.votesSteem[i].rshares) > 0)
                return true
        }
    if (video.votesHive && Session.get('activeUsernameHive'))
        for (let i = 0; i < video.votesHive.length; i++) {
            if (video.votesHive[i].voter == Session.get('activeUsernameHive') &&
                parseInt(video.votesHive[i].rshares) > 0)
                return true
        }
    if (video.votesBlurt && Session.get('activeUsernameBlurt'))
        for (let i = 0; i < video.votesBlurt.length; i++) {
            if (video.votesBlurt[i].voter == Session.get('activeUsernameBlurt') &&
                parseInt(video.votesBlurt[i].rshares) > 0)
                return true
        }
    return false
})

Template.registerHelper('hasDownvoted', function(video) {
    if (!video) return false
    if (video.votes && Session.get('activeUsername'))
        for (var i = 0; i < video.votes.length; i++) {
            if (video.votes[i].u == Session.get('activeUsername') &&
                video.votes[i].vt < 0)
                return true
        }
    if (video.votesSteem && Session.get('activeUsernameSteem'))
        for (var i = 0; i < video.votesSteem.length; i++) {
            if (video.votesSteem[i].voter == Session.get('activeUsernameSteem') &&
                parseInt(video.votesSteem[i].rshares) < 0)
                return true
        }
    if (video.votesHive && Session.get('activeUsernameHive'))
        for (let i = 0; i < video.votesHive.length; i++) {
            if (video.votesHive[i].voter == Session.get('activeUsernameHive') &&
                parseInt(video.votesHive[i].rshares) < 0)
                return true
        }
    return false
})

Template.registerHelper('uniques', function(votes, votesSteem, votesHive, votesBlurt, type) {
    if (!votes) votes = []
    if (!votesSteem) votesSteem = []
    if (!votesHive) votesHive = []
    if (!votesBlurt) votesBlurt = []
    var counter = 0
    for (let i = 0; i < votes.length; i++) {
        if (votes[i].vt > 0 && type == 'up')
            counter++
            if (votes[i].vt < 0 && type == 'down')
                counter++
    }
    for (let i = 0; i < votesSteem.length; i++) {
        if (votesSteem[i].percent > 0 && type == 'up')
            counter++
            if (votesSteem[i].percent < 0 && type == 'down')
                counter++
    }
    for (let i = 0; i < votesHive.length; i++) {
        if (votesHive[i].percent > 0 && type == 'up')
            counter++
            if (votesHive[i].percent < 0 && type == 'down')
                counter++
    }
    // no downvotes in Blurt
    for (let i = 0; i < votesBlurt.length; i++) {
      if (votesBlurt[i].percent > 0 && type == 'up')
          counter++
    }
    return counter
})

Template.registerHelper('lengthOf', function(array) {
    if (!array) return
    return array.length
})

Template.registerHelper('isPlural', function(array) {
    if (!array) return
    if (array.length == 1) return false
    return true
})

// censorshipLevel controls the visibility of videos
// returns -1 is video is invalid format
// returns 0 if video is 100% safe
// returns 1 if video is negative (vp upvotes < vp downvotes)
// returns 2 if video has the nsfw tag
Template.registerHelper('censorshipLevel', function(video) {
    let nsfwTags = ['nsfw', 'porn']
    if (!video || !video.json)
        return -1
    if (video.json && (video.json.nsfw || (typeof video.json.tag === 'string' && nsfwTags.includes(video.json.tag.toLowerCase()))))
        return 2
    if (video.tags && video.tags.length > 0 && ((video.tags[0].t && nsfwTags.includes(video.tags[0].t.toLowerCase())) || (typeof video.tags[0] === 'string' && video.tags[0] && nsfwTags.includes(video.tags[0].toLowerCase()))))
        return 2
    if (video.downs > video.ups) {
        return 1
    }

    return 0
})

Template.registerHelper('isVideoHidden', function(video) {
    var censor = UI._globalHelpers.censorshipLevel(video)
    if (censor == -1)
        return true
    if (censor == 1 && parseInt(Session.get('censorSetting')) === 2)
        return true
    if (censor == 2 && parseInt(Session.get('nsfwSetting')) === 2)
        return true

    return false
})

Template.registerHelper('isVideoBlurred', function(video) {
    var censor = UI._globalHelpers.censorshipLevel(video)
    if (censor == 1 && parseInt(Session.get('censorSetting')) === 1)
        return true
    if (censor == 2 && parseInt(Session.get('nsfwSetting')) === 1)
        return true

    return false
})

Template.registerHelper('syntaxed', function(text, text2) {
    if (!text) text = text2
    if (!text) return ''
    if (typeof text != 'string')
        return ''
    text = xss(text, {
        whiteList: [],
        stripIgnoreTag: true,
        stripIgnoreTagBody: ['script']
    })

    // replace line breaks to html
    text = text.replace(/(?:\r\n|\r|\n)/g, '<br />');

    // time travelling stuff
    var re = /(?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d)/g
    text.replace(re, function(match, p1, p2, p3) {
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

Template.registerHelper('humanFilesize', function(bits, si) {
    var thresh = si ? 1000 : 1024;
    if (Math.abs(bits) < thresh) {
        return bits + ' B';
    }
    var units = si ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    var u = -1;
    do {
        bits /= thresh;
        ++u;
    } while (Math.abs(bits) >= thresh && u < units.length - 1);
    return bits.toFixed(1) + ' ' + units[u];
})

Template.registerHelper('settings', function() {
    return Meteor.settings.public
})

Template.registerHelper('thirdPartyUploadEndpoints', () => {
    return Meteor.settings.public.remote.thirdPartyUploadEndpoints
})

Template.registerHelper('isSubscribedTo', function(following) {
    var sub = Subs.findOne({ follower: Session.get('activeUsername'), following: following })
    if (sub) return true
    return false;
})

Template.registerHelper('getEmbedCode', function(author, permlink) {
    var code = '<iframe width="560" height="315" src="https://emb.d.tube/#!/@@@author@@@/@@@permlink@@@" frameborder="0" allowfullscreen></iframe>'
    code = code.replace('@@@author@@@', author)
    code = code.replace('@@@permlink@@@', permlink)
    return code
})

Template.registerHelper('getPercent', function(string) {
    return parseInt(string)
})

Template.registerHelper('displayShortDescription', function(string) {
    return string.substring(0, 130)
})

Template.registerHelper('displayDate', function(date) {
    return moment(date).format('MMMM Do YYYY');
})

Template.registerHelper('displayDateFull', function(date) {
    return moment(date).format('MMMM Do YYYY, h:mm:ss a');
})

Template.registerHelper('arrayify', function(obj) {
    var result = [];
    for (var key in obj) result.push({ key: key, value: obj[key] });
    return result;
});

Template.registerHelper('inputTags', function(tags) {
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

Template.registerHelper('activeUsernameSteem', function() {
    return Session.get('activeUsernameSteem')
})

Template.registerHelper('activeUsernameHive', () => {
    return Session.get('activeUsernameHive')
})

Template.registerHelper('activeUsernameBlurt', () => {
  return Session.get('activeUsernameBlurt')
})

Template.registerHelper('getVideoDesc', (video) => {
    return video.desc || video.description
})

Template.registerHelper('subCount', function() {
    var user = ChainUsers.findOne({ name: FlowRouter.getParam("author") })
    if (user)
        return user.followersCount
    else
        return 0
})

Template.registerHelper('lowerThan', function(n, p) {
    n = parseInt(n)
    p = parseInt(p)
    if (p < n) return true
    return false
})

Template.registerHelper('topTags', function() {
    // CLIENT SIDE TRENDING TAGS !?
    var videos = Videos.find({ source: 'chainByHot' }, { limit: 50, sort: { score: -1 } }).fetch()
    var tags = {}
    for (let i = 0; i < videos.length; i++) {
        if (Session.get('scot')) {
            if (videos[i].tags) {
                for (let y = 0; y < videos[i].tags.length; y++) {
                    if (videos[i].tags[y].t) {
                        if (!tags[videos[i].tags[y].t])
                            tags[videos[i].tags[y].t] = videos[i].tags[y].vt
                        else
                            tags[videos[i].tags[y].t] += videos[i].tags[y].vt
                    }
                }
            }
        } else {
            if (videos[i].votes) {
                for (let y = 0; y < videos[i].votes.length; y++) {
                    if (videos[i].votes[y].tag) {
                        if (!tags[videos[i].votes[y].tag])
                            tags[videos[i].votes[y].tag] = videos[i].votes[y].vt
                        else
                            tags[videos[i].votes[y].tag] += videos[i].votes[y].vt
                    }
                }
            }
        }
    }
    var array = []
    var ignoredTags = ['dtube']
    if (Session.get('scot'))
        ignoredTags.push(Session.get('scot').tag)
    for (const key in tags)
        if (ignoredTags.indexOf(key) == -1)
            array.push({ tag: key, vt: tags[key] })

    array = array.sort(function(a, b) { return b.vt - a.vt })
    array = array.slice(0, 10)
    return array
})

Template.registerHelper('scot', function() {
    return Session.get('scot')
})

Template.registerHelper('isOnWatchAgain', function() {
    if (FlowRouter._current.path == '/history')
        return true
    return false
})

Template.registerHelper('encodeURIComponent', function(text) {
    return encodeURIComponent(text)
})

Template.registerHelper('steemVotable', function(content) {
    if (Session.get('activeUsernameSteem')) {
        if (content._id.startsWith('steem'))
            return true
        if (!content.json.refs) return false
        for (let r in content.json.refs)
            if (content.json.refs[r].startsWith('steem'))
                return true
        return false
    } else return false
})

Template.registerHelper('hiveVotable', function(content) {
    if (Session.get('activeUsernameHive')) {
        if (content._id.startsWith('hive'))
            return true
        if (!content.json.refs) return false
        for (let r in content.json.refs)
            if (content.json.refs[r].startsWith('hive'))
                return true
        return false
    } else return false
})

Template.registerHelper('blurtVotable', function(content) {
  if (Session.get('activeUsernameBlurt')) {
      if (content._id.startsWith('blurt'))
          return true
      if (!content.json.refs) return false
      for (let r in content.json.refs)
          if (content.json.refs[r].startsWith('blurt'))
              return true
      return false
  } else return false
})

Template.registerHelper('dtubeVotable', function(content) {
    if (Session.get('activeUsername')) {
        if (content && content._id.startsWith('dtc'))
            return true
        if (!content.json.refs) return false
        for (let r in content.json.refs)
            if (content.json.refs[r].startsWith('dtc'))
                return true
        return false
    } else return false
})

Template.registerHelper('contentNetwork', function(content, ignoreVotable) {
    if (!content)
        return
    let network = 'dtube'
    if (content._id)
        network = content._id.split('/')[0]
    if (network === 'dtc' && (ignoreVotable || Session.get('activeUsername')))
        return 'dtube'
    else {
        let networkFound = false
        for (let r in content.json.refs) {
            let refNetwork = content.json.refs[r].split('/')[0]
            if (!networkFound && refNetwork !== 'dtc' && (
                ignoreVotable ||
                (refNetwork === 'steem' && Session.get('activeUsernameSteem')) ||
                (refNetwork === 'hive' && Session.get('activeUsernameHive')) ||
                (refNetwork === 'blurt' && Session.get('activeUsernameBlurt'))
            )) {
                network = refNetwork
                networkFound = true
            } else if (refNetwork === 'dtc' && (ignoreVotable || Session.get('activeUsername')))
                return 'dtube'
        }
    }
    return network
})

Template.registerHelper('isNightMode',() => {
    return UserSettings.get('isInNightMode')
})

Template.registerHelper('hasMetamask',() => {
    return Session.get('hasMetamask')
})

Template.registerHelper('metamaskAddress',() => {
    return Session.get('metamaskAddress')
})

Template.registerHelper('fallbackThumbnailUrl',(url) => {
    // no fallback for 3rd party thumbnails
    if (!url.includes('/ipfs/') && !url.includes('/btfs/')) return ''

    // Return next gateway in the list
    for (let g in Meteor.settings.public.remote.displayNodes) {
        if (url.startsWith(Meteor.settings.public.remote.displayNodes[g])) {
            if (g < Meteor.settings.public.remote.displayNodes.length)
                return url.replace(Meteor.settings.public.remote.displayNodes[g],Meteor.settings.public.remote.displayNodes[parseInt(g)+1])
            else
                return '' // no more gateways
        }
    }

    // Return default gateway if not in the list
    let ipfsOrBtfs = url.includes('/ipfs/') ? '/ipfs/' : '/btfs/'
    let splitUrl = url.split(ipfsOrBtfs)
    splitUrl[0] = Meteor.settings.public.remote.displayNodes[1]
    return splitUrl.join(ipfsOrBtfs)
})

Template.registerHelper('coinPrice',() => {
    return Session.get('coinPrice')
})

Template.registerHelper('coinPriceFormatted',() => {
    return Math.round(Session.get('coinPrice')*1000)/1000;
})
