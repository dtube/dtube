Template.channel.rendered = function () {
  if (Template.channel.isOnMobile())
  {
    alert("on mobile");
  }
  else
  {
    $("#sidebar").sidebar('show');
  }
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
