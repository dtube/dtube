let timeUpdateInterval
let timeStartCountdown

Template.nobandwidthmodal.updateCountdown = function() {
    function updateTime() {
        var missingBytes = Session.get('missingBytes')
        var balance = Users.findOne({username: Session.get('activeUsername')}).balance
        var timeNeeded = missingBytes*36000000/balance
        timeNeeded -= (new Date().getTime() - timeStartCountdown)
        $('#nobandwidthtime')[0].innerHTML = msToTime(timeNeeded)
    }
    timeStartCountdown = new Date().getTime()
    updateTime()
    timeUpdateInterval = setInterval(updateTime, 3000)
}

Template.nobandwidthmodal.helpers({
    missingBytes: function() {
        return Session.get('missingBytes')
    },
    userBalance: function() {
        if (Users.findOne({username: Session.get('activeUsername')}))
            return Users.findOne({username: Session.get('activeUsername')}).balance
        else return 0
    }
})

Template.nobandwidthmodal.events({
    'click #closePopup': function() {
        $('.nobandwidth').hide()
        clearInterval(timeUpdateInterval)
    }
})

function msToTime(duration) {
    let seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
  
    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
  
    return hours + "h " + minutes + "m " + seconds + 's'
}