import { Template } from "meteor/templating";

FlowRouter.route('/', {
  name: "home",
  action: function(params, queryParams) {
    Session.set("pageTitle", '')
    Session.set("currentMenu", 1)
    Template.sidebar.selectMenu();
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

FlowRouter.route('/upload', {
  name: "upload",
  action: function(params, queryParams) {
    Session.set("currentMenu", 3)
    Template.sidebar.selectMenu();
    Session.set("pageTitle", 'Upload')
    Template.sidebar.selectMenu();
    BlazeLayout.render('masterLayout', {
      main: "upload",
      nav: "nav",
    });
  }
});

FlowRouter.route('/golive', {
  name: "golive",
  action: function(params, queryParams) {
    Session.set("currentMenu", 9)
    Template.sidebar.selectMenu();
    Session.set("pageTitle", 'Go Live')
    Template.sidebar.selectMenu();
    BlazeLayout.render('masterLayout', {
      main: "golive",
      nav: "nav",
    });
  }
});

FlowRouter.route('/hotvideos', {
  name: "hotvideos",
  action: function(params, queryParams) {
    Session.set("currentMenu", 4)
    Template.sidebar.selectMenu();
    Session.set("pageTitle", 'Hot Videos')
    BlazeLayout.render('masterLayout', {
      main: "hotvideos",
      nav: "nav",
    });
  }
});

FlowRouter.route('/dtalk', {
  name: "dtalk",
  action: function(params, queryParams) {
    Session.set("pageTitle", 'DTalk');
    Session.set("currentMenu", 11)
    Template.sidebar.selectMenu();
    ChainUsers.fetchNames([Session.get('activeUsername')], function(){})
    BlazeLayout.render('masterLayout', {
      main: "dtalk",
      nav: "nav",
    });
  }
});

FlowRouter.route('/dtalk/:pub', {
  name: "pm",
  action: function(params, queryParams) {
    DTalk.getThread(params.pub)
    if (DTalk.findOne({pub: params.pub}))
      ChainUsers.fetchNames([DTalk.findOne({pub: params.pub}).alias.username], function(){})
    Session.set("pageTitle", 'Private Message');
    Session.set("currentMenu", 11)
    Template.sidebar.selectMenu();
    BlazeLayout.render('masterLayout', {
      main: "pm",
      nav: "nav",
    });
  }
});

FlowRouter.route('/trendingvideos', {
  name: "trendingvideos",
  action: function(params, queryParams) {
    Session.set("currentMenu", 5)
    Template.sidebar.selectMenu();
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
    Template.sidebar.selectMenu();
    Session.set("pageTitle", 'New Videos')
    // Videos.getVideosBy('createdLive', 50, function (err) {
    //   if (err) console.log(err)
    // })
    BlazeLayout.render('masterLayout', {
      main: "newvideos",
      nav: "nav",
    });
  }
});

FlowRouter.route('/live', {
  name: "livestreams",
  action: function(params, queryParams) {
    Session.set("currentMenu", 10)
    Template.sidebar.selectMenu();
    Session.set("pageTitle", 'Live Streams')
    BlazeLayout.render('masterLayout', {
      main: "livestreams",
      nav: "nav",
    });
  }
});

FlowRouter.route('/watchlater', {
  name: "watchlater",
  action: function(params, queryParams) {
    Session.set("currentMenu", 7)
    Template.sidebar.selectMenu();
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
    Template.sidebar.selectMenu();
    Session.set("pageTitle", 'History')
    BlazeLayout.render('masterLayout', {
      main: "history",
      nav: "nav",
    });
  }
});

FlowRouter.route('/login', {
  name: "login",
  action: function(params, queryParams) {
    Session.set("pageTitle", 'Login')
    Session.set("currentMenu", 0)
    Template.sidebar.selectMenu();
    BlazeLayout.render('masterLayout', {
      main: "login",
      nav: "nav",
    });
  }
});

FlowRouter.route('/login/:network', {
  name: "login",
  action: function(params, queryParams) {
    Session.set("pageTitle", 'Login')
    Session.set("currentMenu", 0)
    Template.sidebar.selectMenu();
    if (FlowRouter.getParam('network') == 'dtube')
      $("#dtube-tab").click()
    if (FlowRouter.getParam('network') == 'steem')
      $("#steem-tab").click()
    BlazeLayout.render('masterLayout', {
      main: "login",
      nav: "nav",
    });
  }
});

FlowRouter.route('/onboarding', {
  name: "onboarding",
  action: function(params, queryParams) {
    Session.set("pageTitle", 'Join DTube Chain')
    BlazeLayout.render('masterLayout', {
      main: "onboarding",
      nav: "nav",
    });
  }
});

FlowRouter.route('/newaccount', {
  name: "newaccount",
  action: function(params, queryParams) {
    Session.set("pageTitle", 'Refer a friend')
    BlazeLayout.render('masterLayout', {
      main: "newaccount",
      nav: "nav",
    });
  }
});

FlowRouter.route('/election', {
  name: "election",
  action: function(params, queryParams) {
    avalon.getLeaders(function(err, res){
      Session.set('leaders', res)
    })
    Session.set("pageTitle", 'Vote for DTube Leaders')
    BlazeLayout.render('masterLayout', {
      main: "election",
      nav: "nav",
    });
  }
});

FlowRouter.route('/newaccount', {
  name: "newaccount",
  action: function(params, queryParams) {
    Session.set("pageTitle", 'New Account')
    Session.set("currentMenu", 0)
    Template.sidebar.selectMenu();
    BlazeLayout.render('masterLayout', {
      main: "newaccount",
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
        Users.refreshLocalUsers(function(){})
        Template.loginsteem.success(queryParams.username)
      })
      clearInterval(trick)
    }, 100)

  }
});

FlowRouter.route('/v/:author/:permlink', {
  name: "video",
  action: function(params, queryParams) {
    // Meteor.isDMCA(params.author, params.permlink, function(block) {
    //   if (block==0) {
        BlazeLayout.render('masterLayout', {
          main: "video",
          nav: "nav"
        });
        $('html').animate({ scrollTop: 0 }, 'slow');//IE, FF
        $('body').animate({ scrollTop: 0 }, 'slow');
        setTimeout(function(){Template.video.activatePopups()}, 1000)
    //   } else FlowRouter.go('/')
    // })

    Template.sidebar.empty()

    Template.video.loadState()
    // Videos.getVideosByBlog(params.author, 100, function() {
    //   // call finished
    // })
    // SubCounts.loadSubscribers(params.author)
    ChainUsers.fetchNames([params.author], function (error) {
      if (error) console.log('Error fetch name')
    })
    Session.set('replyingTo', {
      author: params.author,
      permlink: params.permlink
    })
    Session.set("currentMenu", 0)
    Template.sidebar.selectMenu();
    Template.player.init()
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
    Videos.getVideosByBlog(params.author, 50, function(err) {
      if (err) console.log(err)
    })
    //SubCounts.loadSubscribers(params.author)
    Session.set('currentTab', 'videos');
    if(Session.get('activeUsername') == params.author)
    {
      Session.set("currentMenu", 2)
      Template.sidebar.selectMenu();
    }
    else
    {
      Session.set("currentMenu", 0)
      Template.sidebar.selectMenu();
    }
    ChainUsers.fetchNames([params.author], function (error) {
      if (error) console.log('Error fetch name')
    })
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
    // Videos.getVideosByTags(2, [params.tag], Session.get('tagDays'), Session.get('tagSortBy'), 'desc', Session.get('tagDuration'), function(err, response) {
    //   // call finished
    // })
    // Videos.getVideosByTags(3, [params.tag], Session.get('tagDays'), Session.get('tagSortBy'), 'desc', Session.get('tagDuration'), function(err, response) {
    //   // call finished
    // })
    Session.set("currentMenu", 0)
    Template.sidebar.selectMenu();
    Session.set('askSteemCurrentPage', 3)
  }
});

FlowRouter.route('/s/:query', {
  name: "search",
  action: function(params, queryParams) {
    BlazeLayout.render('masterLayout', {
      main: "search",
      nav: "nav"
    });
    Session.set("currentMenu", 0)
    Template.sidebar.selectMenu();
  }
});

FlowRouter.notFound = {
  action: function() {
    BlazeLayout.render('masterLayout', {
      main: "pageNotFound",
      nav: "nav",
    });
    Session.set("pageTitle", translate('ERROR_PAGE_NOT_FOUND'))
  }
};
