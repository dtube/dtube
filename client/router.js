FlowRouter.route('/ipns/Qmb8hgdQoyotsnUj3JKWvWzcfA9Jx4Ak2ao1XzCVLfDtuB/', {
  name: "home",
  action: function(params, queryParams) {
    Session.set("pageTitle", '')
    BlazeLayout.render('masterLayout', {
      main: "home",
      nav: "nav",
    });
  }
});

FlowRouter.route('/', {
  name: "home",
  action: function(params, queryParams) {
    Session.set("pageTitle", '')
    Session.set("currentMenu", 1)
    firstLoad = setInterval(function() {
      if (!Videos) return
      if (!Waka) return
      // loading home data
      Videos.refreshBlockchain(function() {
        Videos.refreshWaka()
      })
      clearInterval(firstLoad)
    }, 50)
    BlazeLayout.render('masterLayout', {
      main: "home",
      nav: "nav",
    });
  }
});

FlowRouter.route('/c/:author', {
  name: "channel",
  action: function(params, queryParams) {
    Session.set("pageTitle", params.author + '\'s channel')
    BlazeLayout.render('masterLayout', {
      main: "channel",
      nav: "nav"
    });
    Videos.getVideosByBlog(params.author, 100, function() {
      // call finished
    })
    SubCounts.loadSubscribers(params.author)
    Template.channel.randomBackgroundColor();
    Session.set('currentTab', 'videos');
    if(Session.get('activeUsername') == params.author)
    {
      Session.set("currentMenu", 2)
    }
    ChainUsers.fetchNames([params.author], function (error) {
      if (error) console.log('Error fetch name')
    })
  }
});

FlowRouter.route('/upload', {
  name: "upload",
  action: function(params, queryParams) {
    Session.set("currentMenu", 3)
    Session.set("pageTitle", 'Upload')
    BlazeLayout.render('masterLayout', {
      main: "upload",
      nav: "nav",
    });
  }
});

FlowRouter.route('/hotvideos', {
  name: "hotvideos",
  action: function(params, queryParams) {
    Session.set("currentMenu", 4)
    Session.set("pageTitle", 'Hot Videos')
    BlazeLayout.render('masterLayout', {
      main: "hotvideos",
      nav: "nav",
    });
  }
});


FlowRouter.route('/trendingvideos', {
  name: "trendingvideos",
  action: function(params, queryParams) {
    Session.set("currentMenu", 5)
    Session.set("pageTitle", 'Trending Videos')
    BlazeLayout.render('masterLayout', {
      main: "trendingvideos",
      nav: "nav",
    });
  }
});

FlowRouter.route('/newvideos', {
  name: "newvideos",
  action: function(params, queryParams) {
    Session.set("currentMenu", 6)
    Session.set("pageTitle", 'New Videos')
    BlazeLayout.render('masterLayout', {
      main: "newvideos",
      nav: "nav",
    });
  }
});



FlowRouter.route('/watchlater', {
  name: "watchlater",
  action: function(params, queryParams) {
    Session.set("currentMenu", 7)
    Session.set("pageTitle", 'Watch Later')
    BlazeLayout.render('masterLayout', {
      main: "watchlater",
      nav: "nav",
    });
  }
});

FlowRouter.route('/history', {
  name: "history",
  action: function(params, queryParams) {
    Session.set("currentMenu", 8)
    Session.set("pageTitle", 'History')
    BlazeLayout.render('masterLayout', {
      main: "history",
      nav: "nav",
    });
  }
});

FlowRouter.route('/t/:tag', {
  name: "tags",
  action: function(params, queryParams) {
    BlazeLayout.render('masterLayout', {
      main: "tags",
      nav: "nav"
    });
    Videos.getVideosByTags(1, [params.tag], Session.get('tagDays'), Session.get('tagSortBy'), 'desc', Session.get('tagDuration'), function(err, response) {
      // call finished
    })
    Videos.getVideosByTags(2, [params.tag], Session.get('tagDays'), Session.get('tagSortBy'), 'desc', Session.get('tagDuration'), function(err, response) {
      // call finished
    })
    Videos.getVideosByTags(3, [params.tag], Session.get('tagDays'), Session.get('tagSortBy'), 'desc', Session.get('tagDuration'), function(err, response) {
      // call finished
    })
    Session.set('askSteemCurrentPage', 3)
  }
});

FlowRouter.route('/v/:author/:permlink', {
  name: "video",
  action: function(params, queryParams) {
    BlazeLayout.render('masterLayout', {
      main: "video",
      nav: "nav"
    });
    Template.video.loadState()
    // Videos.getVideosByBlog(params.author, 100, function() {
    //   // call finished
    // })
    Videos.getVideosRelatedTo(params.author, params.permlink, 7, function() {
      // call finished
    })
    SubCounts.loadSubscribers(params.author)
    Session.set('replyingTo', {
      author: params.author,
      permlink: params.permlink
    })
    Template.player.init()
  }
});

FlowRouter.route('/login', {
  name: "login",
  action: function(params, queryParams) {
    Session.set("pageTitle", 'Login')
    BlazeLayout.render('masterLayout', {
      main: "login",
      nav: "nav",
    });
  }
});

FlowRouter.route('/sc2login', {
  name: "sc2login",
  action: function(params, queryParams) {
    var trick = setInterval(function() {
      console.log(queryParams, Waka)
      var expires_at = new Date(); 
      queryParams.expires_at = new Date(expires_at .getTime() + queryParams.expires_in*1000);
      if (!Waka.db.Users) return
      Waka.db.Users.upsert(queryParams, function() {
        Users.remove({})
        Users.refreshLocalUsers()
        Session.set('activeUsername', queryParams.username)
        Videos.loadFeed(queryParams.username)
        FlowRouter.go('#!/')
      })
      clearInterval(trick)
    }, 100)
    
  }
});

FlowRouter.route('/s/:query', {
  name: "search",
  action: function(params, queryParams) {
    BlazeLayout.render('masterLayout', {
      main: "search",
      nav: "nav"
    });
  }
});

FlowRouter.notFound = {
  action: function() {
    BlazeLayout.render('masterLayout', {
      main: "pageNotFound",
      nav: "nav",
    });
  }
};
