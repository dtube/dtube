// import Gun from 'gun/gun';
// import SEA from 'gun/sea';
// //import timegraph from 'gun/lib/time';
// window.gun = window.gun || Gun('https://gungame.herokuapp.com/gun');


// Messenger = new Mongo.Collection(null)

// Messenger.createGunKey = function(name, cb, r) {
//     var account = Users.findOne({username: Session.get('activeUsername')});
//     // if(!account || !account.privatekey){
//     //     if(r > 25){ return }
//     //     // apparently Session is ready but User isn't?
//     //     setTimeout(function(){
//     //     steemGUN(name, cb, (r || 0) + 1);
//     //     }, 200);
//     //     return;
//     // }
//     name += '@steem'
//     var user = gun.user()
//     var key = account.privatekey
//     if(user.is){
//         return cb && cb();
//     }
//     user.auth(name, key, function(ack){
//         if(!ack.err){ 
//             profile(account)
//             return cb && cb(ack);
//         }
//         user.create(name, key, function(ack){
//             if(ack.err){
//                 toastr.error("We could not create a private messaging system for you.");
//                 return;
//             }
//             user.auth(name, key, cb);
//         });
//     });
// }

// //var xss = require("xss");


//   //console.log("open.");
// //   init();
// //   upgrade(inbox);

// function init(){
//   if(0 === location.host.indexOf('localhost')){
//     //window.gun = window.gun || Gun('http://localhost:8080/gun'); // COMMENT OUT THIS LINE BEFORE COMMITTING OR PUSHING!!!!
//     window.gun = window.gun || Gun('https://gungame.herokuapp.com/gun'); // COMMENT OUT THIS LINE BEFORE COMMITTING OR PUSHING!!!!
//   }
//   window.gun = window.gun || Gun();
// }

// function inbox(){
//   var user = gun.user();
//   if(!user.is){ return }
//   var pair = user.pair();
//   //console.log("inbox!");
//   if(!pair || !pair.pub){ return }
//   gun.get('@'+pair.pub).time(list, {last: 99});
//   user.get('who').get('tmp').get('outbox').map().on(outbox);
// }

// function search(){
//   clearTimeout(search.debounce);
//   clearTimeout(search.err);
//   search.debounce = setTimeout(function(){
//     var $query = $(".m-search input"), name = ($query.val()||'').toLowerCase();
//     var alias = 'alias/' + name + '@steem';
//     if(name === search.last){ return }
//     var $ul = $('.m-search').find('.m-list').empty();
//     if(!(search.last = name)){ return }
//     search.err = setTimeout(function(){
//       toastr.error("Cannot find user, they may not have added DTalk yet.");
//     }, 2200);
//     gun.get(alias).once().map().once(async function(pub){
//       clearTimeout(search.err);
//       if(name != $query.val()){ return }
//       var $li = $contact.clone(true);
//       $li.find('.m-pub').val(pub.pub);
//       $li.find('.m-to').text(xss((pub.alias||'').replace('@steem','')));
//       $ul.append($li);
//       var tmp = {
//         given: this.get('who').get('name').then(),
//         face: this.get('who').get('face').then()
//       }
//       $li.find('.m-to').text(xss(await tmp.given) || $li.find('.m-to').text());
//       $li.find('.avatar').attr('src', await tmp.face || profile.face);
//     });
//   }, 350);
// }

// function click(e){
//   e.preventDefault();
//   $('.m-search .m-contact').first().trigger('click');
// }

// async function chat(){
//   var $act = $(this);
//   var pub = $act.find('.m-pub').val();
//   if(!pub){ return }
//   var $chat = $('.m-chat');
//   $chat.show().find('.m-pub').val(pub);
//   $chat.find('.m-list').empty();
//   $('.m-search input').first().val('').trigger('keyup');
//   //$('.m-say').focus();
//   var to = gun.user(pub), who = to.get('who');
//   var tmp = {
//     alias: to.get('alias').then(),
//     name: who.get('name').then(),
//     face: who.get('face').then()
//   }
//   var user = gun.user();
//   if(!user.is){
//     toastr.error("Something went wrong, please login again.");
//     return;
//   }
//   var epub = await to.get('epub').then();
//   var sec = thread.dec = await Gun.SEA.secret(epub, user.pair()); // Diffie-Hellman
//   var mask = Gun.SEA.work(pub, sec), me = Gun.SEA.work(user.pair().pub, sec);
//   to.get('who').get('say').get('to').get(await me).map().once(thread, {wait:1});
//   user.get('who').get('say').get('to').get(await mask).map().once(thread.me, {wait:1});
//   $chat.find('.m-to').text(xss(await tmp.name || (await tmp.alias||'').replace('@steem', '')));
//   $chat.find('.avatar').attr('src', await tmp.face || profile.face);
// }

