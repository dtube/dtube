import { originaldtubers } from '../../../originaldtubers.js';
var isLoadingState = false;


Template.video.rendered = function () {
    Session.set('isSearchingMobile', false)
    Session.set('isShareOpen', false)
    Session.set('isDescriptionOpen', false)
    Template.video.setScreenMode();
    $(window).on('resize', Template.video.setScreenMode)
    Template.sidebar.resetActiveMenu()
    Session.set('commentBurn', null)
    setTimeout(function () {
        Template.settingsdropdown.nightMode()
        Template.video.setScreenMode()
        $('.ui.newtag').dropdown({})
        $('#comment-range').on('input', function () {
            let balance = avalon.availableBalance(Users.findOne({ username: Session.get('activeUsername'), network: 'avalon' }))
            Session.set('commentBurn', Template.publish.logSlider(this.value,balance))
        })

        $('.videopayout')
            .popup({
                inline: true,
                hoverable: true,
                popup: '.popupupvotes',
                position: 'bottom right',
            });
        $('#votecount').fitText(0.26);

        $('#votecount')
            .popup({
                inline: true,
                hoverable: true,
                popup: '.popupupvotes',
                position: 'bottom right',
            });
    }, 1000)
    setTimeout(originaldtubers.checkUser(FlowRouter.getParam("author"), async (err, res) => {
        await res;
        if (res == true) {
            $('.'+FlowRouter.getParam("author")+"_original").removeAttr("hidden");
        } else if (! err) {
            // not an original creator.
        } else {
            console.log(err);
        }
    }), 30000);
    if (typeof showdown === 'undefined')
        jQuery.ajax({
            url: 'https://cdn.rawgit.com/showdownjs/showdown/1.9.1/dist/showdown.min.js',
            dataType: 'script',
            success: function() {
                Session.set('mdlibLoaded',true)
            },
            async: true
        })
}

Template.video.helpers({
    allNetworks: function () {
        var a = Session.get('allNet')
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a
    },
    mergedCommentsLength: function (dtc, steem) {
        var merged = UI._globalHelpers['mergeComments'](dtc, steem, hive, blurt)
        return merged.length
    },
    isNoComment: function () {
        var vid = Template.video.__helpers[" video"]()
        if (!vid.comments && !vid.commentsSteem && !vid.commentsHive && !vid.commentsBlurt) return true
        return false
    },
    isSingleComment: function () {
        var vid = Template.video.__helpers[" video"]()
        var merged = UI._globalHelpers['mergeComments'](vid.comments, vid.commentsSteem, vid.commentsHive,  vid.commentsBlurt)
        if (merged.length != 1) return false
        return true
    },
    isIPFSOrBTFSUpload: () => {
        let video = Videos.findOne({
            'author': FlowRouter.getParam("author"),
            'link': FlowRouter.getParam("permlink")
        })
        return video.json.providerName === 'IPFS' || video.json.providerName === 'BTFS'
    },
    user: function () {
        return {
            name: FlowRouter.getParam("author")
        }
    },
    activeUser: function () {
        var user = Session.get('activeUsername')
        if (!user) user = Session.get('activeUsernameSteem')
        if (!user) user = Session.get('activeUsernameHive')
        if (!user) user = Session.get('activeUsernameBlurt')
        return user
    },
    userVideosAndResteems: function () {
        var suggestions = Videos.find({ relatedTo: FlowRouter.getParam("author") + '/' + FlowRouter.getParam("permlink"), source: 'askSteem' }, { limit: 12 }).fetch();
        return suggestions;
    },
    author: function () {
        return ChainUsers.findOne({ name: FlowRouter.getParam("author") })
    },
    video: function () {
        var videos = Videos.find({
            'author': FlowRouter.getParam("author"),
            'link': FlowRouter.getParam("permlink")
        }).fetch()
        for (var i = 0; i < videos.length; i++) {
            if (videos[i].source == 'chainDirect') {
                var title = ''
                if (videos[i].title) title = videos[i].title
                if (videos[i].json) title = videos[i].json.title
                Session.set("pageTitle", title)
                return videos[i]
            }
        }

        for (var i = 0; i < videos.length; i++) {
            if (videos[i].source == 'chainByBlog') return videos[i]
            if (videos[i].source == 'chainByHot') return videos[i]
            if (videos[i].source == 'chainByCreated') return videos[i]
            if (videos[i].source == 'chainByTrending') return videos[i]
        }

        if (videos && videos[0]) return videos[0]
        return;
    },
    hasMoreThan4Lines: function () {
        var desc = Videos.getDescription(this.json)
        var numberOfLineBreaks = (desc.match(/\n/g) || []).length;
        if (numberOfLineBreaks >= 4) {
            return true;
        }
    },
    isLoggedOn: function () {
        if (Session.get('activeUsername') || Session.get('activeUsernameSteem') || Session.get('activeUsernameHive') || Session.get('activeUsernameBlurt'))
            return true
        return false
    },
    convertTag: function (tag) {
        var tagWithoutDtube = tag ? tag.replace("dtube-", "") : ""
        return tagWithoutDtube
    },
    hasVoted: function (one, two) {
        if (one || two) return true;
        return false;
    },
    votable: function (dtube, steem, hive, blurt) {
        if (dtube || steem || hive || blurt)
            return true
        else return false
    },
    commentBurn: function () {
        return Session.get('commentBurn')
    },
    markdown: function() {
        let content = this.json.desc
        if (typeof showdown === 'undefined' && !Session.get('mdlibLoaded'))
            return null
        let converter = new showdown.Converter({
            tables: true,
            strikethrough: true,
            tasklists: true,
            ghCodeBlocks: true,
            openLinksInNewWindow: true
        })
        let html = converter.makeHtml(content)
        html = html.replace(/<table>/g, '<table class="ui table">')
        html = html.replace(/<img/g, '<img style="width: 100%;"')
        return html
    }
})

