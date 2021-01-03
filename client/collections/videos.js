import moment from 'moment'
import xss from 'xss'
const time_to_claim = 1000 * 60 * 60 * 24 * 7
Videos = new Mongo.Collection(null)

Videos.refreshBlockchain = function(cb) {
    var nbCompleted = 0;
    if (!Session.get('lastHot'))
        Videos.getVideosBy('hot', null, function() {
            returnFn()
        })
    if (!Session.get('lastTrending'))
        Videos.getVideosBy('trending', null, function() {
            returnFn()
        })
    if (!Session.get('lastCreated'))
        Videos.getVideosBy('created', null, function() {
            returnFn()
        })
    var returnFn = function() {
        if (Session.get('lastHot') && Session.get('lastTrending') && Session.get('lastCreated'))
            cb()
    }
}

Videos.getVideosRelatedTo = function(id, author, link, days, cb) {
    var dateFrom = moment().subtract(days, 'd').format('YYYY-MM-DD');
    var dateQuery = 'created:>=' + dateFrom
    if (!id) return
    idsplit = id.split('/')
    if (idsplit.length == 3)
        id = idsplit[1] + '/' + idsplit[2]
        // console.log('Loading related videos for '+id)
    Search.moreLikeThis(id, function(err, response) {
        var videos = response.results
        for (let i = 0; i < videos.length; i++) {
            videos[i].source = 'askSteem'
            videos[i]._id += 'a'
            videos[i].relatedTo = author + '/' + link
            try {
                Videos.upsert({ _id: videos[i]._id }, videos[i])
            } catch (err) {
                cb(err)
            }
        }
        cb(null)
    })
}

Videos.getVideosByTags = function(page, tags, days, sort_by, order, maxDuration, startpos, cb) {
    var queries = []
    if (days) {
        dateFrom = new Date().getTime() - (days * 24 * 60 * 60 * 1000)
        queries.push('ts:%3E=' + dateFrom)
    }
    if (maxDuration && maxDuration < 99999)
        queries.push('json.dur:%3C=' + maxDuration)
    for (let i = 0; i < tags.length; i++)
        queries.push('tags:' + tags[i])

    var query = queries.join(' AND ')
    var sort = 'ups:desc'
    if (sort_by) sort = sort_by + ':desc'

    Search.text(query, sort, startpos, function(err, response) {
        console.log(response)
        Session.set('tagCount', response.hits.total.value)
        var videos = response.results
        for (let i = 0; i < videos.length; i++) {
            videos[i].source = 'askSteem'
            videos[i]._id += 'a'
            videos[i].askSteemQuery = {
                tags: tags.join('+'),
                byDays: days,
                sort_by: sort_by,
                order: order
            }
            try {
                Videos.upsert({ _id: videos[i]._id }, videos[i])
            } catch (err) {
                cb(err)
            }
        }
        cb(null)
    })
}

Videos.setLastBlog = function(channel, item) {
    var lastBlogs = Session.get('lastBlogs')
    lastBlogs[channel] = item
    Session.set('lastBlogs', lastBlogs)
}

Videos.getVideosByBlog = function(author, limit, cb) {
    if (Session.get('scot')) {
        // if scot => fetch scot
        Videos.getVideosByBlogScot(author, function(err, finished) {
            cb(err, finished)
        })
        return
    }

    var user = ChainUsers.findOne({ name: author })
    if (user) {
        Videos.getVideosByBlogAvalon(author, function(err, finished) {
            cb(err, finished)
        })
        if (user.json && user.json.profile && user.json.profile.steem) {
            Videos.getVideosByBlogSteem(user.json.profile.steem, function(err, finished) {
                cb(err, finished)
            })
        }
        if (user.json && user.json.profile && (user.json.profile.hive)) {
            Videos.getVideosByBlogHive(user.json.profile.hive, (err, finished) => {
                cb(err, finished)
            })
        }
    } else {
        Videos.getVideosByBlogHive(author, function(err, finished) {
            cb(err, finished)
        })
        Videos.getVideosByBlogSteem(author, function(err, finished) {
            cb(err, finished)
        })
    }
}

Videos.getVideosByBlogScot = function(author, cb) {
    var lastAuthor = null
    var lastLink = null
    if (Session.get('lastBlogs')['scot/' + author]) {
        lastAuthor = Session.get('lastBlogs')['scot/' + author].author
        lastLink = Session.get('lastBlogs')['scot/' + author].permlink
    }
    Scot.getDiscussionsByBlog(author, lastAuthor, lastLink, function(err, result) {
        if (err) {
            cb(err);
            return
        }
        if (!result || result.length == 0) {
            cb(null)
            return
        }
        Videos.setLastBlog('scot/' + author, result[result.length - 1])
        var i, len = result.length;
        var videos = []
        for (i = 0; i < len; i++) {
            var video = Videos.parseFromChain(result[i], false, 'steem')
            if (video) videos.push(video)
        }
        for (var i = 0; i < videos.length; i++) {
            videos[i].source = 'chainByBlog'
            videos[i]._id += 'b'
            videos[i].fromBlog = FlowRouter.getParam("author")
            try {
                Videos.upsert({ _id: videos[i]._id }, videos[i])
            } catch (err) {
                cb(err)
            }
        }
        if (result.length == 50)
            cb(null, false)
        else
            cb(null, true)
    })
}

