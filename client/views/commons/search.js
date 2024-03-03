Template.search.helpers({
  search: function () {
    return Session.get('search')
  },
  moreThan20: function () {
    let searchr = Session.get('search')
    if (searchr.response === undefined) {
      return false
    }
    return searchr.response.hits.total.value > 20
  }
})

Template.search.onRendered(function () {
  if (!Session.get('search')) {
    $('#dsearch').val(FlowRouter.getParam("query"))
    $('.searchForm').submit()
    Template.sidebar.resetActiveMenu()
    Template.settingsdropdown.nightMode();
  }
});

Template.search.events({
  'click .morebtn': () => {
    // Load more
    let newres = Session.get('search')
    Search.text(newres.query,null,newres.response.results.length,function(err,res) {
      newres.response.results = newres.response.results.concat(res.results)
      Session.set('search',newres)

      // Hide more button if all results are already shown
      if (newres.response.results.length === res.hits.total.value) {
        $('#moresearchres').hide()
      }
    })
    
  }
})