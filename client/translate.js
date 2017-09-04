var jsonTranslate;

function translate(code){
  //if not loaded yet
  if(!jsonTranslate){
    var culture = getCultureAuto();
    jsonTranslate = loadJsonTranslate(culture);
  }

  //find traduction
  var value = code;
  for(var key in jsonTranslate)
    if(key === code)
      value = jsonTranslate[key];

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

function loadJsonTranslate(culture){
  switch(culture){
    case "fr-fr":
      return JSON.parse('{"HOME_TITLE_HOT_VIDEOS":"Videos chaudes","HOME_TITLE_TRENDING_VIDEOS":"Videos tendances"}');

    case "en-gb":
      return JSON.parse('{"HOME_TITLE_HOT_VIDEOS":"Hot Videos","HOME_TITLE_TRENDING_VIDEOS":"Trending Videos"}');
  }
}

//for js files
window.translate = translate;

//for html files
Template.registerHelper( 'translate', (code) => {
  return translate(code);
});