Videos.getVideosByBlogSteem = function(author, cb) {
    var query = {
        tag: author,
        limit: Session.get('remoteSettings').loadLimit,
        truncate_body: 1
    };
    if (Session.get('lastBlogs')['steem/' + author]) {
        query.start_author = Session.get('lastBlogs')['steem/' + author].author
        query.start_permlink = Session.get('lastBlogs')['steem/' + author].permlink
    }
    steem.api.getDiscussionsByBlog(query, function(err, result) {
        if (err) {
            cb(err);
            return
        }
        if (!result || result.length == 0) {
            cb(null, true)
            return
        }
        Videos.setLastBlog('steem/' + author, result[result.length - 1])
        var i, len = result.length;
        var videos = []
        for (i = 0; i < len; i++) {
            var video = Videos.parseFromChain(result[i], false, 'steem')
            if (video) videos.push(video)
        }
        for (var i = 0; i < videos.length; i++) {
            videos[i].source = 'chainByBlog'
            videos[i]._id += 'b'
            videos[i].fromBlog = FlowRouter.getParam("author")
            var existingVideo = null
            if (videos[i].json && videos[i].json.refs) {
                for (let y = 0; y < videos[i].json.refs.length; y++) {
                    var existingVideo = Videos.findOne({ _id: videos[i].json.refs[y] + 'b' })
                    if (existingVideo) break
                }
            }
            if (existingVideo) {
                try {
                    Videos.update({ _id: existingVideo._id }, {
                        $set: {
                            distSteem: videos[i].distSteem,
                            votesSteem: videos[i].votesSteem,
                            commentsSteem: videos[i].commentsSteem
                        },
                        $inc: {
                            ups: videos[i].ups,
                            downs: videos[i].downs
                        }
                    })
                } catch (err) {
                    cb(err)
                }
            } else {
                try {
                    if (!Videos.findOne({ _id: videos[i]._id.replace('steem/', 'hive/') }))
                        Videos.upsert({ _id: videos[i]._id }, videos[i])
                } catch (err) {
                    cb(err)
                }
            }
        }
        if (result.length == Session.get('remoteSettings').loadLimit)
            cb(null, false)
        else
            cb(null, true)
    })
}

Videos.getVideosByBlogHive = function(author, cb) {
    var query = {
        tag: author,
        limit: Session.get('remoteSettings').loadLimit,
        truncate_body: 1
    };
    if (Session.get('lastBlogs')['hive/' + author]) {
        query.start_author = Session.get('lastBlogs')['hive/' + author].author
        query.start_permlink = Session.get('lastBlogs')['hive/' + author].permlink
    }
    hive.api.getDiscussionsByBlog(query, function(err, result) {
        if (err) {
            cb(err);
            return
        }
        if (!result || result.length == 0) {
            cb(null, true)
            return
        }
        Videos.setLastBlog('hive/' + author, result[result.length - 1])
        var i, len = result.length;
        var videos = []
        for (i = 0; i < len; i++) {
            var video = Videos.parseFromChain(result[i], false, 'hive')
            if (video) videos.push(video)
        }
        for (var i = 0; i < videos.length; i++) {
            videos[i].source = 'chainByBlog'
            videos[i]._id += 'b'
            videos[i].fromBlog = FlowRouter.getParam("author")
            var existingVideo = null
            if (videos[i].json && videos[i].json.refs) {
                for (let y = 0; y < videos[i].json.refs.length; y++) {
                    var existingVideo = Videos.findOne({ _id: videos[i].json.refs[y] + 'b' })
                    if (existingVideo) break
                }
            }
            if (existingVideo) {
                try {
                    Videos.update({ _id: existingVideo._id }, {
                        $set: {
                            distHive: videos[i].distSteem,
                            votesHive: videos[i].votesSteem,
                            commentsHive: videos[i].commentsSteem
                        },
                        $inc: {
                            ups: videos[i].ups,
                            downs: videos[i].downs
                        }
                    })
                } catch (err) {
                    cb(err)
                }
            } else {
                try {
                    if (!Videos.findOne({ _id: videos[i]._id.replace('hive/', 'steem/') }))
                        Videos.upsert({ _id: videos[i]._id }, videos[i])
                } catch (err) {
                    cb(err)
                }
            }
        }
        if (result.length == Session.get('remoteSettings').loadLimit)
            cb(null, false)
        else
            cb(null, true)
    })
}

