Template.subscriber.rendered = function () {
  $('.items .image img')
  .visibility({
    type       : 'image',
    transition : 'fade in',
    duration   : 1000
  });
}

Template.activity.helpers({
    getTitle: function(author,permlink) {
      var video = Videos.findOne({ 'info.author': author, 'info.permlink': permlink })
      if (video) return video.info.title;
    },
    getSnap: function(author,permlink) {
      var video = Videos.findOne({ 'info.author': author, 'info.permlink': permlink })
      if (video)
      return "https://ipfs.io/ipfs/"+video.info.snaphash;
    },
    user: function () {
      return {
        name: FlowRouter.getParam("author")
      }
    },
    content : function (author, permlink){
      var content = Videos.getContent(author,permlink,false,false)
      return
    }
  })
