Template.users.rendered = function() {
  $('.dropdownusers').dropdown({
    action: function(text, value, e) {
      var e = $(e)
      if (e.hasClass('logIn')) {
        Session.set('activeUsername', e.data('username'))
      } else if (e.hasClass('logOut')) {
        Waka.db.Users.findOne({username: e.data('username')}, function(user) {
          Waka.db.Users.remove(user._id, function(result) {
            Users.refreshUsers()
            Waka.db.Users.findOne({}, function(user) {
              if (user) Session.set('activeUsername', user.username)
              else Session.set('activeUsername', null)
            })
          })
        })
      }
    }
  })
}

Template.users.helpers({
  userlist: function() {
    return Users.find()
  },
  mainUser: function() {
    return Users.findOne({username: Session.get('activeUsername')})
  },
  activeUser: function() {
    return Session.get('activeUsername')
  }
});
