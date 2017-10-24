Template.pusher.helpers({
    isOnMobile: function () {
        if (/Mobi/.test(navigator.userAgent)) { 
            return true;
        }
    }
    
});