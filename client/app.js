import './buffer';
import steem from 'steem'
//import hive from '@hiveio/hive-js'

// Meteor does not support the module hot reload code used in updateOperations() for
// HF24 transition, so a minified version will have to be used until post HF24. 
// lib/hive.js is automatically imported by Meteor, so no manual import is needed here.
// Minified code from https://cdn.jsdelivr.net/npm/@hiveio/hive-js@0.8.4/dist/hive.min.js

console.log('Starting DTube APP')

FlowRouter.wait();
Meteor.startup(function(){
  console.log('DTube APP Started')

  window.hive = hive
  window.steem = steem
  Session.set('remoteSettings', Meteor.settings.public.remote)

  // choose steem api on startup
  if(!localStorage.getItem('steemAPI')
  || Meteor.settings.public.remote.APINodes.indexOf(localStorage.getItem('steemAPI')) === -1)
    steem.api.setOptions({ url: Meteor.settings.public.remote.APINodes[0], useAppbaseApi: true}); //Default
  else
    steem.api.setOptions({ url: localStorage.getItem('steemAPI'), useAppbaseApi: true }); //Set saved API.

  // configure hive options
  let hiveoptions = {
    useAppbaseApi: true,
    rebranded_api: true,
    alternative_api_endpoints: Meteor.settings.public.remote.HiveAPINodes
  }
  if (!localStorage.getItem('hiveAPI')
  || Meteor.settings.public.remote.HiveAPINodes.indexOf(localStorage.getItem('hiveAPI')) === -1)
    hiveoptions.url = Meteor.settings.public.remote.HiveAPINodes[0]
  else
    hiveoptions.url = localStorage.getItem('hiveAPI')

  hive.utils.autoDetectApiVersion().then((r) => {
    hiveoptions.rebranded_api = r.rebranded_api
    hive.api.setOptions(hiveoptions)
    hive.broadcast.updateOperations()
  })

  Session.set('steemAPI', steem.api.options.url)
  Session.set('hiveAPI',hiveoptions.url)
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
  else
    Session.set('nsfwSetting', 'Fully Hidden')

  if (localStorage.getItem("censorSetting"))
    Session.set('censorSetting', localStorage.getItem("censorSetting"))
  else
    Session.set('censorSetting', 'Fully Hidden')

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

  // detect build javascript hash
  var scripts = document.getElementsByTagName("script")
  var sources = []
  for (let i = 0; i < scripts.length; i++)
    if (scripts[i].src.length > 0)
      sources.push(scripts[i].src)
  
  if (sources.length == 1)
    Session.set('buildVersion', sources[0].split('/')[sources[0].split('/').length-1].substr(0, 8))
  else Session.set('buildVersion', 'dev')

  // airdrop eligible detection
  Session.set('isEligibleAirdrop', false)
  var airdropChecker = setInterval(function() {
    if (!Session.get('activeUsername') || !Session.get('activeUsernameSteem'))
      return
    $.get( "https://signup.d.tube/airdrop-eligible/"+Session.get('activeUsernameSteem'), function( res ) {
      if (res && res.eligible)
        Session.set('isEligibleAirdrop', res.eligible)
      clearInterval(airdropChecker)
    });
  }, 5000)
})
