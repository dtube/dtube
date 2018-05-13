// this is a generic bottom side menu used for 
// cases where normal menus cannot fit on a mobile device

Template.mobileselector.helpers({
    selectortype: function () {
        return Session.get('selectortype');
    }
})