Template.channel.rendered = function () {
  if (Template.channel.isOnMobile)
  {
    alert("on mobile");
  }
  else
  {
    $(".ui.sidebar").sidebar('show');
  }
  // loading contents from user from blockchain
  var query = {
    tag: FlowRouter.getParam("author"),
    limit: 100

  };
  steem.api.getDiscussionsByBlog(query, function (err, result) {
    if (err === null) {
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
        try {
          Videos.upsert({ _id: videos[i]._id }, videos[i])
        } catch (err) {
          console.log(err)
        }
      }
    } else {
      console.log(err);
    }
  });
}

Template.channel.helpers({
  user: function () {
    return {
      name: FlowRouter.getParam("author")
    }
  },
  isOnMobile: function () {
    if (/Mobi/.test(navigator.userAgent)) { 
        return true;
    }
  },
  userVideos: function () {
    return Videos.find({ 'info.author': FlowRouter.getParam("author"), source: 'chainByBlog' }).fetch()
  },
  userResteems: function () {
    var videos = Videos.find({ source: 'chainByBlog', fromBlog: FlowRouter.getParam("author") }).fetch()

    var resteems = []
    for (var i = 0; i < videos.length; i++) {
      if (videos[i].author != FlowRouter.getParam("author"))
        resteems.push(videos[i])
    }

    return resteems
  }
})