Videos.getVideosByBlogAvalon = function(author, cb) {
    var start_author = null
    var start_permlink = null

    if (Session.get('lastBlogs')['dtc/' + author]) {
        start_author = Session.get('lastBlogs')['dtc/' + author].author
        start_permlink = Session.get('lastBlogs')['dtc/' + author].link
    }

    avalon.getDiscussionsByAuthor(author, start_author, start_permlink, function(err, result) {
        if (!err && result && result.length > 0) {
            Videos.setLastBlog('dtc/' + author, result[result.length - 1])
            var i, len = result.length;
            var videos = []
            for (i = 0; i < len; i++) {
                var video = Videos.parseFromChain(result[i])
                if (video) videos.push(video)
            }
            for (var i = 0; i < videos.length; i++) {
                videos[i].source = 'chainByBlog'
                videos[i]._id += 'b'
                videos[i].fromBlog = FlowRouter.getParam("author")
                var existingVideo = null
                if (videos[i].json && videos[i].json.refs) {
                    for (let y = 0; y < videos[i].json.refs.length; y++) {
                        var existingVideo = Videos.findOne({ _id: videos[i].json.refs[y] + 'b' })
                        if (existingVideo) break
                    }
                }
                if (existingVideo) {
                    try {
                        Videos.update({ _id: existingVideo._id }, {
                            $set: {
                                dist: videos[i].dist,
                                votes: videos[i].votes,
                                comments: videos[i].comments
                            },
                            $inc: {
                                ups: videos[i].ups,
                                downs: videos[i].downs
                            }
                        })
                    } catch (err) {
                        cb(err)
                    }
                } else {
                    try {
                        Videos.upsert({ _id: videos[i]._id }, videos[i])
                    } catch (err) {
                        cb(err)
                    }
                }
            }
            if (result.length == 50)
                cb(null, false)
            else
                cb(null, true)
        } else cb(null, true)
    })
}