Template.video.activatePopups = function () {
    $('[data-tcs]').each(function () {
        var $el = $(this);
        $el.popup({
            popup: $el.attr('data-tcs'),
            on: 'hover',
            delay: {
                show: 0,
                hide: 100
            },
            position: 'bottom center',
            hoverable: true
        });
    });
}

Template.video.events({
    // 'click .videopayout': function(event) {
    //     var author = FlowRouter.getParam("author")
    //     var permlink = FlowRouter.getParam("permlink")
    //     FlowRouter.go('/'+author+'/'+permlink+'/votes')
    // },
    'click #promotereply': function (event) {
        if (event.target.checked) {
            $('#promoteslider').show()
            $('#promotedtc').show()
        }
        else {
            $('#promoteslider').hide()
            $('#promotedtc').hide()
            Session.set('commentBurn', null)
        }
    },
    'click .replyTo': function (event) {
        var replyingTo = {
            id: $(event.target).data('id')
        }
        if ($(event.target).data('refs'))
            replyingTo.refs = $(event.target).data('refs').split(',')
        Session.set('replyingTo', replyingTo)
    },
    'click #cancelReply': () => {
        Session.set('replyingTo',null)
    },
    'click .submit': function (event) {
        let jsonMetadata = {
            description: $('#replytext').val(),
            title: ''
        }
        refs = []
        if (!Session.get('replyingTo')) {
            refs = Session.get('currentRefs')
        } else {
            if (Session.get('replyingTo').refs)
                refs = Session.get('replyingTo').refs
            refs.push(Session.get('replyingTo').id)
        }
        if (refs.length == 0) {
            return
        }

        let burn = Session.get('commentBurn')
        if (!burn) burn = 0

        if (Session.get('activeUsername')) {
            let activeuser = Users.findOne({username: Session.get('activeUsername'), network: 'avalon'})
            let weight = UserSettings.get('voteWeight') * 100
            let publishVP = Math.floor(avalon.votingPower(activeuser) * weight / 10000)
            if (publishVP == 0) {
                toastr.error(translate('UPLOAD_NOT_ENOUGH_VP'), translate('ERROR_TITLE'))
                return
            }
        }

        $('.ui.button > .ui.icon.talk.repl').addClass('dsp-non');
        $('.ui.button > .ui.icon.load.repl').removeClass('dsp-non');
        $('.submit').addClass('disabled')

        if (refs.length > 1) {
            let parentAuthor, parentPermlink, paSteem, ppSteem, paHive, ppHive, paBlurt, ppBlurt
            for (let i = 0; i < refs.length; i++) {
                const ref = refs[i];
                if (ref.split('/')[0] == 'dtc') {
                    parentAuthor = ref.split('/')[1]
                    parentPermlink = ref.split('/')[2]
                }
                if (ref.split('/')[0] == 'steem') {
                    paSteem = ref.split('/')[1]
                    ppSteem = ref.split('/')[2]
                }
                if (ref.split('/')[0] == 'hive') {
                    paHive = ref.split('/')[1]
                    ppHive = ref.split('/')[2]
                }
                if (ref.split('/')[0] == 'blurt') {
                    paBlurt = ref.split('/')[1]
                    ppBlurt = ref.split('/')[2]
                }
            }
            broadcast.multi.comment(paSteem, ppSteem, paHive, ppHive, paBlurt, ppBlurt, parentAuthor, parentPermlink, jsonMetadata.description, jsonMetadata, '', burn, function (err, result) {
                $('.submit').removeClass('disabled')
                if (err) {
                    $('.ui.button > .ui.icon.load.repl').removeClass('dsp-non');
                    $('.ui.button > .ui.icon.remove.repl').removeClass('dsp-non');
                    var errorMessage
                    try {
                        errorMessage = err.payload.error.data.stack[0].format
                    } catch (error) {
                        errorMessage = Meteor.blockchainError(err)
                    }
                    toastr.error(errorMessage, translate('ERROR_TITLE'))
                    return
                }
                $('.ui.button > .ui.icon.load.repl').addClass('dsp-non');
                Template.video.loadState()
                Session.set('replyingTo', null)
                document.getElementById('replytext').value = "";
                $('.ui.button > .ui.icon.talk.repl').removeClass('dsp-non');
            });
        } else if (refs.length == 1) {
            if (refs[0].split('/')[0] == 'steem')
                broadcast.steem.comment(null, refs[0].split('/')[1], refs[0].split('/')[2], jsonMetadata.description, jsonMetadata, ['dtube'], function (err, result) {
                    $('.submit').removeClass('disabled')
                    if (err) {
                        $('.ui.button > .ui.icon.load.repl').removeClass('dsp-non');
                        $('.ui.button > .ui.icon.remove.repl').removeClass('dsp-non');
                        toastr.error(err.payload.error.data.stack[0].format, translate('ERROR_TITLE'))
                        return
                    }
                    $('.ui.button > .ui.icon.load.repl').addClass('dsp-non');
                    Template.video.loadState()
                    Session.set('replyingTo', null)
                    document.getElementById('replytext').value = "";
                    $('.ui.button > .ui.icon.talk.repl').removeClass('dsp-non');
                });
            if (refs[0].split('/')[0] == 'dtc') {
                function handleAvalonComment(err, result) {
                    $('.submit').removeClass('disabled')
                    if (err) {
                        $('.ui.button > .ui.icon.load.repl').removeClass('dsp-non');
                        $('.ui.button > .ui.icon.remove.repl').removeClass('dsp-non');
                        Meteor.blockchainError(err, translate('ERROR_TITLE'))
                        return
                    }
                    $('.ui.button > .ui.icon.load.repl').addClass('dsp-non');
                    Template.video.loadState()
                    Session.set('replyingTo', null)
                    document.getElementById('replytext').value = "";
                    $('.ui.button > .ui.icon.talk.repl').removeClass('dsp-non');
                }
                if (burn > 0)
                    broadcast.avalon.promotedComment(null, refs[0].split('/')[1], refs[0].split('/')[2], jsonMetadata, '', burn, handleAvalonComment)
                else
                    broadcast.avalon.comment(null, refs[0].split('/')[1], refs[0].split('/')[2], jsonMetadata, '', false, handleAvalonComment)
            }
            if (refs[0].split('/')[0] == 'hive')
                broadcast.hive.comment(null, refs[0].split('/')[1], refs[0].split('/')[2], jsonMetadata.description, jsonMetadata, ['dtube'], function (err, result) {
                    $('.submit').removeClass('disabled')
                    if (err) {
                        $('.ui.button > .ui.icon.load.repl').removeClass('dsp-non');
                        $('.ui.button > .ui.icon.remove.repl').removeClass('dsp-non');
                        toastr.error(err.payload.error.data.stack[0].format, translate('ERROR_TITLE'))
                        return
                    }
                    $('.ui.button > .ui.icon.load.repl').addClass('dsp-non');
                    Template.video.loadState()
                    Session.set('replyingTo', null)
                    document.getElementById('replytext').value = "";
                    $('.ui.button > .ui.icon.talk.repl').removeClass('dsp-non');
                });
            if (refs[0].split('/')[0] == 'blurt')
                broadcast.blurt.comment(null, refs[0].split('/')[1], refs[0].split('/')[2], jsonMetadata.description, jsonMetadata, ['dtube'], function (err, result) {
                    $('.submit').removeClass('disabled')
                    if (err) {
                        $('.ui.button > .ui.icon.load.repl').removeClass('dsp-non');
                        $('.ui.button > .ui.icon.remove.repl').removeClass('dsp-non');
                        toastr.error(err.payload.error.data.stack[0].format, translate('ERROR_TITLE'))
                        return
                    }
                    $('.ui.button > .ui.icon.load.repl').addClass('dsp-non');
                    Template.video.loadState()
                    Session.set('replyingTo', null)
                    document.getElementById('replytext').value = "";
                    $('.ui.button > .ui.icon.talk.repl').removeClass('dsp-non');
                });
        }
    },
    'click .subscribe': function () {
        var user = ChainUsers.findOne({ name: FlowRouter.getParam("author") })
        if (user.followersCount)
            user.followersCount++
        else
            user.followersCount = 1
        ChainUsers.upsert({ _id: user._id }, user)
        Subs.insert({
            follower: Session.get('activeUsername'),
            following: FlowRouter.getParam("author"),
            what: ['blog']
        })

        broadcast.avalon.follow(FlowRouter.getParam("author"), function (err, result) {
            if (err)
                Meteor.blockchainError(err)
        })
    },
    'click .unsubscribe': function () {
        var user = ChainUsers.findOne({ name: FlowRouter.getParam("author") })
        if (user.followersCount)
            user.followersCount--
        else
            user.followersCount = -1 // ?!
        ChainUsers.upsert({ _id: user._id }, user)
        Subs.remove({
            follower: Session.get('activeUsername'),
            following: FlowRouter.getParam("author")
        })
        broadcast.avalon.unfollow(FlowRouter.getParam("author"), function (err, result) {
            // finished unfollowing
            if (err)
                Meteor.blockchainError(err)
        })
    },
    'click .description': function () {
        if (Session.get('isDescriptionOpen')) {
            $('#descriptionsegment').addClass('closed');
            $('#truncateddesc').addClass('truncate');
            $('#showmore').removeClass('hidden');
            $('#showless').addClass('hidden');
        } else {
            $('#descriptionsegment').removeClass('closed');
            $('#truncateddesc').removeClass('truncate');
            $('#showmore').addClass('hidden');
            $('#showless').removeClass('hidden');
        }
        Session.set('isDescriptionOpen', !Session.get('isDescriptionOpen'))
    },
    'click .ui.share': function () {
        if (Session.get('isShareOpen'))
            $('#sharesegment').addClass('subcommentsclosed');
        else
            $('#sharesegment').removeClass('subcommentsclosed');

        Session.set('isShareOpen', !Session.get('isShareOpen'))
    },
    'click .editvideo': function () {
        $('#editvideosegment').toggle()
    }
})

