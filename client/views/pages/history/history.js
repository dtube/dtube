Template.history.rendered = function () {
  console.log("history loaded")
  $("#sidebar").sidebar('show');
  $('.dtube').removeClass('loading');
};

Template.history.helpers({
  watchAgain: function () {
    return Videos.find({ source: 'wakaArticles' }, { limit: 100 }).fetch()
  },
  isOnMobile: function () {
    if (/Mobi/.test(navigator.userAgent)) { 
        return true;
    }
  }
})

