Template.socialactivity.rendered = function () {
  $('.items .image img')
    .visibility({
      type: 'image',
      transition: 'fade in',
      duration: 1000
    });
}

Template.socialactivity.helpers({
  getTitle: function (author, permlink) {
    var video = Videos.findOne({ 'info.author': author, 'info.permlink': permlink })
    if (video) return video.info.title;
  },
  getSnap: function (author, permlink) {
    var video = Videos.findOne({ 'info.author': author, 'info.permlink': permlink })
    if (video)
      return "https://ipfs.io/ipfs/" + video.info.snaphash;
  },
  user: function () {
    return {
      name: FlowRouter.getParam("author")
    }
  },
  getTitleFromChain: function (author, permlink) {
    var content = Videos.getContent(author, permlink, false, false)
    return
  }
})