Videos.getVideosBy = function(type, limit, cb) {
    if (!limit) limit = Meteor.settings.public.remote.loadLimit

    switch (type) {
        case 'trending':
            var lastAuthor = Session.get('lastTrending') ? Session.get('lastTrending').author : null
            var lastLink = Session.get('lastTrending') ? Session.get('lastTrending').link : null
            if (!lastLink && Session.get('lastTrending') && Session.get('lastTrending').permlink)
                lastLink = Session.get('lastTrending').permlink
            if (!lastLink && Session.get('lastTrending') && Session.get('lastTrending').authorperm)
                lastLink = Session.get('lastTrending').authorperm.split('/')[1]
            if (!Session.get('scot'))
                avalon.getTrendingDiscussions(lastAuthor, lastLink, function(err, result) {
                    if (err === null || err === '') {
                        Session.set('lastTrending', result[result.length - 1])
                        var i, len = result.length;
                        var videos = []
                        for (i = 0; i < len; i++) {
                            var video = Videos.parseFromChain(result[i])
                            if (video) videos.push(video)
                        }
                        for (var i = 0; i < videos.length; i++) {
                            videos[i].source = 'chainByTrending'
                            videos[i]._id += 't'
                            try {
                                if (videos[i].json.videoId != "E_5BFKXVIXU")
                                    Videos.upsert({ _id: videos[i]._id }, videos[i])
                            } catch (err) {
                                console.log(err)
                                cb(err)
                            }
                        }
                        cb(null)
                    } else {
                        console.log(err);
                        cb(err)
                    }
                });
            else
                Scot.getDiscussionsBy('trending', limit, lastAuthor, lastLink, function(err, result) {
                    if (err === null || err === '') {
                        Session.set('lastTrending', result[result.length - 1])
                        var i, len = result.length;
                        var videos = []
                        for (i = 0; i < len; i++) {
                            var video = Videos.parseFromChain(result[i], false, 'steem')
                            if (video) videos.push(video)
                        }
                        for (var i = 0; i < videos.length; i++) {
                            videos[i].source = 'chainByTrending'
                            videos[i]._id += 't'
                            try {
                                Videos.upsert({ _id: videos[i]._id }, videos[i])
                            } catch (err) {
                                console.log(err)
                                cb(err)
                            }
                        }
                        cb(null)
                    } else {
                        console.log(err);
                        cb(err)
                    }
                })
            break;

        case 'hot':
            var lastAuthor = Session.get('lastHot') ? Session.get('lastHot').author : null
            var lastLink = Session.get('lastHot') ? Session.get('lastHot').link : null
            if (!lastLink && Session.get('lastHot') && Session.get('lastHot').permlink)
                lastLink = Session.get('lastHot').permlink
            if (!lastLink && Session.get('lastHot') && Session.get('lastHot').authorperm)
                lastLink = Session.get('lastHot').authorperm.split('/')[1]
            if (!Session.get('scot'))
                avalon.getHotDiscussions(lastAuthor, lastLink, function(err, result) {
                    if (err === null || err === '') {
                        Session.set('lastHot', result[result.length - 1])
                        var i, len = result.length;
                        var videos = []
                        for (i = 0; i < len; i++) {
                            var video = Videos.parseFromChain(result[i])
                            if (video) videos.push(video)
                        }
                        for (var i = 0; i < videos.length; i++) {
                            videos[i].source = 'chainByHot'
                            videos[i]._id += 'h'
                            try {
                                Videos.upsert({ _id: videos[i]._id }, videos[i])
                            } catch (err) {
                                console.log(err)
                                cb(err)
                            }
                        }
                        cb(null)
                    } else {
                        console.log(err);
                        cb(err)
                    }
                });
            else
                Scot.getDiscussionsBy('hot', limit, lastAuthor, lastLink, function(err, result) {
                    if (err === null || err === '') {
                        Session.set('lastHot', result[result.length - 1])
                        var i, len = result.length;
                        var videos = []
                        for (i = 0; i < len; i++) {
                            var video = Videos.parseFromChain(result[i], false, 'steem')
                            if (video) videos.push(video)
                        }
                        for (var i = 0; i < videos.length; i++) {
                            videos[i].source = 'chainByHot'
                            videos[i]._id += 'h'
                            try {
                                Videos.upsert({ _id: videos[i]._id }, videos[i])
                            } catch (err) {
                                console.log(err)
                                cb(err)
                            }
                        }
                        cb(null)
                    } else {
                        console.log(err);
                        cb(err)
                    }
                })
            break;
        case 'created':
            var lastAuthor = Session.get('lastCreated') ? Session.get('lastCreated').author : null
            var lastLink = Session.get('lastCreated') ? Session.get('lastCreated').link : null
            if (!lastLink && Session.get('lastCreated') && Session.get('lastCreated').permlink)
                lastLink = Session.get('lastCreated').permlink
            if (!lastLink && Session.get('lastCreated') && Session.get('lastCreated').authorperm)
                lastLink = Session.get('lastCreated').authorperm.split('/')[1]
            if (!Session.get('scot'))
                avalon.getNewDiscussions(lastAuthor, lastLink, function(err, result) {
                    Session.set('lastCreated', result[result.length - 1])
                    if (err === null || err === '') {
                        var i, len = result.length;
                        var videos = []
                        for (i = 0; i < len; i++) {
                            var video = Videos.parseFromChain(result[i])
                            if (video) videos.push(video)
                        }
                        for (var i = 0; i < videos.length; i++) {
                            videos[i].source = 'chainByCreated'
                            videos[i]._id += 'c'
                            try {
                                Videos.upsert({ _id: videos[i]._id }, videos[i])
                            } catch (err) {
                                console.log(err)
                                cb(err)
                            }
                        }
                        cb(null)
                    } else {
                        console.log(err);
                        cb(err)
                    }
                });
            else
                Scot.getDiscussionsBy('created', limit, lastAuthor, lastLink, function(err, result) {
                    if (err === null || err === '') {
                        Session.set('lastCreated', result[result.length - 1])
                        var i, len = result.length;
                        var videos = []
                        for (i = 0; i < len; i++) {
                            var video = Videos.parseFromChain(result[i], false, 'steem')
                            if (video) videos.push(video)
                        }
                        for (var i = 0; i < videos.length; i++) {
                            videos[i].source = 'chainByCreated'
                            videos[i]._id += 'c'
                            try {
                                Videos.upsert({ _id: videos[i]._id }, videos[i])
                            } catch (err) {
                                console.log(err)
                                cb(err)
                            }
                        }
                        cb(null)
                    } else {
                        console.log(err);
                        cb(err)
                    }
                })
            break;
        case 'createdLive':
            // steem.api.getDiscussionsByCreated(query, function(err, result) {
            //   if (err === null || err === '') {
            //       var i, len = result.length;
            //       var videos = []
            //       for (i = 0; i < len; i++) {
            //           var video = Videos.parseFromChain(result[i])
            //           if (video) videos.push(video) 
            //       }
            //       for (var i = 0; i < videos.length; i++) {
            //         videos[i].source = 'chainByCreated'
            //         videos[i]._id += 'c'
            //         try {
            //           Videos.upsert({_id: videos[i]._id}, videos[i])
            //         } catch(err) {
            //           console.log(err)
            //           cb(err)
            //         }
            //       }
            //       cb(null)
            //   } else {
            //       console.log(err);
            //       cb(err)
            //   }
            // });
            // break;
        default:
            console.log('Error getVideosBy type unknown')
    }
}

