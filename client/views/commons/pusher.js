Template.pusher.helpers({
    checkIfMobile: function () {
        if (/Mobi/.test(navigator.userAgent)) {
            return true;
        }
    }
});
