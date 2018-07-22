import Gun from 'gun/gun';
import SEA from 'gun/sea';
import timegraph from 'gun/lib/time';
var xss = require("xss");
// TODO IMPORTANT
window.gun = window.gun || Gun('https://gun.dtube.top/gun');

DTalk = new Mongo.Collection(null)
DTalkObserver = new PersistentMinimongo2(DTalk, 'dtalk');
Messages = new Mongo.Collection(null)

DTalk.login = function(cb) {
    var account = Users.findOne({username: Session.get('activeUsername')});
    if (!account.publickey || !account.privatekey) {
        cb('requires to be logged in with steem and posting key')
    }
    var name = account.username+'@'+account.publickey+'@steem'
    var user = gun.user()
    var key = account.privatekey
    if (user.is) {
        cb('a gun user is already logged in')
        return
    }
    
    user.auth(name, key, function(ack){
        if(!ack.err){ 
            //profile(account)
            cb(null, ack)
            return
        }
        user.create(name, key, function(ack){
            if(ack.err){
                cb("Couldn't create gun account");
                return;
            }
            user.auth(name, key, function(ack){
                if(!ack.err){
                    //profile(account)
                    cb(null, ack)
                    return
                }
                cb('Created gun account but couldnt auth')
            });
        });
    });
}

DTalk.logout = function() {
    gun.user().auth()
}

DTalk.checkInbox = function() {
    var user = gun.user()
    if (!user.is)
        return
    var pair = user.pair()
    if(!pair || !pair.pub)
        return 
    gun.get('@'+pair.pub).time(list, {last: 99});
    //user.get('who').get('tmp').get('outbox').map().on(outbox);
}

DTalk.sendMessageToKey = async function(what, receiverPubKey) {
    if (!what || !receiverPubKey)
        return

    var user = gun.user()
    var to = gun.user(receiverPubKey)
    var pair = user.pair()
    var epub = await to.get('epub').then()
    var sec = await Gun.SEA.secret(epub, pair); // Diffie-Hellman
    var enc = await Gun.SEA.encrypt(what, sec);
    var mask = await Gun.SEA.work(receiverPubKey, sec)
    var when = await Gun.SEA.encrypt(Gun.state(), sec);
    // 1
    user.get('who').get('say').get('to').get(mask).get(when).put(enc);
    var once = await Gun.SEA.pair();
    var tell = await Gun.SEA.encrypt({
      pub: await Gun.SEA.sign(pair.pub, pair) 
    }, await Gun.SEA.secret(epub, once));
    // 2
    gun.get('@'+receiverPubKey).time(tell, once.epub);

    // 3 lightweight fix for "outbox" updating
    // user.get('who').get('tmp').get('outbox')
    //     .get(outbox.fill(receiverPubKey))
    //     .put(await Gun.SEA.encrypt(receiverPubKey, pair));
}

DTalk.getThread = async function(pub) {
    console.log('getting thread for: '+pub)
    var sec = await DTalk.getSecret(pub)
    var alias = await gun.user(pub).get('alias').then()
    if (alias)
        alias = parseIdentity(alias)
    if (!DTalk.findOne({pub: pub})) {
        DTalk.insert({
            pub: pub,
            alias: alias,
            sec: sec
        })
    }
    var user = gun.user()
    var to = gun.user(pub)
    
    var mask = Gun.SEA.work(pub, sec)
    var me = Gun.SEA.work(user.pair().pub, sec);
    thread.pub = pub
    to.get('who').get('say').get('to').get(await me).map().once(thread, {wait:1});
    user.get('who').get('say').get('to').get(await mask).map().once(thread.me, {wait:1});
}

DTalk.getSecret = async function(pub) {
    var user = gun.user()
    var to = gun.user(pub)
    var epub = await to.get('epub').then();
    var sec = await Gun.SEA.secret(epub, user.pair()); // Diffie-Hellman
    return sec
}

DTalk.decrypt = async function(message, sec) {
    // decrypting the message
    Gun.SEA.decrypt(message.msg, sec).then(function(msgdec) {
        message.msgdec = msgdec
        Messages.update({_id: message._id}, message)
    })
}

