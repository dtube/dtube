import './buffer';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import wakajs from 'wakajs';
import steem from 'steem';
import Gun from 'gun';
import KonamiCode from 'konami-code';

console.log('Starting DTube APP')

FlowRouter.wait();
Meteor.startup(function(){
  console.log('DTube APP Started')
  var konami = new KonamiCode();
  konami.listen(function() {
    // ??
  })

  window.steem = steem
  window.testgun=Gun({peers:["https://guntest.herokuapp.com/gun"],localStorage:!1});
  window.testgun.get("test").on(function(t){testgun.count=(testgun.count||0)+1});
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

  // dark mode (buggy)
  // if (!UserSettings.get('isInNightMode'))
  //   UserSettings.set('isInNightMode', true)

  // load language
  loadDefaultLang(function() {
    loadLangAuto(function() {
      console.log('Loaded languages')
      // start router
      FlowRouter.initialize({hashbang: true}, function() {
        console.log('Router initialized')
      });
      // handle manual fragment change
      $(window).on('hashchange', function() {
        FlowRouter.go(window.location.hash)
      });
    })
  })

  toastr.options = {
    "closeButton": true,
    "debug": false,
    "newestOnTop": true,
    "progressBar": true,
    "positionClass": "toast-bottom-right",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
  }

  if (Session.get('remoteSettings').warning)
    toastr.warning(Session.get('remoteSettings').warning, translate('WARNING_TITLE'))

  firstLoad = setInterval(function() {
    if (!Videos) return
    if (!Waka) return
    // loading home data
    Videos.refreshBlockchain(function() {
      Videos.refreshWaka()
    })
    clearInterval(firstLoad)
  }, 50)

  // steem.api.getDynamicGlobalProperties(function(err, result) {
  //   if (result)
  //   Session.set('steemGlobalProp', result)
  // })

  // Market.getSteemPrice()
  // Market.getSteemDollarPrice()

  // loading remote settings -- disabled
  // steem.api.getAccounts(['dtube'], function(err, result) {
  //   if (!result || !result[0]) return
  //   var jsonMeta = JSON.parse(result[0].json_metadata)
  //   if (jsonMeta.remoteSettings) {
  //     //Session.set('remoteSettings', jsonMeta.remoteSettings)
  //     if (jsonMeta.remoteSettings.upldr) {
  //       var rand = jsonMeta.remoteSettings.upldr[Math.floor(Math.random() * jsonMeta.remoteSettings.upldr.length)];
  //       Session.set('upldr', rand)
  //     }
  //   }
  // });


  // JS IPFS node
  // $.getScript('js/ipfs.js', function(){
  //   console.log('IPFS loaded')
  //   const repoPath = 'dtube-'+String(Math.random())
  //
  //   const node = new Ipfs({
  //     repo: repoPath,
  //     config: {
  //       Addresses: {
  //         Swarm: [
  //           '/libp2p-webrtc-star/dns4/star-signal.cloud.ipfs.team/wss'
  //         ]
  //       },
  //       Bootstrap: [
  //         "/ip4/127.0.0.1/tcp/9999/ws/ipfs/QmYRokUHWByetfpdcaaVJLrJpPtYUjXX78Ce5SSWNmFfxg"
  //       ]
  //     },
  //     init: true,
  //     start: true,
  //     EXPERIMENTAL: {
  //       pubsub: false
  //     }
  //   })
  //
  //   // expose the node to the window, for the fun!
  //   window.ipfs = node
  //
  //   node.on('ready', () => {
  //     console.log('Your node is ready to use')
  //   })
  // });

  //window.localIpfs = IpfsApi(Session.get('remoteSettings').uploadNodes[Session.get('remoteSettings').uploadNodes.length-1].node)
  // setInterval(function() {
  //   try {
  //     localIpfs.repo.stat(function(e,r) {
  //       if (e) {
  //         Session.set('localIpfs', false)
  //         return;
  //       }
  //       Session.set('localIpfs', r)
  //
  //       // using local gateway seems to make my internet very unstable and nothing works
  //       // Session.set('ipfsGateway', Session.get('remoteSettings').displayNodes[Session.get('remoteSettings').displayNodes.length - 1])
  //     })
  //   } catch(e) {
  //
  //   }
  //
  // }, 10000)

})
