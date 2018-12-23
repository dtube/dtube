  Template.buttoneditprofile.helpers({
    user: function () {
        return {
          name: FlowRouter.getParam("author")
        }
      }
  })