async function list(data, key, time){
  var user = gun.user();
  if(!user.is){ return }
  var dh = await Gun.SEA.secret(key, user.pair());
  if(!dh){ return }
  var hear = await Gun.SEA.decrypt(data, dh);
  if(!hear){ return }
  console.log('hear', hear)
  if(hear.pub){
    senderPublicKey = await Gun.SEA.verify(hear.pub, await Gun.SEA.verify(hear.pub, false));
    var sec = await DTalk.getSecret(senderPublicKey)
    
    var alias = await gun.user(senderPublicKey).get('alias').then()
    if (alias)
        alias = parseIdentity(alias)
    if (!DTalk.findOne({pub: senderPublicKey}))
        DTalk.insert({
            pub: senderPublicKey,
            alias: alias,
            sec: sec
        })
  }
}

async function thread(msg, id, me){
    var sec = DTalk.findOne({pub: thread.pub}).sec
    var id = await Gun.SEA.decrypt(id, sec);
    if(!id){ return }
    //var what = (msg||{}).what || msg || ''; // why ?
    //var enc = (Gun.obj.ify(msg.replace('SEA{','{'))||{}).ct;
    //var time = new Date(id);
    if (Messages.findOne({
        pub: thread.pub,
        id: id
    })) return
    Messages.insert({
        id: id,
        pub: thread.pub,
        msg: msg,
        me: me
    })
}
thread.me = function(msg, id){
    thread(msg, id, true);
}

function parseIdentity(alias) {
    if (alias.split('@').length != 3) {
        return {
            username: '',
            pubKey: '',
            network: ''
        }
    }
    var identity = {
        username: alias.split('@')[0],
        pubKey: alias.split('@')[1],
        network: alias.split('@')[2]
    }

    switch (identity.network) {
        case 'steem':
            identity.avatar = 'https://steemitimages.com/u/'+identity.username+'/avatar/small'
            break;
    
        default:
            break;
    }

    return identity
}

// async function outbox(pub, key, msg){
//     // temporary lightweight solution until we think of something better.
//     var user = gun.user();
//     if(!user.is){ return }
//     var now = (msg.via && msg.via.put && Gun.state.is(msg.via.put, key));// || Gun.state()
//     var pair = user.pair();
//     pub = await Gun.SEA.decrypt(pub, pair);
//     if(!pub){ return }
//     //group({pub: pub}, key, now);
// }
// outbox.fill = function(pub){
//     if(outbox[pub]){ return outbox[pub] }
//     return outbox[pub] = Gun.text.random(1, 'abcdefghijklmnopqrstuvwxyz');
// }

// async function send(e){
//     e.preventDefault();
//     var $say = $('.m-talk .m-say'), what = $say.text();
//     if(!what || what === send.a || what === send.b){ return }
//     send.a = what;
//     var pub = $('.m-talk .m-pub').val(), user = gun.user();
//     if(!pub || !user.is){ return }
//     $say.text('');
//     var pair = user.pair();
//     var to = gun.user(pub), epub = await to.get('epub').then();
//     var sec = await Gun.SEA.secret(epub, pair); // Diffie-Hellman
//     var enc = await Gun.SEA.encrypt(what, sec);
//     //$say.text(send.b = Gun.obj.ify(enc.replace('SEA{','{')).ct);
//     var mask = await Gun.SEA.work(pub, sec), when = await Gun.SEA.encrypt(Gun.state(), sec);
//     user.get('who').get('say').get('to').get(mask).get(when).put(enc);
//     var once = await Gun.SEA.pair();
//     var tell = await Gun.SEA.encrypt({
//       pub: await Gun.SEA.sign(pair.pub, pair) 
//     }, await Gun.SEA.secret(epub, once));
//     gun.get('@'+pub).time(tell, once.epub);
  
//     // lightweight fix for "outbox" updating
//     user.get('who').get('tmp').get('outbox')
//       .get(outbox.fill(pub)).put(await Gun.SEA.encrypt(pub, pair));
//   }

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