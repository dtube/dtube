Template.channel.rendered = function() {
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
          try {
            Videos.upsert({_id: videos[i]._id}, videos[i])
          } catch(err) {
            console.log(err)
          }
        }
    } else {
        console.log(err);
    }
  });
}

Template.channel.helpers({
  user: function() {
    return {
      name: FlowRouter.getParam("author")
    }
  },
  userVideos: function() {
    if (Videos.find({'info.author': FlowRouter.getParam("author"), source: 'chainByBlog'}).fetch().length >= 1)
    {
      // document.getElementById("channeltitle").textContent = "Videos by ";
      return Videos.find({'info.author': FlowRouter.getParam("author"), source: 'chainByBlog'}).fetch();
    }
    else
    {
      // document.getElementById("channeltitle").innerText = "There is no videos from ";
    }
  }
})