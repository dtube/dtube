// loading en-us by default
var culture = 'en-us'
var jsonTranslateDef = null

window.loadDefaultLang = function(cb = function(){}){
  var url = './DTube_files/lang/en/en-US.json'
  // if (window.location.hostname == 'localhost' && window.location.port == '3000')
  // url = url.replace('https://d.tube', 'http://localhost:3000')
  $.get(url, function(json, result) {
    if (result == 'success') {
      jsonTranslateDef = json
      cb()
    }
  })
}
window.loadLangAuto = function(cb) {
  culture = UserSettings.get('language') || getCultureAuto();
  loadJsonTranslate(culture, function() {
    cb()
  });
}
window.loadJsonTranslate = function(culture, cb = function(){}){
  if (culture.slice(0,2) == 'en') {
    Session.set('jsonTranslate', null)
    UserSettings.set('language', null)
    cb()
    return
  }

  UserSettings.set('language', culture)
  var url = './DTube_files/lang/'+Meteor.settings.public.lang[culture].path
  // if (window.location.hostname == 'localhost' && window.location.port == '3000')
  // url = url.replace('https://d.tube', 'http://localhost:3000')
  $.get(url, function(json, result) {
    if (result == 'success') {
      Session.set('jsonTranslate', json)
      cb()
    }
  })
}

function translate(code){
  //find translation
  var value = code;
  var found = false;
  if (Session.get('jsonTranslate')) {
    for(var key in Session.get('jsonTranslate')){
      if(key === code){
        value = Session.get('jsonTranslate')[key];
        found = true;
        break;
      }
    }
  }

  if(!found){
    if (culture.slice(0,2) != 'en')
      console.log('have not found translation in ' + culture + ' :'+code);
    if (jsonTranslateDef) {
      for(var key in jsonTranslateDef){
        if(key === code){
          value = jsonTranslateDef[key];
          found = true;
          break;
        }
      }
    }
    if (!found) {
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

  var listCult = [];
  if(navigator.languages){
    listCult=navigator.languages;
  }
  else if(navigator.language){
    listCult.push(navigator.language);
  }
  else if(navigator.userLanguage){
    listCult.push(navigator.userLanguage)
  }

  for(var j = 0;j < listCult.length;j++){
    var cult = listCult[j].toLowerCase();

    //essaye de trouver du plus spécifique au moins spécifique
    for(var key in Meteor.settings.public.lang)
      if (key === cult) return key

    for(var key in Meteor.settings.public.lang)
      if (cult.slice(0,2) === key.slice(0,2)) return key;

  }
  return culture;
}

//for js files
window.translate = translate;

//for html files
Template.registerHelper( 'translate', (code, var1, var2) => {
  return translate(code, var1, var2);
});
