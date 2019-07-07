// controls the page title display

Deps.autorun(function(){
  var title = Meteor.settings.public.appName
  if (Session.get('scot') && Session.get('scot').websiteTitle)
    title = Session.get('scot').websiteTitle
    
  if (!Session.get("pageTitle") || typeof Session.get("pageTitle") === 'undefined' || Session.get("pageTitle").length == 0) {
    if (typeof Meteor.settings.public.appName === 'undefined')
      return
    document.title = title
    return
  }

  document.title = " "+Session.get("pageTitle")
    + " "
    + Meteor.settings.public.pageTitleSeparator
    + " "
    + title;
});

setTimeout(function() {
  if (window.steem_keychain && !Session.get('steem_keychain'))
    Session.set('steem_keychain', true)
}, 500)
