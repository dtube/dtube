Template.channelmobilecover.helpers({
    mainUser: function () {
      return Users.findOne({ username: Session.get('activeUsername') })
    },
    user: function () {
      return {
        name: FlowRouter.getParam("author")
      }
    },
    author: function () {
      return ChainUsers.findOne({ name: FlowRouter.getParam("author") })
    },
    activeUser: function () {
      return Session.get('activeUsername')
    },
    subCount: function () {
      var subCount = SubCounts.findOne({ account: FlowRouter.getParam("author") })
      if (!subCount || !subCount.follower_count) return 0
      return subCount.follower_count;
    },
    randomBackgroundColor: function () {
      var rnd = Math.floor(Math.random() * (5 - 1 + 1)) + 1;
      var bgcolor = ''
      switch (rnd) {
        case 1:
          bgcolor = 'channelbga';
          break;
        case 2:
          bgcolor = 'channelbgb';
          break;
        case 3:
          bgcolor = 'channelbgc';
          break;
        case 4:
          bgcolor = 'channelbgd';
          break;
        default:
          bgcolor = 'channelbge';
      }
      return bgcolor
    }
  })
