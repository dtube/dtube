import './buffer';
import steem from 'steem'
import hive from '@hiveio/hive-js'
import blurt from '@blurtfoundation/blurtjs'

console.log('Starting DTube APP')

FlowRouter.wait();
Meteor.startup(function(){
  console.log('DTube APP Started')

  window.hive = hive
  window.steem = steem
  window.blurt = blurt
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
    alternative_api_endpoints: Meteor.settings.public.remote.HiveAPINodes
  }
  if (!localStorage.getItem('hiveAPI')
  || Meteor.settings.public.remote.HiveAPINodes.indexOf(localStorage.getItem('hiveAPI')) === -1)
    hiveoptions.url = Meteor.settings.public.remote.HiveAPINodes[0]
  else
    hiveoptions.url = localStorage.getItem('hiveAPI')
  hive.api.setOptions(hiveoptions)

  // choose blurt api on startup
  let blurtoptions = {
    useAppbaseApi: true,
    alternative_api_endpoints: Meteor.settings.public.remote.BlurtAPINodes
  }
  if (!localStorage.getItem('blurtAPI')
  || Meteor.settings.public.remote.BlurtAPINodes.indexOf(localStorage.getItem('blurtAPI')) === -1)
    blurtoptions.url = Meteor.settings.public.remote.BlurtAPINodes[0]
  else
    blurtoptions.url = localStorage.getItem('blurtAPI')
  blurt.api.setOptions(blurtoptions)

  Session.set('steemAPI', steem.api.options.url)
  Session.set('hiveAPI',hiveoptions.url)
  Session.set('blurtAPI',blurtoptions.url)
  Session.set('lastHot', null)
  Session.set('lastTrending', null)
  Session.set('lastCreated', null)
  Session.set('lastBlogs', {})
  Session.set('tagDays', 7)
  Session.set('tagSortBy', null)
  Session.set('tagDuration', 999999)
  Session.set('scot', Meteor.settings.public.scot)

  // load local storage settings (video visibility)
  if (localStorage.getItem("nsfwSetting") && !isNaN(parseInt(localStorage.getItem("nsfwSetting"))))
    Session.set('nsfwSetting', localStorage.getItem("nsfwSetting"))
  else
    Session.set('nsfwSetting', 2)

  if (localStorage.getItem("censorSetting") && !isNaN(parseInt(localStorage.getItem("censorSetting"))))
    Session.set('censorSetting', localStorage.getItem("censorSetting"))
  else
    Session.set('censorSetting', 1)

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
    Session.set('buildVersion', sources[0].split('/')[sources[0].split('/').length-1].slice(0, 8))
  else Session.set('buildVersion', 'dev')

  // get DTUBE price from coingecko
  let url = "https://api.coingecko.com/api/v3/simple/price?ids=dtube-coin&vs_currencies=usd"
  $.get(url, function( data ) {
    Session.set('coinPrice', data["dtube-coin"]["usd"])
  });

  // ethereum metamask
  if (window.ethereum)
    Session.set('hasMetamask', true)
})
