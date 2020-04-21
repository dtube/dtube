import { Template } from "meteor/templating";

FlowRouter.route('/', {
  name: "home",
  action: function(params, queryParams) {
    Session.set("pageTitle", '')
    Session.set("currentMenu", 1)
    Template.sidebar.selectMenu();
    BlazeLayout.render('masterLayout', {
      main: "home",
      nav: "nav",
    });
  }
});

FlowRouter.route('/publish', {
  name: "addvideo",
  action: function(params, queryParams) {
    Session.set("currentMenu", 3)
    Template.sidebar.selectMenu();
    Session.set("pageTitle", 'Add a video')
    Template.sidebar.selectMenu();
    BlazeLayout.render('masterLayout', {
      main: "addvideo",
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
    Session.set("currentMenu", 12)
    Template.sidebar.selectMenu();
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

FlowRouter.route('/v/:author/:permlink', {
  name: "video",
  action: function(params, queryParams) {
    Session.set('urlNet','')
    Session.set('allNet', [])
    Meteor.isDMCA(params.author, params.permlink, function(block) {
      if (block==0) {
        BlazeLayout.render('masterLayout', {
          main: "video",
          nav: "nav"
        });
        $('html').animate({ scrollTop: 0 }, 'slow');//IE, FF
        $('body').animate({ scrollTop: 0 }, 'slow');
        setTimeout(function(){Template.video.activatePopups()}, 1000)
        Template.player.rendered()
      } else FlowRouter.go('/')
    })

    Template.sidebar.empty()

    Template.video.loadState()
    ChainUsers.fetchNames([params.author], function (error) {
      if (error) console.log('Error fetch name')
    })
    Session.set("currentMenu", 0)
    Session.set('isReplying', null)
    Template.sidebar.selectMenu();
  }
});

FlowRouter.route('/c/:author', {
  name: "channel",
  action: function(params, queryParams) {
    Session.set("pageTitle", params.author + '\'s channel')
    
    if (Session.get('avalonOnboarding'))
      Session.set('avalonOnboarding', false)
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
      BlazeLayout.render('masterLayout', {
        main: "channel",
        nav: "nav"
      });
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
    Session.set('tagCount',0)
    Videos.getVideosByTags(1, [params.tag], Session.get('tagDays'), Session.get('tagSortBy'), 'desc', Session.get('tagDuration'), 0, function(err, response) {})
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
