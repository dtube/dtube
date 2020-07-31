Template.horizontalslider.rendered = function() {
    var slider = document.getElementById(this.data.sliderid)
    var holder = document.getElementById("hsliderholder")
    var bubbleholder = document.getElementById("bubblehsliderholder")
    var mousewheelevt = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel";

    function setBubble() {
        const
            newValue = Number((slider.value - slider.min) * 100 / (slider.max - slider.min)),
            newPosition = (newValue * .97);
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
        var vt = parseFloat(Users.findOne({ username: Session.get('activeUsername'), network: 'avalon' }).vt.v / 100 * slider.value).toFixed(2)
        value.innerHTML = cuteNumber(vt)

        setBubble()
        return false;
    }
    var currentvalue = slider.value;
    slider.onmousemove = function() {
        if (slider.value != currentvalue) {
            setBubble()
            currentvalue = this.value;
        }
    }
    setTimeout(() => {
        setBubble()

    }, 500);

}