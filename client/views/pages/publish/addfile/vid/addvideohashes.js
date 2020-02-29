Template.addvideohashes.fillHashes = function() {
    // put ipfs style video data
    var files = {
        vid: {},
        img: {},
        sub: {}
    }
    // source hash is the only required field
    if (!$('input[name="vid.src"]')[0].value) {
        toastr.error(translate('EDIT_ERROR_MISSING_VIDEOHASH'), translate('ERROR_TITLE'))
        return
    }
    if (!Template.addvideo.verifyHash($('input[name="vid.src"]')[0].value)) {
        toastr.error(translate('EDIT_ERROR_INVALID_VIDEOHASH'), translate('ERROR_TITLE'))
        return 
    }
    
    var fields = [
        'vid.src', 'vid.240', 'vid.480',
        'vid.720', 'vid.1080',
        'img.spr'
    ]
    
    for (let i = 0; i < fields.length; i++)
        if (Template.addvideo.verifyHash($('input[name="'+fields[i]+'"]')[0].value)) {
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

        if ($('input[name="gw"]')[0].value)
            files.gw = $('input[name="gw"]')[0].value
    }

    if (Object.keys(files.sub).length == 0) delete files.sub
    if (Object.keys(files.img).length == 0) delete files.img

    // console.log(files)
    return files
}