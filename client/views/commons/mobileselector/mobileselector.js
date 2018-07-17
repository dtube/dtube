// this is a generic bottom side menu used for
// cases where normal menus cannot fit on a mobile device

Template.mobileselector.rendered = function() {
    $('.dimoverlay').on('click',  function() {
        Template.mobileselector.hideMenus();
    })
}

Template.mobileselector.helpers({
    selectortype: function () {
        return Session.get('selectortype');
    }
})

Template.mobileselector.revealMenu = function(menu) {

    $('.ui.dropdown.needsclick').dropdown('hide');


    $('.dt.dimoverlay').addClass('dtopen');
    switch (menu) {
        case 'bottom':
            $('.dt.drawer.bottom').addClass('dtopen');
            break;
        default:
    }
}

Template.mobileselector.hideMenus = function() {
    $('.dt.drawer.bottom').removeClass('dtopen');
    $('.dt.dimoverlay').removeClass('dtopen');
}
