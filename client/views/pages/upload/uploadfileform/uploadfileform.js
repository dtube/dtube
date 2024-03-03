var isOriginal = false
var isNsfw = false

Template.uploadfileform.rendered = function () {
  $('.ui.multiple.dropdown').dropdown({
    allowAdditions: true,
    keys: {
      delimiter: 32, // 188 (the comma) by default.
    },
    onNoResults: function (search) { }, // trick to hide no result message
    onChange: function () {
      var tags = $('#tags').val().split(",").length;
      if (tags <= 3) {
        $('.tags.alert').addClass('dsp-non')
        $('.ui.multiple.dropdown').dropdown('setting', 'allowAdditions', true);
      }
      else {
        $('.tags.alert').removeClass('dsp-non')
        $('.ui.multiple.dropdown').dropdown('setting', 'allowAdditions', false);
      }
    }
  });
  $('.menu .item').tab();
}

Template.uploadfileform.helpers({
  mainUser: function () {
    return Users.findOne({ username: Session.get('activeUsername') })
  }
})