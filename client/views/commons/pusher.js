Template.pusher.helpers({
    isOnMobile: function () {
        if (/Mobi/.test(navigator.userAgent)) {
            return true;
        }
    }
});

Template.pusher.rendered = function () {
    Template.pusher.setScreenMode();
    $(window).on('resize', Template.pusher.setScreenMode)
}

Template.pusher.setScreenMode = function () {
    if ($(window).width() < 992) {
        $('.ui.maingrid').removeClass('computergrid').addClass('tabletgrid').removeClass('grid').removeClass('container');
    }
    else {
        $('.ui.maingrid').addClass('computergrid').addClass('grid').addClass('container');
    }
}
