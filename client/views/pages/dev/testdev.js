Template.testdev.rendered = function() {
    
}

Template.testdev.events({
    'click #loadScreen': function() {
        var element = document.getElementById('devVideo');
        if (element)
            element.parentNode.removeChild(element);
    

        var testUrl = "https://player.d.tube/btfs/QmYb8hiJyUYhhe24u4GTRi4dGhvbSm4yR57AFdpgzDP3Qp"
        var video = document.createElement("video");
        video.autoplay = true
        video.controls = true
        video.width = 480
        video.id = 'devVideo'
        
        // var source = document.createElement("source"); 
        // source.type = "video/mp4";
        // source.src = testgun._.graph.test.video
        var source = document.createElement("source"); 
        source.type = "video/webm";
        source.src = testgun._.graph.test.screen

        video.appendChild(source)
        document.getElementById('dev').appendChild(video)

    }
})