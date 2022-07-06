import { Template } from "meteor/templating";

FlowRouter.route('/', {
    name: "home",
    action: function(params, queryParams) {
        Session.set("pageTitle", '')
        Session.set("currentMenu", 1)
        Session.set('currentNonLoginPath', FlowRouter._current.path)
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
        Session.set("pageTitle", 'Add a video')
        Session.set('currentNonLoginPath', FlowRouter._current.path)
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
        Session.set('currentNonLoginPath', FlowRouter._current.path)
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
        Template.sidebar.selectMenu();
        Session.set("pageTitle", 'Trending Videos')
        Session.set('currentNonLoginPath', FlowRouter._current.path)
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
        Session.set('currentNonLoginPath', FlowRouter._current.path)
        BlazeLayout.render('masterLayout', {
            main: "newvideos",
            nav: "nav",
        });
    }
});

FlowRouter.route('/feed/:username', {
    name: "feed",
    action: function(params, queryParams) {
        // todo
        Session.set("currentMenu", 15)
        Template.sidebar.selectMenu();
        Session.set("pageTitle", 'Feed for @'+FlowRouter.getParam('username'))
        Session.set('currentNonLoginPath', FlowRouter._current.path)
        BlazeLayout.render('masterLayout', {
            main: "feed",
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
        Session.set('currentNonLoginPath', FlowRouter._current.path)
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
        Session.set('currentNonLoginPath', FlowRouter._current.path)
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
        console.log(FlowRouter._current.path)
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

FlowRouter.route('/election', {
    name: "election",
    action: function(params, queryParams) {
        avalon.getLeaders(function(err, res) {
            Session.set('leaders', res)
        })
        Session.set("pageTitle", 'Vote for DTube Leaders')
        Session.set("currentMenu", 12)
        Session.set('currentNonLoginPath', FlowRouter._current.path)
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
        Session.set('currentNonLoginPath', FlowRouter._current.path)
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
        Session.set('urlNet', '')
        Session.set('allNet', [])
        Meteor.isDMCA(params.author, params.permlink, function(block) {
            if (block == 0) {
                BlazeLayout.render('masterLayout', {
                    main: "video",
                    nav: "nav"
                });
                $('html').animate({ scrollTop: 0 }, 'slow'); //IE, FF
                $('body').animate({ scrollTop: 0 }, 'slow');
                setTimeout(function() { Template.video.activatePopups() }, 1000)
                Template.player.rendered()
            } else FlowRouter.go('/')
        })

        Template.sidebar.empty()

        Template.video.loadState()
        ChainUsers.fetchNames([params.author], function(error) {
            if (error) console.log('Error fetch name')
        })
        Session.set("currentMenu", 0)
        Session.set('isReplying', null)
        Session.set('currentNonLoginPath', FlowRouter._current.path)
        Template.sidebar.selectMenu();
    }
});

FlowRouter.route('/v/:author/:permlink/votes', {
    name: "votes",
    action: function(params, queryParams) {
        BlazeLayout.render('masterLayout', {
            main: "votes",
            nav: "nav"
        });
        $('html').animate({ scrollTop: 0 }, 'slow'); //IE, FF
        $('body').animate({ scrollTop: 0 }, 'slow');
        var videos = Videos.find({
            'author': FlowRouter.getParam("author"),
            'link': FlowRouter.getParam("permlink")
        }).fetch()
        if (!videos || videos.length == 0)
            Template.video.loadState()
        Session.set("currentMenu", 0)
        Session.set('currentNonLoginPath', FlowRouter._current.path)
    }
});

FlowRouter.route('/c/:author', {
    name: "channel",
    action: function(params, queryParams) {
        Session.set("pageTitle", params.author + '\'s channel')
        Session.set('currentNonLoginPath', FlowRouter._current.path)
        Session.set('currentTab', 'videos');
        if (Session.get('activeUsername') == params.author) {
            Session.set("currentMenu", 2)
            Template.sidebar.selectMenu();
        } else {
            Session.set("currentMenu", 0)
            Template.sidebar.selectMenu();
        }
        ChainUsers.fetchNames([params.author], function(error) {
            if (error) console.log('Error fetch name')
            BlazeLayout.render('masterLayout', {
                main: "channel",
                nav: "nav"
            });
        })
    }
});

FlowRouter.route('/c/:author/:tab', {
    name: "channel",
    action: function(params, queryParams) {
        Session.set("pageTitle", params.author + '\'s channel')
        Session.set('currentTab', params.tab);
        Session.set('currentNonLoginPath', FlowRouter._current.path)
        if (Session.get('activeUsername') == params.author) {
            Session.set("currentMenu", 2)
            Template.sidebar.selectMenu();
        } else {
            Session.set("currentMenu", 0)
            Template.sidebar.selectMenu();
        }
        ChainUsers.fetchNames([params.author], function(error) {
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
        Session.set('tagCount', 0)
        Videos.getVideosByTags(1, [params.tag], Session.get('tagDays'), Session.get('tagSortBy'), 'desc', Session.get('tagDuration'), 0, function(err, response) {})
        Session.set("currentMenu", 0)
        Template.sidebar.selectMenu();
        Session.set('askSteemCurrentPage', 3)
        Session.set('currentNonLoginPath', FlowRouter._current.path)
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
        Session.set('currentNonLoginPath', FlowRouter._current.path)
        Template.sidebar.selectMenu();
    }
});

FlowRouter.route('/wiki/:page', {
    name: "wiki",
    action: function(params, queryParams) {
        Session.set('wikiContent', '# Loading wiki page...')
        BlazeLayout.render('masterLayout', {
            main: "wiki",
            nav: "nav"
        })
        Session.set("currentMenu", 14)
        Session.set('currentNonLoginPath', FlowRouter._current.path)
        Template.sidebar.selectMenu()
        Template.wiki.load()
    }
});

FlowRouter.route('/settings', {
  name: "settings",
  action: function(params, queryParams) {
    BlazeLayout.render('masterLayout', {
      main: "settings",
      nav: "nav"
    })
    Session.set("currentMenu", 13)
    Session.set('currentNonLoginPath', FlowRouter._current.path)
    Template.sidebar.selectMenu()
  }
});

FlowRouter.route('/wiki/:folder/:page', {
  name: "wiki",
  action: function(params, queryParams) {
    Session.set('wikiContent', '# Loading wiki page...')
    Session.set('currentNonLoginPath', FlowRouter._current.path)
    BlazeLayout.render('masterLayout', {
      main: "wiki",
      nav: "nav"
    })
    Session.set("currentMenu", 14)
    Template.sidebar.selectMenu()
    Template.wiki.load()
  }
});

FlowRouter.route('/farm', {
    name: "farm",
    action: function(params, queryParams) {
        BlazeLayout.render('masterLayout', {
          main: "farm",
          nav: "nav"
        })
        Session.set("pageTitle", 'Farm')
        Session.set("currentMenu", 0)
        Session.set('currentNonLoginPath', FlowRouter._current.path)
        let autoUpdater = setInterval(function() {
            if (FlowRouter.current().route.name != 'farm')
              clearInterval(autoUpdater)
            metamask.update()
        }, 10000)
    }
})

FlowRouter.route('/coin', {
    name: "coin",
    action: function(params, queryParams) {
        BlazeLayout.render('masterLayout', {
          main: "coin",
          nav: "nav"
        })
        Session.set("pageTitle", 'DTube Coin')
        Session.set("currentMenu", 0)
        Session.set('currentNonLoginPath', FlowRouter._current.path)
        javalon.getSupply(function(err, res) {
            Session.set('coinSupply', res.total)
        })
    }
})

FlowRouter.notFound = {
    action: function() {
        BlazeLayout.render('masterLayout', {
            main: "pageNotFound",
            nav: "nav",
        });
        Session.set("pageTitle", translate('ERROR_PAGE_NOT_FOUND'))
    }
};