Videos.loadFeed = function(username, loadNotifs = true, cb) {
    if (loadNotifs)
        Notifications.getDecentralized()

    var lastAuthor = Session.get('lastFeed'+username) ? Session.get('lastFeed'+username).author : null
    var lastLink = Session.get('lastFeed'+username) ? Session.get('lastFeed'+username).link : null
    if (!lastLink && Session.get('lastFeed'+username) && Session.get('lastFeed'+username).permlink)
        lastLink = Session.get('lastFeed'+username).permlink
    if (!lastLink && Session.get('lastFeed'+username) && Session.get('lastFeed'+username).authorperm)
        lastLink = Session.get('lastFeed'+username).authorperm.split('/')[1]

    avalon.getFeedDiscussions(username, lastAuthor, lastLink, function(err, result) {
        if (err === null || err === '') {
            Session.set('lastFeed'+username, result[result.length - 1])
            var i, len = result.length;
            var videos = []
            for (i = 0; i < len; i++) {
                //console.log(result[i].author, result[i].reblogged_by)
                var video = Videos.parseFromChain(result[i])
                if (!video) continue;
                videos.push(video)
            }
            for (var i = 0; i < videos.length; i++) {
                videos[i].source = 'chainByFeed-' + username
                videos[i]._id += 'f'
                try {
                    Videos.upsert({ _id: videos[i]._id }, videos[i])
                } catch (err) {
                    console.log(err)
                }
            }
        } else {
            console.log(err);
        }
        if (cb) cb()
    });
}

Videos.parseFromChain = function(video, isComment, network) {
    if (network == 'steem' || network === 'hive') return Videos.parseFromSteem(video, isComment, network)
    if (!video || !video.json) return
    video.comments = avalon.generateCommentTree(video, video.author, video.link)
    video.comments = cleanTree(video.comments)

    function cleanTree(root) {
        for (let i = 0; i < root.length; i++) {
            root[i].comments = cleanTree(root[i].replies)
            root[i]._id = 'dtc/' + root[i]._id
            if (!root[i].dist) root[i].dist = 0
        }
        return root
    }
    video.ups = 0
    video.downs = 0
    // video.allTags = []
    video._id = 'dtc/' + video._id
    
    var tags = []
    if (typeof video.tags === 'string') {
        var tagsStrings = video.tags.split(' ')
        if (video.tags.trim() != '')
            for (let i = 0; i < tagsStrings.length; i++)
                tags.push({ t: tagsStrings[i], total: 0})
    } else {
        for (const key in video.tags) {
            tags.push({ t: key, total: video.tags[key] })
        }
    }
        
    video.tags = tags

    if (video.votes) {
        for (let i = 0; i < video.votes.length; i++) {
            if (video.votes[i].vt > 0)
                video.ups += video.votes[i].vt
            if (video.votes[i].vt < 0)
                video.downs -= video.votes[i].vt

            // this part will become obsolete when avalon properly sorts tags
            if (video.votes[i].tag) {
                for (let y = 0; y < video.tags.length; y++) {
                    if (video.tags[y].t == video.votes[i].tag) {
                        if (!video.tags[y].abs)
                            video.tags[y].abs = 0
                        video.tags[y].abs += Math.abs(video.votes[i].vt)
                        break
                    }
                }
            }
        }
    }

    // this same
    video.tags = video.tags.sort(function(a, b) {
        return b.abs - a.abs
    })

    video.totals = video.ups - video.downs
    if (!video.dist) video.dist = 0
    if (!video.json.thumbnailUrl)
        video.json.thumbnailUrl = Videos.getThumbnailUrl(video)
    for (let i = 0; i < video.votes.length; i++) {
        if (!video.votes[i].claimed)
            video.votes[i].timeToClaim = video.votes[i].ts + time_to_claim
        video.votes[i].claimable = Math.floor(video.votes[i].claimable)
    }
    return video;
}

