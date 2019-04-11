var isLoadingState = false

Template.video.rendered = function () {
  Session.set('isShareOpen', false)
  Session.set('isDescriptionOpen', false)
  Template.video.setScreenMode();
  $(window).on('resize', Template.video.setScreenMode)
  Template.sidebar.resetActiveMenu()
  Template.settingsdropdown.nightMode();
}

Template.video.helpers({
  user: function () {
    return {
      name: FlowRouter.getParam("author")
    }
  },
  activeUser: function () {
    return Session.get('activeUsername')
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
        Session.set("pageTitle", videos[i].json.title)
        return videos[i]
      }
    }

    for (var i = 0; i < videos.length; i++) {
      if (videos[i].source == 'chainByBlog') return videos[i]
      if (videos[i].source == 'chainByHot') return videos[i]
      if (videos[i].source == 'chainByCreated') return videos[i]
      if (videos[i].source == 'chainByTrending') return videos[i]
    }

    for (var i = 0; i < videos.length; i++) {
      if (videos[i].source == 'wakaArticles') return videos[i]
    }
    if (videos && videos[0]) return videos[0]
    return;
  },
  localIpfs: function () {
    return Session.get('localIpfs')
  },
  hasMoreThan4Lines: function () {
    if (!this.json.description) return false
    var numberOfLineBreaks = (this.json.description.match(/\n/g) || []).length;
    if (numberOfLineBreaks >= 4) {
      return true;
    }
  },
  isLoggedOn: function () {
    return Session.get('activeUsername')
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
  'click .newtag': function (event) {
    var author = FlowRouter.getParam("author")
    var permlink = FlowRouter.getParam("permlink")
    var weight = UserSettings.get('voteWeight') * 100
    var newTag = prompt('Enter a new tag')
    broadcast.vote(author, permlink, weight, newTag, function (err, result) {
      if (err) toastr.error(Meteor.blockchainError(err), translate('GLOBAL_ERROR_COULD_NOT_VOTE'))
      else toastr.success(translate('GLOBAL_ERROR_VOTE_FOR', weight / 100 + '%', author + '/' + permlink))
      Template.video.loadState()
    });
  },
  'click .upvote': function (event) {
    var author = FlowRouter.getParam("author")
    var permlink = FlowRouter.getParam("permlink")
    var weight = UserSettings.get('voteWeight') * 100
    broadcast.vote(author, permlink, weight, '', function (err, result) {
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
    var author = FlowRouter.getParam("author")
    var permlink = FlowRouter.getParam("permlink")
    var weight = UserSettings.get('voteWeight') * -100
    broadcast.vote(author, permlink, weight, '', function (err, result) {
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
    Session.set('replyingTo', {
      author: $(event.target).data('author'),
      permlink: $(event.target).data('permlink')
    })
  },
  'click .submit': function (event) {
    if (!Session.get('replyingTo')) return;
    $('.ui.button > .ui.icon.talk.repl').addClass('dsp-non');
    $('.ui.button > .ui.icon.load.repl').removeClass('dsp-non');
    var parentAuthor = Session.get('replyingTo').author
    var parentPermlink = Session.get('replyingTo').permlink
    var body = $(event.currentTarget).prev().children()[0].value
    var jsonMetadata = {
      app: 'deadtube',
      description: body
    }
    broadcast.comment(parentAuthor, parentPermlink, jsonMetadata, null, function (err, result) {
      console.log(err, result)
      if (err) {
        $('.ui.button > .ui.icon.load.repl').removeClass('dsp-non');
        $('.ui.button > .ui.icon.remove.repl').removeClass('dsp-non');
        toastr.error(err.payload.error.data.stack[0].format, 'Error')
        return
      }
      $('.ui.button > .ui.icon.load.repl').addClass('dsp-non');
      Template.video.loadState()
      Session.set('replyingTo', null)
      document.getElementById('replytext').value = "";
      $('.ui.button > .ui.icon.talk.repl').removeClass('dsp-non');
    });
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
    
    broadcast.follow(FlowRouter.getParam("author"), function(err, result) {
      // alternative, inutile jusqua preuve du contraire
      // steem.api.getFollowCount(FlowRouter.getParam("author"), function(e,r) {
      //   SubCounts.upsert({_id: r.account}, r)
      // })
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
    broadcast.unfollow(FlowRouter.getParam("author"), function(err, result) {
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
  avalon.getContent(FlowRouter.getParam("author"), FlowRouter.getParam("permlink"), function (err, result) {
    if (err) throw err;
    console.log('Loaded video from chain', result)
    Waka.db.Articles.upsert(result)
    Videos.getVideosRelatedTo(result._id, FlowRouter.getParam("author"), FlowRouter.getParam("permlink"), 7, function() {
      // call finished
    })
    isLoadingState = false
    for (var key in result.accounts) {
      var user = result.accounts[key]
      try {
        user.json_metadata = JSON.parse(user.json_metadata)
      } catch (e) {
      }
      ChainUsers.upsert({ _id: user.id }, Waka.api.DeleteFieldsWithDots(user));
    }
    var video = Videos.parseFromChain(result)
    // non dtube videos can only load from State
    if (!video) {
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
    Session.set('videoDescription', video.json.description)
    //video.comments = Videos.commentsTree(result.content, FlowRouter.getParam("author"), FlowRouter.getParam("permlink"))
    video.source = 'chainDirect'
    video._id += 'd'
    Videos.upsert({ _id: video._id }, video)
  });
}

// Template.video.pinFile = function (author, permlink, cb) {
//   if (!Session.get('localIpfs')) return
//   steem.api.getContent(author, permlink, function (e, video) {
//     if (!video) return
//     var video = Videos.parseFromChain(video)
//     localIpfs.pin.add(video.info.snaphash, function (e, r) {
//       console.log('pinned snap', e, r)
//     })
//     localIpfs.pin.add(video.content.videohash, function (e, r) {
//       console.log('pinned video', e, r)
//     })
//   })
// }

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