Template.video.seekTo = function (seconds) {
    $('iframe')[0].contentWindow.postMessage({
        seekTo: true,
        seekTime: seconds
    }, '*')
}

Template.video.loadState = function () {
    if (isLoadingState) return
    isLoadingState = true
    Session.set('isSteemRefLoaded', false)
    Session.set('isHiveRefLoaded', false)
    Session.set('isBlurtRefLoaded', false)
    Session.set('isDTCRefLoaded', false)
    // maybe move this to parallel calls instead of series
    // especially if we keep adding more networks
    avalon.getContent(FlowRouter.getParam("author"), FlowRouter.getParam("permlink"), function (err, result) {
        if (err) {
            // content is not available on avalon
            steem.api.getState('/dtube/@' + FlowRouter.getParam("author") + '/' + FlowRouter.getParam("permlink"), function (err, result) {
                if (err || Object.keys(result.content).length == 0) {
                    // content is not available on avalon nor steem
                    hive.api.getState('/dtube/@' + FlowRouter.getParam('author') + '/' + FlowRouter.getParam("permlink"), (hiveerror, hiveresult) => {
                        // content is not available on avalon, steem, or hive
                        if (hiveerror || Object.keys(hiveresult.content).length == 0) {
                            blurt.api.getState('/dtube/@' + FlowRouter.getParam('author') + '/' + FlowRouter.getParam("permlink"), (blurterror, blurtresult) => {
                                if (blurterror) throw blurterror
                                isLoadingState = false
                                Session.set('urlNet', 'blurt')
                                Template.video.handleVideo(blurtresult, 'blurt/' + FlowRouter.getParam('author') + '/' + FlowRouter.getParam('permlink'), false)
                            })
                        }
                        isLoadingState = false
                        Session.set('urlNet', 'hive')
                        Template.video.handleVideo(hiveresult, 'hive/' + FlowRouter.getParam('author') + '/' + FlowRouter.getParam('permlink'), false)
                    })
                }
                isLoadingState = false
                Session.set('urlNet', 'steem')
                Template.video.loadScot()
                Template.video.handleVideo(result, 'steem/' + FlowRouter.getParam("author") + '/' + FlowRouter.getParam("permlink"), false)
            })
        } else {
            isLoadingState = false
            Session.set('urlNet', 'dtc')
            // Load SCOT (Steem only)
            if (result && result.json && result.json.refs) {
                for (let i = 0; i < result.json.refs.length; i++) {
                    if (result.json.refs[i].split('/')[0] === 'steem') {
                        Template.video.loadScot(result.json.refs[i].split('/')[1], result.json.refs[i].split('/')[2])
                    }
                }
            }

            Template.video.handleVideo(result, 'dtc/' + FlowRouter.getParam("author") + '/' + FlowRouter.getParam("permlink"), false)
        }
    });
}