Videos.parseFromSteem = function(video, isComment, network) {
    let newVideo
    if (isComment) {
        newVideo = {
            json: {
                refs: [],
                description: video.body,
                title: video.title
            }
        }
    } else try {
        newVideo = {
            json: JSON.parse(video.json_metadata).video
        }
        if (newVideo.json.info && newVideo.json.content)
            newVideo.json = Videos.convertToNewFormat(newVideo.json, video)
        newVideo.json.app = JSON.parse(video.json_metadata).app
        newVideo.json.tags = JSON.parse(video.json_metadata).tags
        if (!newVideo.json.videoId && !newVideo.json.files && !newVideo.json.ipfs.snaphash)
            return
    } catch (e) {
        return
    }
    if (!isComment && !newVideo) return
    if (!newVideo) newVideo = {}
    newVideo.author = video.author
    newVideo.body = video.body
    newVideo.total_payout_value = video.total_payout_value
    newVideo.curator_payout_value = video.curator_payout_value
    newVideo.pending_payout_value = video.pending_payout_value
    if (video.authorperm) video.permlink = video.authorperm.split('/')[1]
    newVideo.permlink = video.permlink
    newVideo.created = video.created
    newVideo.net_rshares = video.net_rshares
    newVideo.reblogged_by = video.reblogged_by
    newVideo.link = newVideo.permlink
    newVideo.votesSteem = video.active_votes
    newVideo.comments = []
    if (!isComment) {
        if (!newVideo.json) {
            newVideo.json = {
                refs: [],
                description: video.body,
                title: video.title
            }
        }
        newVideo.commentsSteem = Videos.commentsTree(video.content, video.author, video.permlink, network)
    }


    newVideo.votes = []
    newVideo.ts = new Date(video.created + 'Z').getTime()
    if (video.token) {
        // scot rewards
        newVideo.distScot = []
        var distScot = 0
        if (video.pending_token)
            distScot += video.pending_token
        else
            distScot += video.total_payout_value

        newVideo.distScot.push({ token: video.token, value: distScot })
    } else {
        // steem/hive rewards
        if (video.pending_payout_value)
            newVideo.distSteem = parseInt(video.pending_payout_value.split(' ')[0].replace('.', '')) / 1000
        if (video.total_payout_value.split(' ')[0] > 0) {
            newVideo.distSteem = parseInt(video.total_payout_value.split(' ')[0].replace('.', '')) + parseInt(video.curator_payout_value.split(' ')[0].replace('.', ''))
            newVideo.distSteem /= 1000
        }
    }

    newVideo.ups = 0
    newVideo.downs = 0

    if (newVideo.votesSteem) {
        for (let i = 0; i < newVideo.votesSteem.length; i++) {
            if (parseInt(newVideo.votesSteem[i].weight) > 0)
                newVideo.ups += parseInt(newVideo.votesSteem[i].weight)
            if (parseInt(newVideo.votesSteem[i].weight) < 0)
                newVideo.downs -= parseInt(newVideo.votesSteem[i].weight)
        }
    }
    video.totals = video.ups - video.downs

    // xss attack fix
    if (video.tags && !newVideo.tags) {
        var xssTags = []
        video.tags = video.tags.split(',')
        for (let i = 0; i < video.tags.length; i++) {
            xssTags.push({
                t: xss(video.tags[i], {
                    whiteList: [],
                    stripIgnoreTag: true,
                    stripIgnoreTagBody: ['script']
                }),
                vt: 1
            })
        }
        newVideo.tags = xssTags
    }

    if (newVideo.json.tags && !newVideo.tags) {
        var xssTags = []
        for (let i = 0; i < newVideo.json.tags.length; i++) {
            xssTags.push({
                t: xss(newVideo.json.tags[i], {
                    whiteList: [],
                    stripIgnoreTag: true,
                    stripIgnoreTagBody: ['script']
                }),
                vt: 1
            })
        }
        newVideo.tags = xssTags
    }

    if (Session.get('scot') && !isComment) {
        var hasTheTag = false
        if (newVideo.tags)
            for (let i = 0; i < newVideo.tags.length; i++) {
                if (newVideo.tags[i].t === Session.get('scot').tag) {
                    hasTheTag = true
                    break
                }
            }
        if (!hasTheTag) return
    }

    if (!newVideo._id) newVideo._id = network + '/' + newVideo.author + '/' + newVideo.permlink
    if (!newVideo.json.thumbnailUrl)
        newVideo.json.thumbnailUrl = Videos.getThumbnailUrl(newVideo)
    if (newVideo.json.ipfs && newVideo.json.ipfs.snaphash == "QmSi8pbdzgESJEuaeFMUtEv8NRTCA1gipRMvS9WHfo7HVz")
        return
    return newVideo;
}

Videos.getOverlayUrl = function(video) {
    if (!video || !video.json)
        return ''
    if (video.json.overlayUrl)
        return video.json.overlayUrl
    if (video.json.files && video.json.files.btfs && video.json.files.btfs.img && video.json.files.btfs.img["360"])
        return 'https://btfs.d.tube/btfs/' + video.json.files.btfs.img["360"]
    if (video.json.files && video.json.files.ipfs && video.json.files.ipfs.img && video.json.files.ipfs.img["360"])
        return 'https://snap1.d.tube/ipfs/' + video.json.files.ipfs.img["360"]
    if (video.json.files && video.json.files.youtube)
        return 'https://i.ytimg.com/vi/' + video.json.files.youtube + '/hqdefault.jpg'
    return ''
}

Videos.getGenreList = function() {
    var genreList = ["art", "fashion", "music", "gaming", "food", "travel", "sports",
                  "talks", "vlog", "science", "documentary", "movies", "journalism", "activism", "diyhub", "other", "original"]

    return genreList
}

Videos.getGenres = function() {
    genreUrlMap = Videos.getAllGenreThumbnailUrls()

    var genreThumbnailUrls = $.map(genreUrlMap, function(value, key) { return value });
    var genreNames = $.map(genreUrlMap, function(value, key) { return key });

    var genres = []
    for(var g=0; g<genreNames.length; g++) {
        var genre = {}
        var json = {}
        // genre["author"] = "t"
        // genre["link"] = genreNames[g]
        json["genreName"] = genreNames[g]
        json["thumbnailUrl"] = genreThumbnailUrls[g]
        genre["json"] = json
        genres.push(genre)
    }
    console.log(genres)
    return genres
}

