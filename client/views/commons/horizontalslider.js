// horizontal slider is for VP in the /publish
// otherwise it's always for promoting content with DTC burn

Template.horizontalslider.rendered = function() {
    var slider = document.getElementById(this.data.sliderid)
    var holder = slider.nextSibling.nextSibling.nextSibling.nextSibling
    var bubbleholder = holder.nextSibling.nextSibling
    var mousewheelevt = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel";

    function setBubble() {
        const
            newValue = Number((slider.value - slider.min) * 100 / (slider.max - slider.min)),
            newPosition = (newValue * .932);
        holder.style.width = `calc(${100 - newPosition}% - 15px)`;
        bubbleholder.style.left = `calc(${newPosition}%)`;
    }

    function moveSlider(e) {
        var zoomLevel = parseFloat(slider.value).toFixed(1);
        if (e.originalEvent.wheelDelta < 0 || e.detail > 0) {
            //scroll down
            slider.value = Number(zoomLevel) - 1;
        } else {
            //scroll up
            slider.value = Number(zoomLevel) + 1;
        }
        var vt = (avalon.votingPower(Users.findOne({ username: Session.get('activeUsername'), network: 'avalon' })) / 100 * slider.value).toFixed(2)
        value.innerHTML = cuteNumber(vt)

        setBubble()
        return false;
    }
    var currentvalue = slider.value;
    var touchstartx = null;
    var touchmovex = null;
    var movex = null;
    var sliderWidth = slider.getBoundingClientRect().width
    slider.onmouseup = function(event) {
        currentvalue = slider.value;
        setBubble()
    }

    slider.onmousemove = function(event) {
        currentvalue = slider.value;
        setBubble()
    }

    slider.ontouchstart = function(event) {
        touchstartx =  event.touches[0].pageX
        currentvalue = Math.floor(1000*touchstartx/sliderWidth)/10
        setBubble()
    }
    slider.ontouchmove = function(event) {
        touchmovex =  event.touches[0].pageX
        currentvalue = slider.value
        setBubble()
    }
    slider.ontouchend = function(event) {
        currentvalue = slider.value;
        setBubble()
    }

    if (this.data.sliderid == 'vp-range') {
        slider.value = UserSettings.get('voteWeight')
    } else {
        slider.value = 0
    }


    setTimeout(() => {
        setBubble()
    }, 500);
    setBubble()

    
}