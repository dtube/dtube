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
    "upldr": ["g1",1,2,3,4,5]
  },
  "app": "dtube/0.7",
  "beneficiary": "dtube",
  "pageTitleSeparator": "-",
  "appName": "DTube",
  "ipfs": "",
  "lang": {
    "de": {"name": "Deutsch", "path": "de/de-DE.json"},
    "en": {"name": "English", "path": "en/en-US.json"},
    "fr": {"name": "Français", "path": "fr/fr-FR.json"},
    "pl": {"name": "Polski", "path": "pl/pl-PL.json"}
  }
}

// custom settings loaded from json
$.get('/DTube_files/settings.json', function(json, result) {
  if (result == 'success') {
    Meteor.settings.public = json
  }
})