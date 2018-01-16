Template.subscriber.rendered = function () {
  $(this.firstNode).find('img').visibility({
    type: 'image',
    transition: 'fade in',
    duration: 1000
  })
}