// function type(e){
//   if(e.keyCode === 13){
//     return send(e);
//   }
// }

// async function send(e){
//   e.preventDefault();
//   var $say = $('.m-talk .m-say'), what = $say.text();
//   if(!what || what === send.a || what === send.b){ return }
//   send.a = what;
//   var pub = $('.m-talk .m-pub').val(), user = gun.user();
//   if(!pub || !user.is){ return }
//   $say.text('');
//   var pair = user.pair();
//   var to = gun.user(pub), epub = await to.get('epub').then();
//   var sec = await Gun.SEA.secret(epub, pair); // Diffie-Hellman
//   var enc = await Gun.SEA.encrypt(what, sec);
//   //$say.text(send.b = Gun.obj.ify(enc.replace('SEA{','{')).ct);
//   var mask = await Gun.SEA.work(pub, sec), when = await Gun.SEA.encrypt(Gun.state(), sec);
//   user.get('who').get('say').get('to').get(mask).get(when).put(enc);
//   var once = await Gun.SEA.pair();
//   var tell = await Gun.SEA.encrypt({
//     pub: await Gun.SEA.sign(pair.pub, pair) 
//   }, await Gun.SEA.secret(epub, once));
//   gun.get('@'+pub).time(tell, once.epub);

//   // lightweight fix for "outbox" updating
//   user.get('who').get('tmp').get('outbox')
//     .get(outbox.fill(pub)).put(await Gun.SEA.encrypt(pub, pair));
// }

// async function thread(msg, id, me){
//   var dec = thread.dec, id = await Gun.SEA.decrypt(id, dec);
//   if(!id){ return }
//   var $ul = $('.m-chat .m-list'), $last = sort(id, $ul.children('li').last());
//   var $li = $("#msg-" + id)[0]; // grab if exists
//   if(!$li){
//     $li = $('.m-model .m-said').clone(true) // else create it
//       .attr('id', 'msg-' + id);
//     $li.insertAfter($last[0] || $li.appendTo($ul));
//   }
//   $li = $($li);
//   if(me){
//     $li.addClass('m-me');
//   }
//   //$li.find('.who').text(msg.who);
//   var what = (msg||{}).what || msg || '';
//   var enc = (Gun.obj.ify(what.replace('SEA{','{'))||{}).ct;
//   $li.find('.m-what').text(xss(enc));
//   var time = new Date(id);
//   $li.find('.m-when').text(time.toDateString() + ', ' + time.toLocaleTimeString());
//   var $chat = $('.m-chat');
//   $('html, body').stop(true, true).animate({scrollTop: $chat.height() + $chat.offset().top - $(window).height() });
//   what = Gun.SEA.decrypt(what, dec);
//   setTimeout(async function(){
//     $li.find('.m-what').text(xss(await what))
//   }, 250);
// }
// thread.me = function(msg, id){
//   thread(msg, id, true);
// }

// function sort(id, li, by, top){
//   var num = parseFloat(id);
//   li = $(li)
//   if(by){
//     id = li.find(by).text() || -Infinity;
//   } else {
//     id = (li.attr('id')||'').replace('msg-','') || -Infinity;
//   }
//   var at = num >= parseFloat(id);
//   return at ? li : sort(id, top? li.next() : li.prev(), by, top);
// }

// async function list(data, key, time){
//   var user = gun.user();
//   if(!user.is){ return }
//   var dh = await Gun.SEA.secret(key, user.pair());
//   if(!dh){ return }
//   var hear = await Gun.SEA.decrypt(data, dh);
//   if(!hear){ return }
//   if(hear.pub){
//     hear.pub = await Gun.SEA.verify(hear.pub, await Gun.SEA.verify(hear.pub, false));
//     if(!hear.pub){ return }
//     group(hear, key, time);
//   }
//   //console.log("list:", hear, time);
// }

