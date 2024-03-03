// always increment this id when changing message in production
var messageId = 5

Template.announcement.rendered = function() {
    if (!localStorage.getItem('lastAnnouncementRead') || localStorage.getItem('lastAnnouncementRead') < messageId)
        $('.announcement').parent().show()   

    $('.announcement .close').on('click', function() {
        $(this).closest('.message').transition('fade')
        localStorage.setItem('lastAnnouncementRead', messageId)
    })
}