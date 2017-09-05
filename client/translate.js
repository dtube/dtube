// loading en-us by default
var jsonTranslate = require('./en-us.json')

window.loadLangAuto = function(cb) {
  var culture = getCultureAuto();
  console.log('Loading translation: '+culture)
  loadJsonTranslate(culture, function() {
    cb()
  });
}

function translate(code){
  //find traduction
  var value = code;
  for(var key in jsonTranslate)
    if(key === code)
      value = jsonTranslate[key];

  //on remplace %1, %2, ..., %n par les arguments passés dans la fn
  var args = arguments
  for (var i = 1; i < args.length; i++) {
    var find = '%'+i
    var regex = new RegExp(find, "g");
    value = value.replace(regex, args[i])
  }

  return value;
}

function getCultureAuto(){
  //default culture
  var culture = 'en-gb';

  var listCult;
  if(navigator.languages){
    listCult=navigator.languages;
  }
  else if(navigator.language){
    listCult[0] = navigator.language;
  }
  else if(navigator.userLanguage){
    listCult[0] = navigator.userLanguage;
  }

  for(var j = 0;j < listCult.length;j++){
    var cult = listCult[j].toLowerCase();
    //essaye de trouver du plus spécifique au moins spécifique
    if(cult === "fr-fr"){
      culture = "fr-fr";
      break;
    }
    else if(cult.startsWith("fr")){
      culture = "fr-fr";
      break;
    }
    else if(cult.startsWith("en")){
      culture = "en-gb";
      break;
    }
    else{
      culture = "en-gb";
      break;
    }
  }
  return culture;
}

function loadJsonTranslate(culture, cb){
  for(var key in Meteor.settings.public.translations) {
    if (key == culture) {
      steem.api.getContent(
      Meteor.settings.public.translations[key].author,
      Meteor.settings.public.translations[key].permlink,
      function(e,r) {
        jsonTranslate = JSON.parse(r.body)
        cb()
      })
    }
  }

  // switch(culture){
  //   case "fr-fr":
  //     return JSON.parse('{"HOME_TITLE_HOT_VIDEOS":"Videos chaudes","HOME_TITLE_TRENDING_VIDEOS":"Videos tendances"}');
  //
  //   case "en-gb":
  //     return JSON.parse('{"HOME_TITLE_HOT_VIDEOS":"Hot Videos","HOME_TITLE_TRENDING_VIDEOS":"Trending Videos"}');
  // }
}

//for js files
window.translate = translate;

//for html files
Template.registerHelper( 'translate', (code) => {
  return translate(code);
});
