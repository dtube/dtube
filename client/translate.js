function translate(code){
  var value = code;

  //todo get the current culture (en-gb, fr-fr ...) from ?
  var culture = 'en-gb';

  //todo
  //try get the file translate-culture.json (mise en cache, refresh ?)
  //si pas de fichier trouvé, get the file translate-en-gb.json
  var obj = JSON.parse('{"HOME_TITLE_HOT_VIDEOS":"Hot Videos","HOME_TITLE_TRENDING_VIDEOS":"Trending Videos"}');
  for(var key in obj)
    if(key === code)
      value = obj[key];

  return value;
}

//for js files
window.translate = translate;

//for html files
Template.registerHelper( 'translate', (code) => {
  return translate(code);
});