Template.video.loadScot = function (author, link) {
    if (Session.get('scot')) {
        var author = author || FlowRouter.getParam("author")
        var link = link || FlowRouter.getParam("permlink")
        console.log('Loading scot rewards', author, link)
        Scot.getRewards(author, link, function (err, distScot) {
            console.log('Loaded scot rewards', distScot)
            Videos.update({
                author: FlowRouter.getParam("author"),
                link: FlowRouter.getParam("permlink")
            }, {
                $set: {
                    distScot: distScot
                }
            }, {
                multi: true
            })
        })
    }
}

Template.video.handleVideo = function (result, id, isRef) {
    if (!result) return
    id = id.split('/')
    var network = id[0]
    if (network == 'steem' || network == 'hive' || network == 'blurt') {
        if (!result.content || Object.keys(result.content).length == 0) return
        if (!result.content[id[1] + '/' + id[2]])
            result.content[id[1] + '/' + id[2]] = { content: result.content }
        result.content[id[1] + '/' + id[2]].content = result.content
        result = result.content[id[1] + '/' + id[2]]
        if ($('textarea[name=body]').length !== 0) $('textarea[name=body]')[0].value = result.body
    }
    var video = Videos.parseFromChain(result, false, network)
    console.log('Loaded ' + id, video)

    // non dtube videos can only load from State
    if (!video) return

    var description = ''
    if (video.json) description = video.json.description
    else description = video.description

    if (!isRef) {
        Videos.getVideosRelatedTo(result._id, FlowRouter.getParam("author"), FlowRouter.getParam("permlink"), 7, function () {
            // call finished
        })
        Session.set('videoDescription', description)
        var refs = [network + '/' + video.author + '/' + video.link]
        if (video.json && video.json.refs)
            for (let i = 0; i < video.json.refs.length; i++)
                refs.push(video.json.refs[i])
        Session.set('currentRefs', refs)

        for (let i = 0; i < Session.get('currentRefs').length; i++) {
            let net = Session.get('currentRefs')[i].split('/')[0]
            let networksArray = Session.get('allNet') || []
            if (!networksArray.includes(net))
                networksArray.push(net)
            Session.set('allNet', networksArray)
        }
    }
    video.source = 'chainDirect'
    video._id += 'd'
    Videos.upsert({ _id: video._id }, video)
    if (network == 'dtc') {
        video.last_viewed = new Date().getTime()
        WatchAgain.upsert({ _id: video._id }, video)
    }

    // load cross ref data if isRef == true
    if (isRef && video.json.refs) {
        for (let i = 0; i < video.json.refs.length; i++) {
            var netw = video.json.refs[i].split('/')[0]
            if (netw == 'dtc') {
                updateSteem(video.json.refs[i] + 'd', video.distSteem, video.votesSteem, video.commentsSteem, video.ups, video.downs, network)
                updateHive(video.json.refs[i] + 'd', video.distSteem, video.votesSteem, video.commentsSteem, video.ups, video.downs, network)
                updateBlurt(video.json.refs[i] + 'd', video.distSteem, video.votesSteem, video.commentsSteem, video.ups, video.downs, network)
            }
            if (netw == 'steem') {
                updateDtc(video.json.refs[i] + 'd', video.dist, video.votes, video.comments, video.ups, video.downs, network)
                updateHive(video.json.refs[i] + 'd', video.distSteem, video.votesSteem, video.commentsSteem, video.ups, video.downs, network)
                updateBlurt(video.json.refs[i] + 'd', video.distSteem, video.votesSteem, video.commentsSteem, video.ups, video.downs, network)
            }
            if (netw == 'hive') {
                updateDtc(video.json.refs[i] + 'd', video.dist, video.votes, video.comments, video.ups, video.downs, network)
                updateSteem(video.json.refs[i] + 'd', video.distSteem, video.votesSteem, video.commentsSteem, video.ups, video.downs, network)
                updateBlurt(video.json.refs[i] + 'd', video.distSteem, video.votesSteem, video.commentsSteem, video.ups, video.downs, network)
            }
            if (netw == 'blurt') {
                updateDtc(video.json.refs[i] + 'd', video.dist, video.votes, video.comments, video.ups, video.downs, network)
                updateSteem(video.json.refs[i] + 'd', video.distSteem, video.votesSteem, video.commentsSteem, video.ups, video.downs, network)
                updateHive(video.json.refs[i] + 'd', video.distSteem, video.votesSteem, video.commentsSteem, video.ups, video.downs, network)
            }
        }
    } else if (video.json && video.json.refs) {
        for (let i = 0; i < video.json.refs.length; i++) {
            var ref = video.json.refs[i].split('/')
            if (ref[0] == 'steem') {
                steem.api.getState('/dtube/@' + ref[1] + '/' + ref[2], function (err, result) {
                    if (err) throw err;
                    Template.video.handleVideo(result, 'steem/' + ref[1] + '/' + ref[2], true)
                })
            }
            if (ref[0] == 'dtc') {
                avalon.getContent(ref[1], ref[2], function (err, result) {
                    if (err) throw err;
                    Template.video.handleVideo(result, 'dtc/' + ref[1] + '/' + ref[2], true)
                });
            }
            if (ref[0] == 'hive') {
                hive.api.getState('/dtube/@' + ref[1] + '/' + ref[2], (hiveerror, hiveresult) => {
                    if (hiveerror) throw hiveerror
                    Template.video.handleVideo(hiveresult, 'hive/' + ref[1] + '/' + ref[2], true)
                })
            }
            if (ref[0] == 'blurt') {
                blurt.api.getState('/dtube/@' + ref[1] + '/' + ref[2], (err, result) => {
                    if (err) throw err
                    Template.video.handleVideo(result, 'blurt/' + ref[1] + '/' + ref[2], true)
                })
            }
        }
    }
}

