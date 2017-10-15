Template.sidebar.rendered = function() {
  $("#sidebar").sidebar('setting', 'dimPage', false).sidebar('setting', 'closable', false)
  .sidebar('setting', 'transition', 'overlay').sidebar('toggle') 
  Template.sidebar.OnSidebarToogled();
  $('.item .ui .avatar .image')
  .visibility({
    type       : 'image',
    transition : 'fade in',
    duration   : 1000
  })
;
}

Template.sidebar.helpers({
  activeUser: function() {
    return Session.get('activeUsername')
  }
});


Template.sidebar.helpers({
  subscribe: function() {
    return Subs.find({follower: Session.get('activeUsername')}).fetch()
  }
});

Template.sidebar.helpers({
  watchAgain: function() {
    return Videos.find({source: 'wakaArticles'}, {limit: Session.get('remoteSettings').loadLimit}).fetch()
  }
})

Template.sidebar.OnSidebarToogled = function() {
  $('main').removeClass('mainsided').addClass('main');
          $(".ui.sidebar").sidebar('setting', 'onShow', function() {
          if($(window).innerWidth() > 1280) {
            $('main').addClass('mainsided').removeClass('main');
          }
          else {
            $('main').removeClass('mainsided').addClass('main');
          }
        })
        $(".ui.sidebar").sidebar('setting', 'onHide', function() {
          if($(window).innerWidth() > 1280) {
            $('main').removeClass('mainsided').addClass('main');
          }
          else {
            $('main').removeClass('mainsided').addClass('main');
          }
        })
}

Template.sidebar.events({
  'click #help': function(event, instance) { 
  $('.ui.modal').modal('show')
  }
});

menu = {};

// ready event
menu.ready = function() {

  // selector cache
  var
    $menuItem = $('.menu a.item, .menu .link.item'),
    // alias
    handler = {
      activate: function() {
        $(this)
        .addClass('active')
        .closest('.ui.menu')
        .find('.item')
        .not($(this))
        .removeClass('active');
      }
    }
  ;

  $menuItem
    .on('click', handler.activate)
  ;

};


// attach ready event
$(document).ready(menu.ready);