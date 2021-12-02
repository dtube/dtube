// vertical slider is always yellow (VP)

Template.verticalvoteslider.rendered = function() {
    var voteType = this.data.voteType
    var sliderclass = this.data.sliderclass
    var slider = document.getElementById("voterange" + voteType + sliderclass);
    var bubble = document.getElementById("sliderBubble" + voteType + sliderclass)
    var holder = document.getElementById("vsliderholder" + voteType + sliderclass)
    var bubbleholder = document.getElementById("bubblevsliderholder" + voteType + sliderclass)
    var network = this.data.network

    // Undefined network for comments patch
    if (!network && this.data.isComment) {
        let idNet = this.data.content._id.split('/')[0]
        if (idNet === 'dtc')
            network = 'dtube'
        else
            network = idNet
    }

    var mousewheelevt = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel";
    if (Session.get('activeUsername') && network === 'dtube') {
        var value = document.getElementById("votevt" + voteType + sliderclass);
        var vt = (avalon.votingPower(Users.findOne({ username: Session.get('activeUsername'), network: 'avalon' })) / 100 * UserSettings.get('voteWeight')).toFixed(2)
        value.innerHTML = cuteNumber(vt)
        slider.value = UserSettings.get('voteWeight')
    }
    var resizePopup = function() { $('.ui.popup').css('max-height', $(window).height()); };

    $(window).resize(function(e) {
        resizePopup();
    });

    function setBubble() {
        const
            newValue = Number((slider.value - slider.min) * 100 / (slider.max - slider.min)),
            newPosition = (newValue * 0.815);
        if (voteType === 'up')
            bubble.innerHTML = `<span>${slider.value}%</span>`;
        else bubble.innerHTML = `<span>-${slider.value}%</span>`;
        bubble.style.bottom = `calc(${newPosition}% + 29.5px)`;
        bubble.style.left = `9px`;
        if (Session.get('activeUsername') && network === 'dtube') {
            var vt = (avalon.votingPower(Users.findOne({ username: Session.get('activeUsername'), network: 'avalon' })) / 100 * slider.value).toFixed(2)
            value.innerHTML = cuteNumber(vt)
        }
        holder.style.height = `calc(${100 - newPosition}% - 15px)`;
        bubbleholder.style.bottom = `calc(${newPosition}% + 6px)`;
    }

    function cuteNumber(num, digits) {
        if (num > 1) num = Math.round(num)
        if (typeof digits === 'undefined') digits = 2
        var units = ['K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y']
        var decimal
        var newNum = num
        for (var i = units.length - 1; i >= 0; i--) {
            decimal = Math.pow(1000, i + 1)
            if (num <= -decimal || num >= decimal) {
                newNum = +(num / decimal).toFixed(digits) + units[i]
                break
            }
        }
        var limit = (newNum < 0 ? 5 : 4)
        if (newNum.toString().length > limit && digits > 0)
            return cuteNumber(num, digits - 1)
        return newNum;
    }

    $(`.${voteType}.button.voteslider.${sliderclass}`)
        .popup({
            popup: $(`.${voteType}vote.popup.${sliderclass}`),
            on: 'click',
            lastResort: 'top center',
            position: 'top center',
            onShow: function() {
                // resizePopup();
                //$('body').first().addClass('lock-vscroll')
                $('.ui.videocontainer').bind(mousewheelevt, moveSlider);
            },
            onHide: function() {
                //$('body').first().removeClass('lock-vscroll')
                $('.ui.videocontainer').unbind(mousewheelevt, moveSlider);
            },
        })

    function moveSlider(e) {
        var zoomLevel = parseFloat(slider.value).toFixed(1);
        if (e.originalEvent.wheelDelta < 0 || e.detail > 0) {
            //scroll down
            slider.value = Number(zoomLevel) - 1;
        } else {
            //scroll up
            slider.value = Number(zoomLevel) + 1;
        }
        if (Session.get('activeUsername') && network === 'dtube') {
            var vt = (avalon.votingPower(Users.findOne({ username: Session.get('activeUsername'), network: 'avalon' })) / 100 * slider.value).toFixed(2)
            value.innerHTML = cuteNumber(vt)
        }
        setBubble()
        return false;
    }
    slider.oninput = function() {
        if (Session.get('activeUsername') && network === 'dtube') {
            var vt = (avalon.votingPower(Users.findOne({ username: Session.get('activeUsername'), network: 'avalon' })) / 100 * slider.value).toFixed(2)
            value.innerHTML = cuteNumber(vt)
        }
        setBubble()
    }
    setBubble()
}