function updateDtc(id, dist, votes, comments, ups, downs, currentNet) {
    // Do not update more than once
    if (Session.get('isDTCRefLoaded')) return

    // Update only if not permlink network
    if (Session.get('urlNet') == 'dtc') return

    // Do not update if network not part of refs
    if (!Session.get('allNet').includes('dtc')) return

    // Do not update if currentNet doesn't match
    if (currentNet != 'dtc') return

    Session.set('isDTCRefLoaded', true)
    Videos.update({ _id: id }, {
        $set: {
            dist: dist,
            votes: votes,
            comments: comments
        },
        $inc: {
            ups: ups,
            downs: downs
        }
    })
}

function updateHive(id, dist, votes, comments, ups, downs, currentNet) {
    if (Session.get('isHiveRefLoaded')) return
    if (Session.get('urlNet') == 'hive') return
    if (!Session.get('allNet').includes('hive')) return
    if (currentNet != 'hive') return
    Session.set('isHiveRefLoaded', true)

    Videos.update({ _id: id }, {
        $set: {
            distHive: dist,
            votesHive: votes,
            commentsHive: comments
        },
        $inc: {
            ups: ups,
            downs: downs
        }
    })
}

function updateBlurt(id, dist, votes, comments, ups, downs, currentNet) {
    if (Session.get('isBlurtRefLoaded')) return
    if (Session.get('urlNet') == 'blurt') return
    if (!Session.get('allNet').includes('blurt')) return
    if (currentNet != 'blurt') return
    Session.set('isBlurtRefLoaded', true)

    Videos.update({ _id: id }, {
        $set: {
            distBlurt: dist,
            votesBlurt: votes,
            commentsBlurt: comments
        },
        $inc: {
            ups: ups,
            downs: downs
        }
    })
}

