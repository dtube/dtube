const isIPFS = require('is-ipfs')

Template.addvideohashes.rendered = () => Template.settingsdropdown.nightMode()
Template.addvideohashes.helpers({
    translateHash: function(string, prov) {
        if (prov == 'sia')
            return translate(string).replace('Hash', 'Skylink')
        return translate(string)
    }
})

Template.addvideohashes.fillHashes = function() {
    // put ipfs style video data
    var files = {
        vid: {},
        img: {},
        sub: {}
    }
    var isValid = Template.addvideohashes.isValidHash
    if (Session.get('addVideoStep') == 'addvideoformp2psia')
        isValid = Template.addvideohashes.isValidSkylink
    // source hash is the only required field
    if (!$('input[name="vid.src"]')[0].value) {
        toastr.error(translate('EDIT_ERROR_MISSING_VIDEOHASH'), translate('ERROR_TITLE'))
        return
    }
    if (!isValid($('input[name="vid.src"]')[0].value)) {
        toastr.error(translate('EDIT_ERROR_INVALID_VIDEOHASH'), translate('ERROR_TITLE'))
        return 
    }
    if (Session.get('addVideoStep') !== 'addvideoformp2psia' && !Template.addvideohashes.isValidGateway($('input[name="gw"]')[0].value)) {
        toastr.error(translate('EDIT_ERROR_INVALID_GATEWAY'), translate('ERROR_TITLE'))
        return
    }
    
    var fields = [
        'vid.src', 'vid.240', 'vid.480',
        'vid.720', 'vid.1080',
        'img.spr'
    ]
    
    for (let i = 0; i < fields.length; i++)
        if (isValid($('input[name="'+fields[i]+'"]')[0].value)) {
            switch (fields[i]) {
                case 'img.spr':
                    files.img["spr"] = $('input[name="'+fields[i]+'"]')[0].value
                    break;

                case 'vid.src':
                    files.vid["src"] = $('input[name="'+fields[i]+'"]')[0].value
                    break;

                case 'vid.240':
                    files.vid["240"] = $('input[name="'+fields[i]+'"]')[0].value
                    break;

                case 'vid.480':
                    files.vid["480"] = $('input[name="'+fields[i]+'"]')[0].value
                    break;

                case 'vid.720':
                    files.vid["720"] = $('input[name="'+fields[i]+'"]')[0].value
                    break;

                case 'vid.1080':
                    files.vid["1080"] = $('input[name="'+fields[i]+'"]')[0].value
                    break;
            
                default:
                    break;
            }

        if ($('input[name="gw"]')[0] && $('input[name="gw"]')[0].value)
            files.gw = $('input[name="gw"]')[0].value
    }

    if (Object.keys(files.sub).length == 0) delete files.sub
    if (Object.keys(files.img).length == 0) delete files.img
    return files
}

Template.addvideohashes.isValidHash = function(hash) {
    return isIPFS.cid(hash)
}

Template.addvideohashes.isValidSkylink = function(skylink) {
    // ex1: _ATcIAto1BT1_lmSwQQINqkRDu6_gp5dUFpMr-5DFHr7Ow
    // 46 chars
    if (skylink.length !== 46) return false
    // base64
    var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'
    for (let i = 0; i < skylink.length; i++)
        if (alphabet.indexOf(skylink[i]) == -1)
            return false
    return true
}

Template.addvideohashes.isValidGateway = (gw = '') => {
    if (gw && !gw.startsWith('http://') && !gw.startsWith('https://'))
        return false
    return true
}