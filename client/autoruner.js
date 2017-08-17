// controls the page title display

Deps.autorun(function(){
  if (!Session.get("pageTitle") || typeof Session.get("pageTitle") === 'undefined' || Session.get("pageTitle").length == 0) {
    if (!Meteor || !Meteor.settings || !Meteor.settings.public || !Meteor.settings.public.appName) {
      document.title = 'DTube'
      return
    }
    document.title = Meteor.settings.public.appName
    return
  }

  document.title = " "+Session.get("pageTitle")
    + " "
    + Meteor.settings.public.pageTitleSeparator
    + " "
    + Meteor.settings.public.appName;
});