function updateSteem(id, dist, votes, comments, ups, downs, currentNet) {
    if (Session.get('isSteemRefLoaded')) return
    if (Session.get('urlNet') == 'steem') return
    if (!Session.get('allNet').includes('steem')) return
    if (currentNet != 'steem') return
    Session.set('isSteemRefLoaded', true)

    Videos.update({ _id: id }, {
        $set: {
            distSteem: dist,
            votesSteem: votes,
            commentsSteem: comments
        },
        $inc: {
            ups: ups,
            downs: downs
        }
    })
}

Template.video.setScreenMode = function () {
    if ($(window).width() < 1166) {
        $('.ui.videocontainer').removeClass('computergrid').addClass('tabletgrid').removeClass('grid');
    }
    if ($(window).width() < 1619 && $(window).width() > 1166) {

        $('.ui.videocontainer').addClass('computergrid').removeClass('tabletgrid').addClass('grid');
        $('.videocol').removeClass('twelve wide column').addClass('eleven wide column');
        $('.relatedcol').removeClass('four wide column').addClass('five wide column');
    }
    if ($(window).width() > 1619) {
        $('.ui.videocontainer').addClass('computergrid').removeClass('tabletgrid').addClass('grid');
        $('.videocol').removeClass('eleven wide column').addClass('twelve wide column');
        $('.relatedcol').removeClass('five wide column').addClass('four wide column');

    }
}

