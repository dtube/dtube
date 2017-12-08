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
    BlazeLayout.render('masterLayout', {
      main: "home",
      nav: "nav",
    });
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

FlowRouter.route('/upload', {
  name: "upload",
  action: function(params, queryParams) {
    if (Math.random() < 1)
    {
      Session.set("pageTitle", 'Upload')
      BlazeLayout.render('masterLayout', {
        main: "newupload",
        nav: "nav",
      });
    } else {
      Session.set("pageTitle", 'Upload')
      BlazeLayout.render('masterLayout', {
        main: "upload",
        nav: "nav",
      });
    }
  }
});

FlowRouter.route('/newupload', {
  name: "newupload",
  action: function(params, queryParams) {
    Session.set("pageTitle", 'newupload')
    BlazeLayout.render('masterLayout', {
      main: "newupload",
      nav: "nav",
    });
  }
});

FlowRouter.route('/trendingvideos', {
  name: "trendingvideos",
  action: function(params, queryParams) {
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
    Session.set("pageTitle", 'New Videos')
    BlazeLayout.render('masterLayout', {
      main: "newvideos",
      nav: "nav",
    });
  }
});

FlowRouter.route('/hotvideos', {
  name: "hotvideos",
  action: function(params, queryParams) {
    Session.set("pageTitle", 'Hot Videos')
    BlazeLayout.render('masterLayout', {
      main: "hotvideos",
      nav: "nav",
    });
  }
});

FlowRouter.route('/watchlater', {
  name: "watchlater",
  action: function(params, queryParams) {
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
    Session.set("pageTitle", 'History')
    BlazeLayout.render('masterLayout', {
      main: "history",
      nav: "nav",
    });
  }
});

FlowRouter.route('/torrentStats', {
  name: "torrentStats",
  action: function(params, queryParams) {
    Session.set("pageTitle", 'Torrent Stats')
    BlazeLayout.render('masterLayout', {
      main: "torrentStats",
      nav: "nav",
    });
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
    Videos.getVideosByBlog(params.author, 100, function() {
      // call finished
    })
    // Template.video.updateTotalVotes()
    SubCounts.loadSubscribers(params.author)
    Session.set('replyingTo', {
      author: params.author,
      permlink: params.permlink
    })
    Template.player.init()
  }
});

FlowRouter.route('/c/:author', {
  name: "channel",
  action: function(params, queryParams) {
    BlazeLayout.render('masterLayout', {
      main: "channel",
      nav: "nav"
    });
    Videos.getVideosByBlog(params.author, 100, function() {
      // call finished
    })
    SubCounts.loadSubscribers(params.author)
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
