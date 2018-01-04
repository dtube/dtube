Template.subscriber.rendered = function () {
  //console.log()
  $(this.firstNode).find('img').visibility({
    type       : 'image',
    transition : 'fade in',
    duration   : 1000,
    context: $('#sidebar')
  })
}