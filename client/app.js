import './buffer';

import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import wakajs from 'wakajs';
import steem from 'steem';

Meteor.startup(function(){
  $.getScript('https://ipfs.io/ipfs/QmdatyQqU49jinY3wwNyYWAHXjYCLtPqXm1yYJywsdwVQ2', function(){
    console.log('IPFS API loaded')
  });

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

  // Waka.connect({
	// 	"host": "steemwhales.com",
	// 	"port": 3456,
	// 	"path": "/peerjs",
	// 	"debug": false
	// })

  window.steem = steem;

  // native IPFS node
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



  // Waka.api.Emitter.on('peerchange', listener = function(){
  //   Videos.refreshWaka()
  // })
  // Waka.api.Emitter.on('newshare', listener = function(article){
  //   Videos.refreshWaka()
  // })
})