// async function group(data, key, time){
//   if(!data.pub){ return }
//   var from = gun.user(data.pub);
//   var $ul = $('.m-inbox .m-list');
//   if($ul.children().length > 9){ $('.more-inbox').show() }
//   $top = sort(time, $ul.children('li').first(), '.m-time', true);
//   var id = xss(data.pub.replace('.',''));
//   var $li = $("#who-" + id)[0]; // grab if exists
//   if(!$li){
//     $li = $('.m-model .m-contact').clone(true) // else create it
//       .attr('id', 'who-' + id);
//   }
//   $li = $($li);
//   if(time <= parseFloat($li.find('.m-time').text())){ return }
//   $li.find('.m-pub').val(data.pub);
//   $li.find('.m-time').text(time);
//   $li.insertBefore($top[0] || $li.appendTo($ul));

//   var time = new Date(time);
//   time = time.toLocaleTimeString().split(':');
//   time[1] += time[2].slice(-3);
//   time.pop();
//   $li.find('.m-peek').text(time.join(':'));

//   var $av = $li.find('.avatar');
//   if(!$av.attr('src')){
//     $av.attr('src', await from.get('who').get('face').then() || profile.face);
//   }
//   var $name = $li.find('.m-to');
//   if(!$name.text()){
//     $name.text(xss(await from.get('who').get('name').then()
//       || (await from.get('alias').then()||'').replace('@steem', '')
//     ));
//   }
// }

// async function outbox(pub, key, msg){
//   // temporary lightweight solution until we think of something better.
//   var user = gun.user();
//   if(!user.is){ return }
//   var now = (msg.via && msg.via.put && Gun.state.is(msg.via.put, key));// || Gun.state()
//   var pair = user.pair();
//   pub = await Gun.SEA.decrypt(pub, pair);
//   if(!pub){ return }
//   group({pub: pub}, key, now);
// }
// outbox.fill = function(pub){
//   if(outbox[pub]){ return outbox[pub] }
//   return outbox[pub] = Gun.text.random(1, 'abcdefghijklmnopqrstuvwxyz');
// }

// function close(){
//   $('.m-chat').hide();
// }

// function upgrade(cb, r){
//   //console.log('upgrade');
//   init();
//   var name = Session.get('activeUsername');
//   if(!name){
//     if(r > 5){
//       if(cb && cb.call){
//         toastr.error("Something went wrong, please login again.");
//       }
//       return;
//     }
//     // apparently Session is ready but User isn't?
//     setTimeout(function(){
//       upgrade(cb, (r || 0) + 1);
//     }, 400);
//     return;
//   }
//   steemGUN(name, function(){
//     $(document).off('click', upgrade);
//     cb && cb.call && cb();
//   });
// }
// $(document).on('click', upgrade);

// function steemGUN(name, cb, r){
//   var account = Users.findOne({username: name});
//   if(!account || !account.privatekey){
//     if(r > 25){ return }
//     // apparently Session is ready but User isn't?
//     setTimeout(function(){
//       steemGUN(name, cb, (r || 0) + 1);
//     }, 200);
//     return;
//   }
//   name = name+'@steem';
//   var user = gun.user(), key = account.privatekey;
//   if(user.is){
//     return cb && cb();
//   }
//   user.auth(name, key, function(ack){
//     if(!ack.err){ 
//       profile(account)
//       return cb && cb(ack);
//     }
//     user.create(name, key, function(ack){
//       if(ack.err){
//         //toastr.error("We could not create a private messaging system for you.");
//         return;
//       }
//       user.auth(name, key, cb);
//     });
//   });
// }

// function profile(data){
//   var user = gun.user();
//   if(!user.is || !data
//   || !(data = data.json_metadata)
//   || !(data = data.profile)){ 
//     return;
//   }
//   var save = {};
//   if(data.profile_image){
//     save.face = data.profile_image;
//   }
//   if(data.name){
//     save.name = data.name;
//   }
//   if(save.name || save.face){
//     user.get('who').put(save);
//   }
// }
// profile.face = 'https://steemitimages.com/u/thinkexperiment/avatar/';

// var $contact;