Template.announcement.rendered = function() {
    $('.announcement .close').on('click', function() {
      $(this).closest('.message').transition('fade')
    })
}