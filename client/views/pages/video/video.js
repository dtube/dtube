var isLoadingState = false

Template.video.rendered = function () {
  Session.set('isSearchingMobile', false)
  Session.set('isShareOpen', false)
  Session.set('isDescriptionOpen', false)
  Template.video.setScreenMode();
  $(window).on('resize', Template.video.setScreenMode)
  Template.sidebar.resetActiveMenu()
  Template.settingsdropdown.nightMode();
  
  setTimeout(function(){
    $('.ui.newtag').dropdown({})
  }, 1000)
}

Template.video.helpers({
  allNetworks: function() {
    var a = Session.get('allNet')
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a
  },
  mergedCommentsLength: function(dtc, steem) {
    var merged = UI._globalHelpers['mergeComments'](dtc, steem, hive)
    return merged.length
  },
  isNoComment: function() {
    var vid = Template.video.__helpers[" video"]()
    if (!vid.comments && !vid.commentsSteem && !vid.commentsHive) return true
    return false
  },
  isSingleComment: function() {
    var vid = Template.video.__helpers[" video"]()
    var merged = UI._globalHelpers['mergeComments'](vid.comments, vid.commentsSteem, vid.commentsHive)
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
    return user
  },
  userVideosAndResteems: function () {
    var suggestions = Videos.find({ relatedTo: FlowRouter.getParam("author")+'/'+FlowRouter.getParam("permlink"), source: 'askSteem' }, { limit: 12 }).fetch();
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
  localIpfs: function () {
    return Session.get('localIpfs')
  },
  hasMoreThan4Lines: function () {
    var desc = Videos.getDescription(this.json)
    var numberOfLineBreaks = (desc.match(/\n/g) || []).length;
    if (numberOfLineBreaks >= 4) {
      return true;
    }
  },
  isLoggedOn: function () {
    if (Session.get('activeUsername') || Session.get('activeUsernameSteem'))
      return true
    return false
  },
  convertTag:function(tag){
    var tagWithoutDtube= tag.replace("dtube-", "")
    return tagWithoutDtube
  }
})

Template.video.activatePopups = function() {
  $('[data-tcs]').each(function() {
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
  'click .voteATag': function (event) {
    var newTag = event.target.dataset.value
    if (!newTag) return
    var author = FlowRouter.getParam("author")
    var permlink = FlowRouter.getParam("permlink")
    var weight = UserSettings.get('voteWeight') * 100
    broadcast.avalon.vote(author, permlink, weight, newTag, function (err, result) {
      if (err) toastr.error(Meteor.blockchainError(err), translate('GLOBAL_ERROR_COULD_NOT_VOTE'))
      else toastr.success(translate('GLOBAL_ERROR_VOTE_FOR', weight / 100 + '%', author + '/' + permlink))
      Template.video.loadState()
    });
  },
  'click .voteCustomTag': function (event) {
    var author = FlowRouter.getParam("author")
    var permlink = FlowRouter.getParam("permlink")
    var weight = UserSettings.get('voteWeight') * 100
    var newTag = prompt('Enter a new tag')
    newTag = newTag.trim().toLowerCase()
    if (newTag.indexOf(' ') > -1) {
      toastr.warning('Only a single tag is allowed')
      return
    }
    broadcast.avalon.vote(author, permlink, weight, newTag, function (err, result) {
      if (err) toastr.error(Meteor.blockchainError(err), translate('GLOBAL_ERROR_COULD_NOT_VOTE'))
      else toastr.success(translate('GLOBAL_ERROR_VOTE_FOR', weight / 100 + '%', author + '/' + permlink))
      Template.video.loadState()
    });
  },
  'click .downvoteCustomTag': function (event) {
    var author = FlowRouter.getParam("author")
    var permlink = FlowRouter.getParam("permlink")
    var weight = UserSettings.get('voteWeight') * -100
    var newTag = prompt('Enter a new tag')
    newTag = newTag.trim().toLowerCase()
    if (newTag.indexOf(' ') > -1) {
      toastr.warning('Only a single tag is allowed')
      return
    }
    broadcast.avalon.vote(author, permlink, weight, newTag, function (err, result) {
      if (err) toastr.error(Meteor.blockchainError(err), translate('GLOBAL_ERROR_COULD_NOT_VOTE'))
      else toastr.success(translate('GLOBAL_ERROR_VOTE_FOR', weight / 100 + '%', author + '/' + permlink))
      Videos.updateContent(FlowRouter.getParam("author"), FlowRouter.getParam("permlink"))
    });
  },
  'click .upvote': function (event) {
    let author = FlowRouter.getParam("author")
    let permlink = FlowRouter.getParam("permlink")
    let weight = UserSettings.get('voteWeight') * 100
    let weightSteem = UserSettings.get('voteWeightSteem') * 100
    let weightHive = UserSettings.get('voteWeightHive') * 100
    let refs = Session.get('currentRefs')
    broadcast.multi.vote(refs, weight, weightSteem, weightHive, '', function (err, result) {
      if (err) toastr.error(Meteor.blockchainError(err), translate('GLOBAL_ERROR_COULD_NOT_VOTE'))
      else {
        toastr.success(translate('GLOBAL_ERROR_VOTE_FOR', weight / 100 + '%', author + '/' + permlink))
        // var audio = new Audio('http://localhost:3000/DTube_files/sounds/coin-drop-1.mp3');
        // audio.play();
      }
      Template.video.loadState()
    });
  },
  'click .downvote': function (event) {
    let author = FlowRouter.getParam("author")
    let permlink = FlowRouter.getParam("permlink")
    let weight = UserSettings.get('voteWeight') * -100
    let weightSteem = UserSettings.get('voteWeightSteem') * -100
    let weightHive = UserSettings.get('voteWeightHive') * -100
    let refs = Session.get('currentRefs')
    broadcast.multi.vote(refs, weight, weightSteem, weightHive, '', function (err, result) {
      if (err) toastr.error(Meteor.blockchainError(err), translate('GLOBAL_ERROR_COULD_NOT_VOTE'))
      else {
        toastr.success(translate('GLOBAL_ERROR_DOWNVOTE_FOR', weight / 100 + '%', author + '/' + permlink))
        // var audio = new Audio('http://localhost:3000/DTube_files/sounds/coin-drop-1.mp3');
        // audio.play();
      }
      Template.video.loadState()
    });
  },
  'click .replyTo': function (event) {
    var replyingTo = {
      id: $(event.target).data('id')
    }
    if ($(event.target).data('refs'))
      replyingTo.refs = $(event.target).data('refs').split(',')
    Session.set('replyingTo', replyingTo)
  },
  'click .submit': function (event) {
    // Grammarly fix
    let body
    let commentbox = $(event.currentTarget).prev().children()
    for (let i = 0; i < commentbox.length; i++) {
      if (commentbox[i].type === "textarea") {
        body = commentbox[i].value
      }
    }
    let jsonMetadata = {
      app: 'dtube/0.9',
      description: body,
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
    } else {
      $('.ui.button > .ui.icon.talk.repl').addClass('dsp-non');
      $('.ui.button > .ui.icon.load.repl').removeClass('dsp-non');
    }
    if (refs.length > 1) {
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
      }
      broadcast.multi.comment(paSteem, ppSteem, paHive, ppHive, parentAuthor, parentPermlink, jsonMetadata.description, jsonMetadata, '', null, function (err, result) {
        console.log(err, result)
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
    } else if (refs.length == 1) {
      if (refs[0].split('/')[0] == 'steem')
        broadcast.steem.comment(null, refs[0].split('/')[1], refs[0].split('/')[2], jsonMetadata.description, jsonMetadata, ['dtube'], function (err, result) {
          console.log(err, result)
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
      if (refs[0].split('/')[0] == 'dtc')
        broadcast.avalon.comment(null, refs[0].split('/')[1], refs[0].split('/')[2], jsonMetadata, '',false, function (err, result) {
          console.log(err, result)
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
      if (refs[0].split('/')[0] == 'hive')
        broadcast.hive.comment(null, refs[0].split('/')[1], refs[0].split('/')[2], jsonMetadata, '',false, function (err, result) {
          console.log(err, result)
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
    ChainUsers.upsert({_id: user._id}, user)
    Subs.insert({
      follower: Session.get('activeUsername'),
      following: FlowRouter.getParam("author"),
      what: ['blog']
    })
    
    broadcast.avalon.follow(FlowRouter.getParam("author"), function(err, result) {
      if (err)
        toastr.error(Meteor.blockchainError(err))
    })
  },
  'click .unsubscribe': function () {
    var user = ChainUsers.findOne({ name: FlowRouter.getParam("author") })
    if (user.followersCount)
      user.followersCount--
    else
      user.followersCount = -1 // ?!
    ChainUsers.upsert({_id: user._id}, user)
    Subs.remove({
      follower: Session.get('activeUsername'),
      following: FlowRouter.getParam("author")
    })
    broadcast.avalon.unfollow(FlowRouter.getParam("author"), function(err, result) {
      // finished unfollowing
      if (err)
        toastr.error(Meteor.blockchainError(err))
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
  'click .editvideo': function() {
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
  Session.set('isSteemRefLoaded',false)
  Session.set('isHiveRefLoaded',false)
  Session.set('isDTCRefLoaded',false)
  // maybe move this to parallel calls instead of series
  // especially if we keep adding more networks
  avalon.getContent(FlowRouter.getParam("author"), FlowRouter.getParam("permlink"), function (err, result) {
    if (err) {
      // content is not available on avalon
      steem.api.getState('/dtube/@'+FlowRouter.getParam("author")+'/'+FlowRouter.getParam("permlink"), function (err, result) {
        if (err || Object.keys(result.content).length == 0) {
          // content is not available on avalon nor steem
          hive.api.getState('/dtube/@'+FlowRouter.getParam('author')+'/'+FlowRouter.getParam("permlink"), (hiveerror,hiveresult) => {
            if (hiveerror) throw hiveerror
            isLoadingState = false
            Session.set('urlNet','hive')
            Template.video.handleVideo(hiveresult,'hive/'+FlowRouter.getParam('author')+'/'+FlowRouter.getParam('permlink'),false)
          })
        }
        isLoadingState = false
        Session.set('urlNet','steem')
        Template.video.loadScot()
        Template.video.handleVideo(result, 'steem/'+FlowRouter.getParam("author")+'/'+FlowRouter.getParam("permlink"), false)
      })
    } else {
      isLoadingState = false
      Session.set('urlNet','dtc')
      // Load SCOT (Steem only)
      if (result && result.json && result.json.refs) {
        for (let i = 0; i < result.json.refs.length; i++) {
          if (result.json.refs[i].split('/')[0] === 'steem') {
            Template.video.loadScot(result.json.refs[i].split('/')[1], result.json.refs[i].split('/')[2])
          }
        }
      }
      
      Template.video.handleVideo(result, 'dtc/'+FlowRouter.getParam("author")+'/'+FlowRouter.getParam("permlink"), false)
    }
  });
}

Template.video.loadScot = function(author, link) {
  if (Session.get('scot')) {
    var author = author || FlowRouter.getParam("author")
    var link = link || FlowRouter.getParam("permlink")
    console.log('Loading scot rewards', author, link)
    Scot.getRewards(author, link, function(err, distScot) {
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

Template.video.handleVideo = function(result, id, isRef) {
  if (!result) return
  id = id.split('/')
  var network = id[0]
  // console.log('network: ',network)
  if (network == 'steem' || network == 'hive') {
    if (Object.keys(result.content).length == 0) return
    result.content[id[1]+'/'+id[2]].content = result.content
    result = result.content[id[1]+'/'+id[2]]
    if ($('textarea[name=body]').length !== 0) $('textarea[name=body]')[0].value = result.body
  }
  var video = Videos.parseFromChain(result, false, network)
  console.log('Loaded '+id, video)

  // non dtube videos can only load from State
  if (!video) {
    return;
    video = result.content[FlowRouter.getParam("author") + '/' + FlowRouter.getParam("permlink")]
    video.info = {
      author: FlowRouter.getParam("author"),
      permlink: FlowRouter.getParam("permlink"),
      title: video.title
    }
    video.content = {
      description: video.body
    }
  }
  var description = ''
  if (video.json) description = video.json.description
  else description = video.description

  if (!isRef) {
    Videos.getVideosRelatedTo(result._id, FlowRouter.getParam("author"), FlowRouter.getParam("permlink"), 7, function() {
      // call finished
    })
    Session.set('videoDescription', description)
    var refs = [network+'/'+video.author+'/'+video.link]
    if (video.json && video.json.refs)
      for (let i = 0; i < video.json.refs.length; i++)
        refs.push(video.json.refs[i])
    Session.set('currentRefs', refs)

    for (let i = 0; i < Session.get('currentRefs').length; i++) {
      let net = Session.get('currentRefs')[i].split('/')[0]
      let networksArray = Session.get('allNet') || []
      networksArray.push(net)
      Session.set('allNet', networksArray)
    }
  }
  video.source = 'chainDirect'
  video._id += 'd'
  Videos.upsert({ _id: video._id }, video)
  if (network == 'dtc')
    WatchAgain.upsert({ _id: video._id }, video)

  // load cross ref data if isRef == true
  if (isRef && video.json.refs) {
    // console.log("Referenced",video.json.refs)
    for (let i = 0; i < video.json.refs.length; i++) {
      var netw = video.json.refs[i].split('/')[0]
      // console.log('netw is ' + netw)
      if (netw == 'dtc') {
        updateSteem(video.json.refs[i]+'d',video.distSteem,video.votesSteem,video.commentsSteem,video.ups,video.downs,network)
        updateHive(video.json.refs[i]+'d',video.distSteem,video.votesSteem,video.commentsSteem,video.ups,video.downs,network)
      }
      if (netw == 'steem') {
        updateDtc(video.json.refs[i]+'d',video.dist,video.votes,video.comments,video.ups,video.downs,network)
        updateHive(video.json.refs[i]+'d',video.distSteem,video.votesSteem,video.commentsSteem,video.ups,video.downs,network)
      }
      if (netw == 'hive') {
        updateDtc(video.json.refs[i]+'d',video.dist,video.votes,video.comments,video.ups,video.downs,network)
        updateSteem(video.json.refs[i]+'d',video.distSteem,video.votesSteem,video.commentsSteem,video.ups,video.downs,network)
      }
    }
  } else if (video.json && video.json.refs) {
    for (let i = 0; i < video.json.refs.length; i++) {
      var ref = video.json.refs[i].split('/')
      if (ref[0] == 'steem') {
        steem.api.getState('/dtube/@'+ref[1]+'/'+ref[2], function (err, result) {
          if (err) throw err;
          Template.video.handleVideo(result, 'steem/'+ref[1]+'/'+ref[2], true)
        })
      }
      if (ref[0] == 'dtc') {
        avalon.getContent(ref[1], ref[2], function (err, result) {
          if (err) throw err;
          Template.video.handleVideo(result, 'dtc/'+ref[1]+'/'+ref[2], true)
        });
      }
      if (ref[0] == 'hive') {
        hive.api.getState('/dtube/@'+ref[1]+'/'+ref[2],(hiveerror,hiveresult) => {
          if (hiveerror) throw hiveerror
          Template.video.handleVideo(hiveresult,'hive/'+ref[1]+'/'+ref[2],true)
        })
      }
    }
  }
}

function updateDtc(id,dist,votes,comments,ups,downs,currentNet) {
  // Do not update more than once
  if (Session.get('isDTCRefLoaded')) return

  // Update only if not permlink network
  if (Session.get('urlNet') == 'dtc') return

  // Do not update if network not part of refs
  if (!Session.get('allNet').includes('dtc')) return

  // Do not update if currentNet doesn't match
  if (currentNet != 'dtc') return

  Session.set('isDTCRefLoaded',true)
  Videos.update({_id: id}, {
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

function updateHive(id,dist,votes,comments,ups,downs,currentNet) {
  if (Session.get('isHiveRefLoaded')) return
  if (Session.get('urlNet') == 'hive') return
  if (!Session.get('allNet').includes('hive')) return
  if (currentNet != 'hive') return
  Session.set('isHiveRefLoaded',true)
  
  Videos.update({_id: id}, {
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

function updateSteem(id,dist,votes,comments,ups,downs,currentNet) {
  if (Session.get('isSteemRefLoaded')) return
  if (Session.get('urlNet') == 'steem') return
  if (!Session.get('allNet').includes('steem')) return
  if (currentNet != 'steem') return
  Session.set('isSteemRefLoaded',true)

  Videos.update({_id: id}, {
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
  if ($(window).width() < 1619 && $(window).width() > 1166 ) {

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
      else if (content.votes[i].ts === content.votes[i-1].ts)
          content.votes[i].vpPerDayBefore = content.votes[i-1].vpPerDayBefore
      else
          content.votes[i].vpPerDayBefore = 86400000*sumVt/(content.votes[i].ts - content.votes[0].ts)
  
      sumVt += content.votes[i].vt
  }
  var points = []
  for (let i = 0; i < content.votes.length; i++) {
    points.push(content.votes[i].vpPerDayBefore)
  }
  points.push(86400000*sumVt/(new Date().getTime() - content.votes[0].ts))
  sparkline(document.querySelector(".sparkline"), points, {
    onmousemove: function(event, datapoint) {
    },
    onmouseout: function() {
    }
  })
}