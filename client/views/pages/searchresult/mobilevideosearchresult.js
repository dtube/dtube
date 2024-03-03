Template.mobilevideosearchresult.rendered = function () {
  $(this.firstNode.nextSibling).find('img').visibility({
    type       : 'image',
    transition : 'fade in',
    duration   : 1000
  })
    Template.settingsdropdown.nightMode();
}