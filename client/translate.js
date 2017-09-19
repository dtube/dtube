// loading en-us by default
var jsonTranslateDef = require('./en-us.json')
Session.set('jsonTranslate', jsonTranslateDef)
var culture = 'en-us';

window.loadLangAuto = function(cb) {
  culture = getCultureAuto();
  loadJsonTranslate(culture, function() {
    cb()
  });
}

function translate(code){
  //find translation
  var value = code;
  var found = false;
  for(var key in Session.get('jsonTranslate')){
    if(key === code){
      value = Session.get('jsonTranslate')[key];
      found = true;
      break;
    }
  }

  if(!found){
    console.log('have not found translation in ' + culture + ' :'+code);
    for(var key in jsonTranslateDef){
      if(key === code){
        value = jsonTranslateDef[key];
        found = true;
        break;
      }
    }
    if(!found){
      console.log('have not found translation:'+code);
      return '[['+code+']]';
    }
  }

  //replacing %1, %2, ..., %n by the function arguments
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
  var culture = 'en-us';

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

    for(var key in Meteor.settings.public.translations) {
      if (key === cult) return key
      if (cult.substr(0,2) === key.substr(0,2)) return key;
    }

    // if(cult === "fr-fr"){
    //   culture = "fr-fr";
    //   break;
    // }
    // else if(cult === "en-us"){
    //   culture = "en-us";
    //   break;
    // }
    // else if(cult.startsWith("fr")){
    //   culture = "fr-fr";
    //   break;
    // }
    // else if(cult.startsWith("en")){
    //   culture = "en-us";
    //   break;
    // }
  }
  return culture;
}

function loadJsonTranslate(culture, cb){
  if (culture.substr(0,2) == 'en') {
    cb()
    return
  }
  for(var key in Meteor.settings.public.translations) {
    if (key == culture) {
      steem.api.getContent(
      Meteor.settings.public.translations[key].author,
      Meteor.settings.public.translations[key].permlink,
      function(e,r) {
        Session.set('jsonTranslate', JSON.parse(r.body))
        cb()
      })
    }
  }
}

//for js files
window.translate = translate;

//for html files
Template.registerHelper( 'translate', (code) => {
  return translate(code);
});
