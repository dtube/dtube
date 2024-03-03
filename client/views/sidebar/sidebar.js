Template.sidebar.rendered = function() {
    Template.settingsdropdown.nightMode();
    Template.sidebar.selectMenu();
}

Template.sidebar.events({
    'click .dtubesidebarmenu': function() {
        if (/Mobi/.test(navigator.userAgent)) {
            Template.sidebar.empty()
        } else {
            Template.sidebar.half()
        }
    },
})

Template.sidebar.resetActiveMenu = function() {
    $('#homesidebarmenu').removeClass('activemenu')
    $('#channelsidebarmenu').removeClass('activemenu')
    $('#feedsidebarmenu').removeClass('activemenu')
    $('#trendingsidebarmenu').removeClass('activemenu')
    $('#watchagainsidebarmenu').removeClass('activemenu')
    $('#uploadsidebarmenu').removeClass('activemenu')
    $('#hotsidebarmenu').removeClass('activemenu')
    $('#newsidebarmenu').removeClass('activemenu')
    $('#watchlatersidebarmenu').removeClass('activemenu')
    $('#golivesidebarmenu').removeClass('activemenu')
    $('#livesidebarmenu').removeClass('activemenu')
    $('#electionsidebarmenu').removeClass('activemenu')
    $('#settingssidebarmenu').removeClass('activemenu')
    $('#helpsidebarmenu').removeClass('activemenu')
    Template.settingsdropdown.nightMode();
}

Template.sidebar.selectMenu = function() {
    Template.sidebar.resetActiveMenu()
    switch (Session.get('currentMenu')) {
        case 1:
            $('#homesidebarmenu').addClass('activemenu')
            break;
        case 2:
            $('#channelsidebarmenu').addClass('activemenu')
            break;
        case 3:
            $('#uploadsidebarmenu').addClass('activemenu')
            break;
        case 4:
            $('#hotsidebarmenu').addClass('activemenu')
            break;
        case 5:
            $('#trendingsidebarmenu').addClass('activemenu')
            break;
        case 6:
            $('#newsidebarmenu').addClass('activemenu')
            break;
        case 7:
            $('#watchlatersidebarmenu').addClass('activemenu')
            break;
        case 8:
            $('#watchagainsidebarmenu').addClass('activemenu')
            break;
        case 9:
            $('#golivesidebarmenu').addClass('activemenu')
            break;
        case 10:
            $('#livesidebarmenu').addClass('activemenu')
            break;
        case 11:
            $('#dtalksidebarmenu').addClass('activemenu')
            break;
        case 12:
            $('#electionsidebarmenu').addClass('activemenu')
            break;
        case 13:
            $('#settingssidebarmenu').addClass('activemenu')
            break
        case 14:
            $('#helpsidebarmenu').addClass('activemenu')
            break
        case 15:
            $('#feedsidebarmenu').addClass('activemenu')
        default:
            break;
    }
}

Template.sidebar.half = function() {
    $('#sidebar').css("z-index", 10)
    $('.pusher').attr('style', 'transform: translate3d(105px, 0, 0) !important;')
    $("#sidebar")
        .sidebar('setting', 'dimPage', false)
        .sidebar('setting', 'closable', true)
        .sidebar('show')
}

Template.sidebar.full = function() {
    $('.pusher').attr('style', 'transform: translate3d(212px, 0, 0) !important')
    $("#sidebar")
        .sidebar('setting', 'dimPage', false)
        .sidebar('setting', 'closable', true)
        .sidebar('show')
}

Template.sidebar.empty = function() {
    $('.pusher').attr('style', '')
    $("#sidebar").sidebar('hide')
}

Template.sidebar.mobile = function() {
    $('.pusher').attr('style', 'transform: translate3d(0px, 0, 0) !important')
    $("#sidebar")
        .sidebar('setting', 'dimPage', true)
        .sidebar('setting', 'closable', true)
        .sidebar('toggle')
}