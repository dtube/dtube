// default settings
Meteor.settings.public = {
  "remote": {
    "dfees": 1000,
    "loadLimit": 50,
    "displayNodes": [
      "https://snap1.d.tube",
      "http://127.0.0.1:8080"
    ],
    "snapMaxFileSizeKB": 2048,
    "upldr": ["cluster"],
    "localhost": false
  },
  "app": "dtube/0.9",
  "scot": null,
  "logo": "https://new.d.tube/DTube_files/images/DTube_Black.svg",
  "logonight": "https://new.d.tube/DTube_files/images/DTube_White.svg",
  // "scot": {
  //   "token": "PAL",
  //   "precision": 0,
  //   "displayedPrecision": 0,
  //   "tag": "palnet"
  // },
  // "logo": "https://i.imgsafe.org/15/15bdc8a5ba.png",
  // "logonight": "https://i.imgsafe.org/15/15bdc8a5ba.png",
  "beneficiary": "dtube",
  "dmca": true,
  "pageTitleSeparator": "-",
  "appName": "DTube",
  "ipfs": "",
  "lang": {
    "bn": {"name": "বাংলা", "path": "bn/bn-BD.json"},
    "da": {"name": "Dansk", "path": "da/da-DK.json"},
    "de": {"name": "Deutsch", "path": "de/de-DE.json"},
    "en": {"name": "English", "path": "en/en-US.json"},
    "eo": {"name": "Esperanto", "path": "eo/eo-UY.json"},
    "es-ES": {"name": "Español", "path": "es-ES/es-ES.json"},
    "et": {"name": "Eesti", "path": "et/et-EE.json"},
    "fil": {"name": "Tatalog", "path": "fil/fil-PH.json"},
    "fr": {"name": "Français", "path": "fr/fr-FR.json"},
    "he": {"name": "עברית", "path": "he/he-IL.json"},
    "hi": {"name": "हिन्दी, हिंदी", "path": "hi/hi-IN.json"},
    "id": {"name": "Bahasa Indonesia", "path": "id/id-ID.json"},
    "it": {"name": "Italiano", "path": "it/it-IT.json"},
    "nl": {"name": "Nederlands", "path": "nl/nl-NL.json"},
    "pt-BR": {"name": "Português (BR)", "path": "pt-BR/pt-BR.json"},
    "pl": {"name": "Polski", "path": "pl/pl-PL.json"},
    "ro": {"name": "Română", "path": "ro/ro-RO.json"},
    "ru": {"name": "русский", "path": "ru/ru-RU.json"},
    "sl": {"name": "Slovenščina", "path": "sl/sl-SI.json"},
    "tr": {"name": "Türkçe", "path": "tr/tr-TR.json"}
  }
}

// custom settings loaded from json
// $.get('https://d.tube/DTube_files/settings.json', function(json, result) {
//   if (result == 'success') {
//     Meteor.settings.public = json
//     Session.set('remoteSettings', Meteor.settings.public.remote)
//   }
// })
