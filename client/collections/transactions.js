
Transactions = new Mongo.Collection(null)

Transactions.startListening = function () {
  steem.api.streamTransactions(function (err, result) {
    var operation = result.operations
    var notification;
    console.log(operation)
    switch (operation[0][0]) {
      case "vote":
        console.log("its a vote")
        var vote = operation[0][1]
        if (Session.get('activeUsername') == operation[0][1].author)
        {
          notification = [operation[0][0],vote.voter,vote.permlink]
          console.log("you got a vote")
        }
        break;
      case "comment":
        console.log("its a comment")
        var comment = operation[0][1]
        console.log(comment)
        if (Session.get('activeUsername') == comment.parent_author) {
          notification = [operation[0][0],comment.author,comment.parent_permlink]
          console.log("you got a comment")
        }
        break;
      case "custom_json":
        console.log("its a follow/unfollow")
        var followtype = JSON.parse(operation[0][1].json)
        if (followtype[0] == "follow") {
          console.log(followtype[1].follower + ' is following ' + followtype[1].following)
          if (Session.get('activeUsername') == followtype[1].following) {
            console.log("you got a follower")
          }
        }
        else
          break;
      default:
        console.log("its another thing")
        break;
    }
    //return notification
    //Template.notificationdropdown.addNotification(notification)
    // Transactions.upsert({ 'transaction':operation }, operation)
  })
}