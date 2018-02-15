var languages = require('languages')

Template.uploadformsubtitles.rendered = function () {
    console.log(languages.getAllLanguageCode())
    var langscodes = languages.getAllLanguageCode();
    var langs = []
    for (n=0; n<langscodes.length; n++) {
        var lang = languages.getLanguageInfo(langscodes[n])
        var newLang = {
            title: lang.nativeName,
            description: lang.name,
            code: langscodes[n]
        }
        langs.push(newLang)
    }
    $('.ui.search').search({
      source: langs
    })
    Session.set('isAddingSubtitle', false)
}

Template.uploadformsubtitles.helpers({
    isAddingSubtitle: function() {
        return Session.get('isAddingSubtitle')
    }
})


Template.uploadformsubtitles.events({
    'click #createSubtitle': function() {
        Session.set('isAddingSubtitle', true)
    },
    'change #importSubtitleFile': function(event) {
        var file = event.currentTarget.files[0]
        console.log(file)

        var reader = new FileReader();
        reader.onload = function(){
          console.log(reader.result);
          if (reader.result.substr(0,6) != 'WEBVTT')
            $('#subtitleText')[0].innerHTML = srt2webvtt(reader.result)
          else
          $('#subtitleText')[0].innerHTML = reader.result
        }
        reader.readAsText(event.currentTarget.files[0])
    },
})
  
function srt2webvtt(data) {
    // remove dos newlines
    var srt = data.replace(/\r+/g, '');
    // trim white space start and end
    srt = srt.replace(/^\s+|\s+$/g, '');

    // get cues
    var cuelist = srt.split('\n\n');
    var result = "";

    if (cuelist.length > 0) {
        result += "WEBVTT\n\n";
        for (var i = 0; i < cuelist.length; i=i+1) {
            result += convertSrtCue(cuelist[i]);
        }
    }

    return result;
}
  
function convertSrtCue(caption) {
    // remove all html tags for security reasons
    //caption = caption.replace(/<[a-zA-Z\/][^>]*>/g, ''); 
    
    var cue = "";
    var s = caption.split(/\n/);
    while (s.length > 3) {
      s[2] += '\n' + s.pop();
    }
    var line = 0;
    
    // detect identifier
    if (!s[0].match(/\d+:\d+:\d+/) && s[1].match(/\d+:\d+:\d+/)) {
      cue += s[0].match(/\w+/) + "\n";
      line += 1;
    }
    
    // get time strings
    if (s[line].match(/\d+:\d+:\d+/)) {
      // convert time string
      var m = s[1].match(/(\d+):(\d+):(\d+)(?:,(\d+))?\s*--?>\s*(\d+):(\d+):(\d+)(?:,(\d+))?/);
      if (m) {
        cue += m[1]+":"+m[2]+":"+m[3]+"."+m[4]+" --> "
              +m[5]+":"+m[6]+":"+m[7]+"."+m[8]+"\n";
        line += 1;
      } else {
        // Unrecognized timestring
        return "";
      }
    } else {
      // file format error or comment lines
      return "";
    }
    
    // get cue text
    if (s[line]) {
      cue += s[line] + "\n\n";
    }
  
    return cue;
}