Template.video.popularityChart = function () {
    if ($('.sparkline').is(':visible')) {
        $('.sparkline').hide()
        return
    }
    $('.sparkline').show()
    var content = Videos.findOne({
        author: FlowRouter.getParam("author"),
        link: FlowRouter.getParam("permlink"),
        source: 'chainDirect'
    })
    var sumVt = 0
    for (let i = 0; i < content.votes.length; i++) {
        // first voter advantage is real !
        if (i === 0)
            content.votes[i].vpPerDayBefore = 0
        // two similar votes at the same block/timestamp should be have equal earnings / vp per day
        else if (content.votes[i].ts === content.votes[i - 1].ts)
            content.votes[i].vpPerDayBefore = content.votes[i - 1].vpPerDayBefore
        else
            content.votes[i].vpPerDayBefore = 86400000 * sumVt / (content.votes[i].ts - content.votes[0].ts)

        sumVt += content.votes[i].vt
    }
    var points = []
    for (let i = 0; i < content.votes.length; i++) {
        points.push(content.votes[i].vpPerDayBefore)
    }
    points.push(86400000 * sumVt / (new Date().getTime() - content.votes[0].ts))
    sparkline(document.querySelector(".sparkline"), points, {
        onmousemove: function (event, datapoint) { },
        onmouseout: function () { }
    })
}