Template.verticalvoteslider.events({

    'click .addtag': function(event) {
        $('.tagvote').removeClass('dsp-non');
        $('.simplevote').addClass('dsp-non');
    },
    'click .removetag': function(event) {
        $('.simplevote').removeClass('dsp-non');
        $('.tagvote').addClass('dsp-non');
    },

    'click .button.upvote': function(event) {
        let author = this.content.author
        let permlink = this.sliderclass
        let weight = 100
        let weightSteem = 100
        let weightHive = 100
        let weightBlurt = 100
        if (this.network === 'dtube') {
            weight = document.getElementById("voterangeup" + this.sliderclass).value * 100
            weightSteem = UserSettings.get('voteWeightSteem') * 100
            weightHive = UserSettings.get('voteWeightHive') * 100
            weightBlurt = UserSettings.get('voteWeightBlurt') * 100
        } else {
            weight = document.getElementById("voterangeup" + this.sliderclass).value * 100
            weightSteem = document.getElementById("voterangeup" + this.sliderclass).value * 100
            weightHive = document.getElementById("voterangeup" + this.sliderclass).value * 100
            weightBlurt = document.getElementById("voterangeup" + this.sliderclass).value * 100
        }
        let refs = [];
        if (this.isComment)
            if (this.content.json && this.content.json.refs) {
                refs = this.content.json.refs
                refs.push(this.content._id)
            } else {
                refs = [this.content._id]
            }
        else
            refs = Session.get('currentRefs')
        $('.ui.popup').popup('hide all');
        $('.ui.up.votesliderloader.' + this.sliderclass).removeClass('dsp-non');
        $('.ui.votebutton.voteslider.up.' + this.sliderclass).addClass('dsp-non');
        broadcast.multi.vote(refs, weight, weightSteem, weightHive, weightBlurt, '', canTipAuthor(this.content) ? 25 : -1, function(err, result) {
            if (err) Meteor.blockchainError(err, translate('GLOBAL_ERROR_COULD_NOT_VOTE'))
            else {
                toastr.success(translate('GLOBAL_ERROR_VOTE_FOR', weight / 100 + '%', author + '/' + permlink))
                    // var audio = new Audio('http://localhost:3000/DTube_files/sounds/coin-drop-1.mp3');
                    // audio.play();
            }
            $('.ui.up.votesliderloader.' + permlink).addClass('dsp-non');
            $('.ui.votebutton.voteslider.up.' + permlink).removeClass('dsp-non');
            Template.video.loadState()
        });
    },
    'click .button.downvote': function(event) {
        let author = this.content.author
        let permlink = this.sliderclass
        let weight = 100
        let weightSteem = 100
        let weightHive = 100
        if (this.network === 'dtube') {
            weight = document.getElementById("voterangedown" + permlink).value * -100
            weightSteem = UserSettings.get('voteWeightSteem') * -100
            weightHive = UserSettings.get('voteWeightHive') * -100
        } else {
            weight = document.getElementById("voterangedown" + permlink).value * -100
            weightSteem = document.getElementById("voterangedown" + permlink).value * -100
            weightHive = document.getElementById("voterangedown" + permlink).value * -100
        }
        let refs = [];
        if (this.isComment)
            if (this.content.json && this.content.json.refs) {
                refs = this.content.json.refs
                refs.push(this.content._id)
            } else {
                refs = [this.content._id]
            }
        else
            refs = Session.get('currentRefs')
        $('.ui.popup').popup('hide all');
        $('.ui.down.votesliderloader.' + permlink).removeClass('dsp-non');
        $('.ui.votebutton.voteslider.down.' + permlink).addClass('dsp-non');
        broadcast.multi.vote(refs, weight, weightSteem, weightHive, -1, '', -1, function(err, result) {
            if (err) Meteor.blockchainError(err, translate('GLOBAL_ERROR_COULD_NOT_VOTE'))
            else {
                toastr.success(translate('GLOBAL_ERROR_DOWNVOTE_FOR', weight / 100 + '%', author + '/' + permlink))
                    // var audio = new Audio('http://localhost:3000/DTube_files/sounds/coin-drop-1.mp3');
                    // audio.play();
            }
            $('.ui.down.votesliderloader.' + permlink).addClass('dsp-non');
            $('.ui.votebutton.voteslider.down.' + permlink).removeClass('dsp-non');
            Template.video.loadState()
        });
    },
    'click .button.upvotetag': function(event) {
        let newTag = $('.tagvote.up .tagvalue').val()
        let author = this.content.author
        let permlink = this.sliderclass
        let weight = 100
        let weightSteem = 100
        let weightHive = 100
        let weightBlurt = 100
        let tip = canTipAuthor(this.content) ? parseInt($('.tagvote.up .tipvalue').val()) : 0
        if (this.network === 'dtube') {
            weight = document.getElementById("voterangeup" + permlink).value * 100
            weightSteem = UserSettings.get('voteWeightSteem') * 100
            weightHive = UserSettings.get('voteWeightHive') * 100
            weightBlurt = UserSettings.get('voteWeightBlurt') * 100
        } else {
            weight = document.getElementById("voterangeup" + permlink).value * 100
            weightSteem = document.getElementById("voterangeup" + permlink).value * 100
            weightHive = document.getElementById("voterangeup" + permlink).value * 100
            weightBlurt = document.getElementById("voterangeup" + permlink).value * 100
        }
        let refs = [];
        if (this.isComment)
            if (this.content.json && this.content.json.refs) {
                refs = this.content.json.refs
                refs.push(this.content._id)
            } else {
                refs = [this.content._id]
            }
        else
            refs = Session.get('currentRefs')
        $('.ui.popup').popup('hide all');
        $('.ui.up.votesliderloader.' + permlink).removeClass('dsp-non');
        $('.ui.votebutton.voteslider.up.' + permlink).addClass('dsp-non');
        broadcast.multi.vote(refs, weight, weightSteem, weightHive, weightBlurt, newTag || '', tip, function(err, result) {
            if (err) Meteor.blockchainError(err, translate('GLOBAL_ERROR_COULD_NOT_VOTE'))
            else {
                toastr.success(translate('GLOBAL_ERROR_VOTE_FOR', weight / 100 + '%', author + '/' + permlink))
                    // var audio = new Audio('http://localhost:3000/DTube_files/sounds/coin-drop-1.mp3');
                    // audio.play();
            }
            $('.ui.up.votesliderloader.' + permlink).addClass('dsp-non');
            $('.ui.votebutton.voteslider.up.' + permlink).removeClass('dsp-non');
            Template.video.loadState()
        });
    },
    'click .button.downvotetag': function(event) {
        let newTag = $('.tagvote.down .tagvalue').val()
        let author = this.content.author
        let permlink = this.sliderclass
        let weight = 100
        let weightSteem = 100
        let weightHive = 100
        let tip = canTipAuthor(this.content) ? parseInt($('.tagvote.down .tipvalue').val()) : 0
        if (this.network === 'dtube') {
            weight = document.getElementById("voterangedown" + permlink).value * -100
            weightSteem = UserSettings.get('voteWeightSteem') * -100
            weightHive = UserSettings.get('voteWeightHive') * -100
        } else {
            weight = document.getElementById("voterangedown" + permlink).value * -100
            weightSteem = document.getElementById("voterangedown" + permlink).value * -100
            weightHive = document.getElementById("voterangedown" + permlink).value * -100
        }
        let refs = [];
        if (this.isComment)
            if (this.content.json && this.content.json.refs) {
                refs = this.content.json.refs
                refs.push(this.content._id)
            } else {
                refs = [this.content._id]
            }
        else
            refs = Session.get('currentRefs')
        $('.ui.popup').popup('hide all');
        $('.ui.down.votesliderloader.' + permlink).removeClass('dsp-non');
        $('.ui.votebutton.voteslider.down.' + permlink).addClass('dsp-non');
        broadcast.multi.vote(refs, weight, weightSteem, weightHive, -1, newTag || '', tip, function(err, result) {
            if (err) Meteor.blockchainError(err, translate('GLOBAL_ERROR_COULD_NOT_VOTE'))
            else {
                toastr.success(translate('GLOBAL_ERROR_DOWNVOTE_FOR', weight / 100 + '%', author + '/' + permlink))
                    // var audio = new Audio('http://localhost:3000/DTube_files/sounds/coin-drop-1.mp3');
                    // audio.play();
            }
            $('.ui.down.votesliderloader.' + permlink).addClass('dsp-non');
            $('.ui.votebutton.voteslider.down.' + permlink).removeClass('dsp-non');
            Template.video.loadState()
        });
    },
})

Template.verticalvoteslider.helpers({
    mainUser: function() {
        return Users.findOne({ username: Session.get('activeUsername'), network: 'avalon' })
    },
    convertTag: function(tag) {
        var tagWithoutDtube = tag ? tag.replace("dtube-", "") : ""
        return tagWithoutDtube
    },
    firstTag: function(tags) {
        if (tags)
            return tags[0]
        else return false
    },
    hasVoted: function(one, two) {
        if (one || two) return true;
        return false;
    },
    canTipAuthor: function (content) {
        return canTipAuthor(content)
    }
});

function canTipAuthor(content) {
    for (let v in content.votes)
        if (content.votes[v].u === content.author && !content.votes[v].claimed)
            return true
    return false
}