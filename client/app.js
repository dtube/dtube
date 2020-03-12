import './buffer';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
// import wakajs from 'wakajs';
import steem from 'steem';
// import Gun from 'gun';
import KonamiCode from 'konami-code';

console.log('Starting DTube APP')

FlowRouter.wait();
Meteor.startup(function(){
  console.log('DTube APP Started')
  var konami = new KonamiCode();
  konami.listen(function() {
    // ??
  })

  Market.getSaleProgress()

  window.steem = steem
  // window.testgun=Gun({peers:["https://guntest.herokuapp.com/gun"],localStorage:!1});
  // window.testgun.get("test").on(function(t){testgun.count=(testgun.count||0)+1});
  Session.set('remoteSettings', Meteor.settings.public.remote)

  // choose steem api on startup
  if(!localStorage.getItem('steemAPI'))
    steem.api.setOptions({ url: Meteor.settings.public.remote.APINodes[0], useAppbaseApi: true}); //Default
  else
    steem.api.setOptions({ url: localStorage.getItem('steemAPI'), useAppbaseApi: true }); //Set saved API.

  Session.set('steemAPI', steem.api.options.url)
  Session.set('lastHot', null)
  Session.set('lastTrending', null)
  Session.set('lastCreated', null)
  Session.set('lastBlogs', {})
  Session.set('tagDays', 7)
  Session.set('tagSortBy', null)
  Session.set('tagDuration', 999999)
  Session.set('scot', Meteor.settings.public.scot)

  // load local storage settings (video visibility)
  if (localStorage.getItem("nsfwSetting"))
    Session.set('nsfwSetting', localStorage.getItem("nsfwSetting"))

  if (localStorage.getItem("censorSetting"))
    Session.set('censorSetting', localStorage.getItem("censorSetting"))

  // dark mode (buggy)
  // if (!UserSettings.get('isInNightMode'))
  //   UserSettings.set('isInNightMode', true)

  toastr.options = {
    "closeButton": true,
    "debug": false,
    "newestOnTop": true,
    "progressBar": false,
    "positionClass": "toast-top-right",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "1000",
    "showEasing": "linear",
    "hideEasing": "linear",
    "showMethod": "slideDown",
    "hideMethod": "slideUp"
  }

  if (Session.get('remoteSettings').warning)
    toastr.warning(Session.get('remoteSettings').warning, translate('WARNING_TITLE'))

  firstLoad = setInterval(function() {
    // if (!Videos) return
    // Videos.refreshBlockchain(function() {})
    clearInterval(firstLoad)
  }, 50)
})