Videos.getAllGenreImageFileNames = function() {
    var allGenreImageFileNames = []
    var fileNames = []

    // Free image sources: https://unsplash.com/s/photos
    // may be possible to programmatically lsdir and find too

    // genre_1 art
    fileNames = ["genre_1_art_1.jpg", "genre_1_art_2_paintings.jpg", "genre_1_art_3_colors.jpg", "genre_1_art_4_brushes.jpg", "genre_1_art_5_painting.jpg"]
    allGenreImageFileNames.push(fileNames)

    // genre_2 food
    fileNames = ["genre_2_fashion_1_clothings_black_blue.jpg", "genre_2_fashion_2_fashion_vlogging.jpg", "genre_2_fashion_3_girl_with_blue_dress.jpg", "genre_2_fashion_4_man_with_tshirt.jpg"]
    allGenreImageFileNames.push(fileNames)

    // genre_3 music
    fileNames = ["genre_3_music_1_instruments_empty_room.jpg", "genre_3_music_2_concert.jpg", "genre_3_music_3_singer.jpg", "genre_3_music_4_guitarist.jpg"]
    allGenreImageFileNames.push(fileNames)

    // genre_4 gaming
    fileNames = ["genre_4_gaming_1_gamer_lightings.jpg", "genre_4_gaming_2_gamer_girl.jpg", "genre_4_gaming_3_joystick.jpg"]
    allGenreImageFileNames.push(fileNames)

    // genre_5 food
    fileNames = ["genre_5_food_1_egg_avocado.jpg", "genre_5_food_2_vegetables.jpg", "genre_5_food_3_steak.jpg", "genre_5_food_4_bowl.jpg"]
    allGenreImageFileNames.push(fileNames)

    // genre_6 travel
    fileNames = ["genre_6_travel_1_aeroplane.jpg", "genre_6_travel_2_boat_river.jpg", "genre_6_travel_3_balloons.jpg", "genre_6_travel_4_mountain_lake.jpg"]
    allGenreImageFileNames.push(fileNames)

    // genre_7 sports
    fileNames = ["genre_7_sports_1_soccer_ball.jpg", "genre_7_sports_2_bikers.jpg", "genre_7_sports_3_stadium.jpg", "genre_7_sports_4_mountain_climbers.jpg", "genre_7_sports_5_runners.jpg"]
    allGenreImageFileNames.push(fileNames)

    // genre_8 talks
    fileNames = ["genre_8_talks_1_two_person.jpg", "genre_8_talks_2_interview.jpg", "genre_8_talks_3_interview_girl.jpg", "genre_8_talks_4_podcast_talk.jpg", "genre_8_talks_5_roundtable_talk.jpg"]
    allGenreImageFileNames.push(fileNames)

    // genre_9 vlog
    fileNames = ["genre_9_vlog_1_hiking.jpg", "genre_9_vlog_2_photographer.jpg", "genre_9_vlog_3_girl_near_river.jpg", "genre_9_vlog_4_vlogger_mountain.jpg"]
    allGenreImageFileNames.push(fileNames)

    // genre_10 science
    fileNames = ["genre_10_science_1_astronaut.jpg", "genre_10_science_3_experiment.jpg", "genre_10_science_5_agriculture.jpg", "genre_10_science_7_outside_earth.jpg", "genre_10_science_2_chemistry.jpg", "genre_10_science_4_antenna.jpg", "genre_10_science_6_cancer_cells.jpg"]
    allGenreImageFileNames.push(fileNames)

    // genre_11 documentary
    fileNames = ["genre_11_documentary_1_old_man_face.jpg", "genre_11_documentary_2_street.jpg"]
    allGenreImageFileNames.push(fileNames)

    // genre_12 movies
    fileNames = ["genre_12_movies_1_cinema.jpg", "genre_12_movies_2_actor_holding_actress.jpg", "genre_12_movies_3_chicago_theater.jpg", "genre_12_movies_4_movie_set.jpg"]
    allGenreImageFileNames.push(fileNames)

    // genre_13 journalism
    fileNames = ["genre_13_journalism_1_girl_rearranging_newspapers.jpg", "genre_13_journalism_2_newspapers.jpg"]
    allGenreImageFileNames.push(fileNames)

    // genre_14 activism
    fileNames = ["genre_14_activism_1_black_lives_matter.jpg", "genre_14_activism_3_change_politics_climate.jpg", "genre_14_activism_4_activism.jpg", "genre_14_activism_2_people_protesting.jpg", "genre_14_activism_3_dont_poison_our_water.jpg", "genre_14_activism_5_fashion_is_fucked.jpg"]
    allGenreImageFileNames.push(fileNames)

    // genre_15 how to do
    fileNames = ["genre_15_diyhub_1_scissors_pens.jpg", "genre_15_diyhub_2_green_leafed_plants.jpg", "genre_15_diyhub_3_person_holding_black_metal.jpg", "genre_15_diyhub_4_person_molding_vase.jpg", "genre_15_diyhub_5_man_sewing.jpg"]
    allGenreImageFileNames.push(fileNames)

    // genre_16 other
    fileNames = ["genre_16_other_1_passion_led_here.jpg"]
    allGenreImageFileNames.push(fileNames)

    // genre_17 original
    fileNames = ["genre_17_original_1.jpg"]
    allGenreImageFileNames.push(fileNames)

    return allGenreImageFileNames
}

