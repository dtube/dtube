// default settings
Meteor.settings.public = {
  "remote": {
    "dfees": 2500,
    "loadLimit": 12,
    "displayNodes": [
      "https://snap1.d.tube",
      "http://127.0.0.1:8080"
    ],
    "snapMaxFileSizeKB": 1024,
    "upldr": ['g1']
  },
  "app": "dtube/0.7",
  "beneficiary": "dtube",
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
$.get('/DTube_files/settings.json', function(json, result) {
  if (result == 'success') {
    Meteor.settings.public = json
    Session.set('remoteSettings', Meteor.settings.public.remote)
  }
})