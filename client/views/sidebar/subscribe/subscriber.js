Template.subscriber.rendered = function () {
  $('.ui.avatar.image').visibility({
    type       : 'image',
    transition : 'fade in',
    duration   : 1000,
    offset:100,
    includeMargin:false,
    initialCheck:false,
    continuous : true,
    context: $('#subscriberslist') ,
    onBottomVisible: function() {
      // loads a max of 5 times
      Template.subscriber.rendered()
    }
  })
}