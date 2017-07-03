FlowRouter.route('/', {
  name: "home",
  action: function(params, queryParams) {
    BlazeLayout.render('masterLayout', {
      main: "home",
      nav: "nav",
    });
  }
});

FlowRouter.route('/login', {
  name: "login",
  action: function(params, queryParams) {
    BlazeLayout.render('masterLayout', {
      main: "login",
      nav: "nav",
    });
  }
});

FlowRouter.route('/settings', {
  name: "settings",
  action: function(params, queryParams) {
    BlazeLayout.render('masterLayout', {
      main: "settings",
      nav: "nav",
    });
  }
});

FlowRouter.route('/upload', {
  name: "upload",
  action: function(params, queryParams) {
    BlazeLayout.render('masterLayout', {
      main: "upload",
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
