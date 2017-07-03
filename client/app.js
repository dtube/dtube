import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import wakajs from 'wakajs';
import steem from 'steem';

Meteor.startup(function(){

  Waka.connect({
		"host": "steemwhales.com",
		"port": 3456,
		"path": "/peerjs",
		"debug": false
	})

  window.steem = steem;

  $.getScript('js/ipfs.js', function(){
    console.log('IPFS loaded')
    const repoPath = 'dtube-'+String(Math.random())

    const node = new Ipfs({
      repo: repoPath,
      config: {
        Addresses: {
          Swarm: [
            '/libp2p-webrtc-star/dns4/star-signal.cloud.ipfs.team/wss'
          ]
        },
        Bootstrap: [
          "/ip4/127.0.0.1/tcp/9999/ws/ipfs/QmYRokUHWByetfpdcaaVJLrJpPtYUjXX78Ce5SSWNmFfxg"
        ]
      },
      init: true,
      start: true,
      EXPERIMENTAL: {
        pubsub: false
      }
    })

    // expose the node to the window, for the fun!
    window.ipfs = node

    node.on('ready', () => {
      console.log('Your node is ready to use')
    })
  });

  $.getScript('js/ipfs-api.js', function(){
    console.log('IPFS API loaded')
  });



  Waka.api.Emitter.on('peerchange', listener = function(){
    Videos.refreshWaka()
  })
  Waka.api.Emitter.on('newshare', listener = function(article){
    Videos.refreshWaka()
  })
})
