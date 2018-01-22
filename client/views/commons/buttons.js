Template.buttonsubscribe.helpers({
    subCount: function () {
      var subCount = SubCounts.findOne({ account: FlowRouter.getParam("author") })
      if (!subCount || !subCount.follower_count) return 0
      return subCount.follower_count;
    }
  })

  Template.buttonunsubscribe.helpers({
    subCount: function () {
      var subCount = SubCounts.findOne({ account: FlowRouter.getParam("author") })
      if (!subCount || !subCount.follower_count) return 0
      return subCount.follower_count;
    }
  })

  Template.buttoneditprofile.helpers({
    user: function () {
        return {
          name: FlowRouter.getParam("author")
        }
      }
  })