Videos.getGenreThumbnailUrl = function(genreId) {
    var genreList = Videos.getGenreList()
    // get all genre image file names 2d matrix
    allGenreImageFileNames = Videos.getAllGenreImageFileNames()
    // get specific genre image file names
    genreImageFileNames = allGenreImageFileNames[genreId]


    // randomly choose a file from the directory
    id = Math.floor(Math.random() * genreImageFileNames.length)
    selectedFile = genreImageFileNames[id]

    var imageServerUrl = "http://18.218.250.68:5000"
    var rootGenreImageDir = imageServerUrl + "/DTube_files/images/genres/"
    // get genre directory
    var genreDir = "genre_" + (genreId + 1) + "_" + genreList[genreId]

    // create genre thumbnail url
    var genreThumbnailUrl = rootGenreImageDir + genreDir + "/" + selectedFile;

    return genreThumbnailUrl
}

Videos.getAllGenreThumbnailUrls = function() {
    var genreList = Videos.getGenreList()
    var allGenreThumbnailUrls = {}

    for(var i=0; i<genreList.length; i++) {
        var genreName = genreList[i]
        allGenreThumbnailUrls[genreName] = Videos.getGenreThumbnailUrl(i)
    }

    return allGenreThumbnailUrls
}

Videos.getThumbnailUrl = function(video) {
    if (!video || !video.json)
        return ''
    if (video.json.thumbnailUrl)
        return video.json.thumbnailUrl
    if (video.json.files && video.json.files.btfs && video.json.files.btfs.img && video.json.files.btfs.img["118"])
        return 'https://btfs.d.tube/btfs/' + video.json.files.btfs.img["118"]
    if (video.json.files && video.json.files.ipfs && video.json.files.ipfs.img && video.json.files.ipfs.img["118"])
        return 'https://snap1.d.tube/ipfs/' + video.json.files.ipfs.img["118"]
    if (video.json.files && video.json.files.youtube)
        return 'https://i.ytimg.com/vi/' + video.json.files.youtube + '/mqdefault.jpg'

    if (video.json.ipfs && video.json.ipfs.snaphash) return 'https://snap1.d.tube/ipfs/' + video.json.ipfs.snaphash
    if (video.json.info && video.json.info.snaphash) return 'https://snap1.d.tube/ipfs/' + video.json.info.snaphash
        // console.log('Found video with no thumbnail!!', video)
    return ''
}

Videos.getDescription = function(json) {
    if (!json) return ''
    if (json.desc) return json.desc
    if (json.description) return json.description
    return ''
}

Videos.commentsTree = function(content, rootAuthor, rootPermlink, network) {
    if (!content) return []
    var rootVideo = content[rootAuthor + '/' + rootPermlink]
    var comments = []
    for (var i = 0; i < rootVideo.replies.length; i++) {
        var comment = Videos.parseFromSteem(content[rootVideo.replies[i]], true, network)
        comment.comments = Videos.commentsTree(content, content[rootVideo.replies[i]].author, content[rootVideo.replies[i]].permlink, network)
        comments.push(comment)
    }
    comments = comments.sort(function(a, b) {
        var diff = parseInt(b.distSteem) - parseInt(a.distSteem)
        if (diff == 0) {
            return new Date(b.created) - new Date(a.created)
        }
        return diff
    })
    return comments
}

Videos.convertToNewFormat = function(oldJson, video) {
    var newJson = {
        app: oldJson.app,
        videoId: video.link,
        providerName: 'IPFS',
        title: oldJson.info.title,
        description: oldJson.content.description,
        duration: oldJson.info.duration,
        thumbnailUrl: 'https://snap1.d.tube/ipfs/' + oldJson.info.snaphash,
        ipfs: {
            snaphash: oldJson.info.snaphash,
            spritehash: oldJson.info.spritehash,
            videohash: oldJson.content.videohash,
            video240hash: oldJson.content.video240hash,
            video480hash: oldJson.content.video480hash,
            video720hash: oldJson.content.video720hash,
            video1080hash: oldJson.content.video1080hash
        }
    }

    return newJson
}