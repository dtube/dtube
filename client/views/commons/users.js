Template.users.rendered = function() {
  $('.dropdownusers').dropdown({
    action: function(text, value, e) {
      var e = $(e)
      console.log(value,text,e)
    }
  })
}

Template.users.helpers({
  userlist: function() {
    return Users.find()
  },
  mainUser: function() {
    return Users.findOne({username: Session.get('activeUsername')})
  }
});
