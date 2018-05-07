Template.messages.helpers({
  messages: function () {
    return true;
  }
})

Template.messages.rendered = function () {
  init();
  var name = Session.get('activeUsername');
  if(!name){
    FlowRouter.go('/login');
    return;
  }
  steemGUN(name, function(){
    welcome();
  });
  $('.m-search').on('submit', click)
    .find('input').first().on('keyup', search);
  $(document).on('click', '.m-contact', chat)
    .on('click', '.m-back', close)
    .on('keypress', '.m-say', type)
    .on('click', '.m-send', send);
}

function init(){
  $contact = $contact || $('.m-model .m-contact').first();
  if(window.gun){ return }
  window.gun = Gun();
}

async function welcome(){
  var user = gun.user();
  user.get('who').get('say').get('to').on(list);
}

function search(){
  clearTimeout(search.debounce);
  search.debounce = setTimeout(function(){
    var $query = $(".m-search input"), name = $query.val();
    var alias = 'alias/' + name + '@steem';
    if(name === search.last){ return }
    var $ul = $('.m-search').find('.m-list').empty();
    if(!(search.last = name)){ return }
    gun.get(alias).once().map().once(async function(pub){
      if(name != $query.val()){ return }
      var $li = $contact.clone(true);
      $li.find('.m-pub').val(pub.pub);
      $li.find('.m-to').text((pub.alias||'').replace('@steem',''));
      $ul.append($li);
      var tmp = {
        given: this.get('who').get('name').then(),
        face: this.get('who').get('face').then()
      }
      $li.find('.m-to').text(await tmp.given);
      $li.find('.avatar').attr('src', await tmp.face);
    });
  },70);
}

function click(e){
  e.preventDefault();
  $('.m-search .m-contact').first().trigger('click');
}

async function chat(){
  var $act = $(this);
  var pub = $act.find('.m-pub').val();
  if(!pub){ return }
  var $chat = $('.m-chat');
  $chat.show().find('.m-pub').val(pub);
  $chat.find('.m-list').empty();
  $('.m-search input').first().val('').trigger('keyup');
  $('.m-say').focus();
  var to = gun.user(pub), who = to.get('who');
  var tmp = {
    name: who.get('name').then(),
    face: who.get('face').then()
  }
  var user = gun.user();
  var epub = await to.get('epub').then();
  var sec = thread.dec = await Gun.SEA.secret(epub, user.pair()); // Diffie-Hellman
  var mask = Gun.SEA.work(pub, sec), me = Gun.SEA.work(user.pair().pub, sec);
  to.get('who').get('say').get('to').get(await me).map().once(thread, {wait:1});
  user.get('who').get('say').get('to').get(await mask).map().once(thread.me, {wait:1});
  $chat.find('.m-to').text(await tmp.name);
  $chat.find('.avatar').attr('src', await tmp.face);
}

function type(e){
  if(e.keyCode === 13){
    return send(e);
  }
}

async function send(e){
  e.preventDefault();
  var $say = $('.m-talk .m-say'), what = $say.text();
  if(!what || what === send.a || what === send.b){ return }
  send.a = what;
  var pub = $('.m-talk .m-pub').val(), user = gun.user();
  if(!pub || !user.is){ return }
  $say.text('');
  var to = gun.user(pub), epub = await to.get('epub').then();
  var sec = await Gun.SEA.secret(epub, user.pair()); // Diffie-Hellman
  var enc = await Gun.SEA.encrypt(what, sec);
  //$say.text(send.b = Gun.obj.ify(enc.replace('SEA{','{')).ct);
  var mask = await Gun.SEA.work(pub, sec), when = await Gun.SEA.encrypt(Gun.state(), sec);
  user.get('who').get('say').get('to').get(mask).get(when).put(enc);
  //setTimeout(function(){ $say.text('') },99);
}

async function thread(msg, id, me){
  var dec = thread.dec, id = await Gun.SEA.decrypt(id, dec);
  if(!id){ return }
  var $ul = $('.m-chat .m-list'), $last = sort(id, $ul.children('li').last());
  var $li = $("#msg-" + id)[0]; // grab if exists
  if(!$li){
    $li = $('.m-model .m-said').clone(true) // else create it
      .attr('id', 'msg-' + id);
    $li.insertAfter($last[0] || $li.appendTo($ul));
  }
  $li = $($li);
  if(me){
    $li.addClass('m-me');
  }
  //$li.find('.who').text(msg.who);
  var what = (msg||{}).what || msg || '';
  var enc = (Gun.obj.ify(what.replace('SEA{','{'))||{}).ct;
  $li.find('.m-what').text(enc);
  var time = new Date(id);
  $li.find('.m-when').text(time.toDateString() + ', ' + time.toLocaleTimeString());
  $('html, body').stop(true, true).animate({scrollTop: $('.m-chat').height()});
  what = Gun.SEA.decrypt(what, dec);
  setTimeout(async function(){ $li.find('.m-what').text(await what) }, 200);
}
thread.me = function(msg, id){
  thread(msg, id, true);
}

function sort(id, li){
  var num = parseFloat(id);
  var id = (((li = $(li)).attr('id')||'').replace('msg-','')) || -Infinity;
  var at = num >= parseFloat(id);
  return at ? li : sort(id, li.prev());
}

function close(){
  $('.m-chat').hide();
}

function steemGUN(name, cb){
  var account = Users.findOne({username: name});
  if(!account || !account.privatekey){
    FlowRouter.go('/login');
    return;
  }
  name = name+'@steem';
  var user = gun.user(), key = account.privatekey;
  user.auth(name, key, function(ack){
    if(!ack.err){ return profile(account); }
    user.create(name, key, function(ack){
      if(ack.err){
        toastr.error("We could not create a private messaging system for you.");
        return;
      }
      user.auth(name, key, cb);
    });
  });
}

function profile(data){
  var user = gun.user();
  if(!user.is || !data
  || !(data = data.json_metadata)
  || !(data = data.profile)){ 
    return;
  }
  var save = {};
  if(data.profile_image){
    save.face = data.profile_image;
  }
  if(data.name){
    save.name = data.name;
  }
  if(save.name || save.face){
    user.get('who').put(save);
  }
}

var $contact;