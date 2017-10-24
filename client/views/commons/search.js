Template.search.helpers({
  search: function () {
    return Session.get('search')
  },
  isOnMobile: function () {
    if (/Mobi/.test(navigator.userAgent)) {
      return true;
    }
  }
})

Template.search.onRendered(function () {
  if (!Session.get('search')) {
    $('#dsearch').val(FlowRouter.getParam("query"))
    $('.searchForm').submit()
  }
});
