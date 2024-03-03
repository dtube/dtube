// default settings
Meteor.settings.public = {
  "remote": {
    "dfees": 1000,
    "loadLimit": 50,
    "displayNodes": [
      // "https://snap1.d.tube",
      "https://video.oneloveipfs.com",
      "https://ipfs.io",
      "https://ipfs.infura.io",
      "https://gateway.pinata.cloud",
      "http://127.0.0.1:8080"
    ],
    "APINodes": [
      "https://api.steemit.com",
      "https://api.justyy.com",
      "https://steem.61bts.com"
    ],
    "AvalonAPINodes": [
      "https://avalon.d.tube",
      "https://api.avalonblocks.com",
      "https://dtube.fso.ovh",
      "https://dtube.tekraze.com",
      "http://localhost:3001",
    ],
    "HiveAPINodes": [
      "https://anyx.io",
      "https://techcoderx.com",
      "https://hived.privex.io",
      "https://api.deathwing.me",
      "https://api.c0ff33a.uk",
      "https://hived.emre.sh",
      "https://rpc.ecency.com",
      "https://rpc.ausbit.dev",
      "https://hive-api.arcange.eu",
      "https://hive.roelandp.nl",
      "https://api.hive.blue"
    ],
    "BlurtAPINodes": [
      "https://rpc.blurt.world",
      "https://blurt-rpc.saboin.com",
      "https://kentzz.blurt.world",
      "https://rpc.nerdtopia.de",
      "https://rpc.blurtlatam.com"
    ],
    "snapMaxFileSizeKB": 2048,
    "upldr": ["1.btfsu","2.btfsu","3.btfsu","4.btfsu"],
    "thirdPartyUploadEndpoints": [
      "uploader.oneloveipfs.com"
    ],
    "localhost": false
  },
  "app": "dtube/1.2",
  "scot": null,
  "logo": "./DTube_files/images/DTube_Black.svg",
  "logonight": "./DTube_files/images/DTube_White.svg",
  "logosmall": "./DTube_files/images/logos/dtube.png",
  "logosmallnight": "./DTube_files/images/logos/dtube_white.png",
  "beneficiary": "dtube",
  "dmca": true,
  "pageTitleSeparator": "-",
  "appName": "DTube",
  "ipfs": "",
  "lang": {
    "ar": {"name": "العربية", "path": "ar/ar-SA.json"},
    "bn": {"name": "বাংলা", "path": "bn/bn-BD.json"},
    "cs": {"name": "Čeština", "path": "cs/cs-CZ.json"},
    "da": {"name": "Dansk", "path": "da/da-DK.json"},
    "de": {"name": "Deutsch", "path": "de/de-DE.json"},
    "en": {"name": "English", "path": "en/en-US.json"},
    "eo": {"name": "Esperanto", "path": "eo/eo-UY.json"},
    "es-ES": {"name": "Español", "path": "es-ES/es-ES.json"},
    "es-MX": {"name": "Español (MX)", "path": "es-MX/es-MX.json"},
    "es-VE": {"name": "Español (VE)", "path": "es-VE/es-VE.json"},
    "el": {"name": "ελληνικά", "path": "el/el-GR.json"},
    "et": {"name": "Eesti", "path": "et/et-EE.json"},
    "fi": {"name": "Suomi", "path": "fi/fi-FI.json"},
    "fil": {"name": "Tatalog", "path": "fil/fil-PH.json"},
    "fr": {"name": "Français", "path": "fr/fr-FR.json"},
    "he": {"name": "עברית", "path": "he/he-IL.json"},
    "hi": {"name": "हिन्दी, हिंदी", "path": "hi/hi-IN.json"},
    "hu": {"name": "Magyar", "path": "hu/hu-HU.json"},
    "id": {"name": "Bahasa Indonesia", "path": "id/id-ID.json"},
    "it": {"name": "Italiano", "path": "it/it-IT.json"},
    "ja": {"name": "日本語", "path": "ja/ja-JP.json"},
    "ko": {"name": "한국어", "path": "ko/ko-KR.json"},
    "nl": {"name": "Nederlands", "path": "nl/nl-NL.json"},
    "no": {"name": "Norsk", "path": "no/no-NO.json"},
    "pt-BR": {"name": "Português (BR)", "path": "pt-BR/pt-BR.json"},
    "pt-PT": {"name": "Português", "path": "pt-PT/pt-PT.json"},
    "pl": {"name": "Polski", "path": "pl/pl-PL.json"},
    "ro": {"name": "Română", "path": "ro/ro-RO.json"},
    "ru": {"name": "русский", "path": "ru/ru-RU.json"},
    "sl": {"name": "Slovenščina", "path": "sl/sl-SI.json"},
    "sr": {"name": "српски", "path": "sr/sr-SP.json"},
    "sv-SE": {"name": "Svenska", "path": "sv-SE/sv-SE.json"},
    "ta": {"name": "தமிழ்", "path": "ta/ta-IN.json"},
    "th": {"name": "ภาษาไทย", "path": "th/th-TH.json"},
    "tr": {"name": "Türkçe", "path": "tr/tr-TR.json"},
    "uk": {"name": "Українська", "path": "uk/uk-UA.json"},
    "zh-CN": {"name": "中文 (简体)", "path": "zh-CN/zh-CN.json"},
    "zh-TW": {"name": "中文 (繁體)", "path": "zh-TW/zh-TW.json"}
  }
}

// example scot config
// config_scot = {
//   "token": "PAL",
//   "precision": 0,
//   "displayedPrecision": 0,
//   "tag": "palnet",
//   "logo": "https://i.imgsafe.org/15/15bdc8a5ba.png",
//   "logonight": "https://i.imgsafe.org/15/15bdc8a5ba.png",
//   "websiteTitle": "PEACE, ABUNDANCE, AND LIBERTY"
// }

if (typeof config_scot != "undefined")
  Meteor.settings.public.scot = config_scot

// custom settings loaded from json
// $.get('https://d.tube/DTube_files/settings.json', function(json, result) {
//   if (result == 'success') {
//     Meteor.settings.public = json
//     Session.set('remoteSettings', Meteor.settings.public.remote)
//   }
// })
