Meteor.settings.public = {
  "remote": {
    "dfees": 2500,
    "loadLimit": 10,
    "uploadNodes": [
      { 'owner': 'nannal','node': {'host': 'gateway.ipfsstore.it','port': 8443,'protocol': 'https'} },
      { 'owner': 'dtube','node': {'host': 'dtube1.gateway.ipfsstore.it','port': 8443,'protocol': 'https'} },
      { 'owner': 'dtube','node': {'host': 'dtube2.gateway.ipfsstore.it','port': 8443,'protocol': 'https'} },
      { 'owner': null,'node': {'host': '127.0.0.1','port': 5001,'protocol': 'http'} }
    ],
    "displayNodes": [
      "https://ipfs.io",
      "https://dtube1.gateway.ipfsstore.it:8443",
      "https://dtube2.gateway.ipfsstore.it:8443",
      "https://gateway.ipfs.io",
      "https://earth.i.ipfs.io",
      "https://mercury.i.ipfs.io",
      "https://ipfsstore.it:8443",
      "https://scrappy.i.ipfs.io",
      "https://chappy.i.ipfs.io",
      "http://127.0.0.1:8080"
    ],
    "snapMaxFileSizeKB": 500
  },
  "app": 'dtube/0.3',
  "beneficiary": "dtube",
  "pageTitleSeparator": '-',
  "appName": 'DTube',
  "ipns": "Qmb8hgdQoyotsnUj3JKWvWzcfA9Jx4Ak2ao1XzCVLfDtuB",
  "translations": {
    "en-us": {author: 'curator', permlink: 're-curator-dtube-translations-root-20170905t000249923z'},
    "fr-fr": {author: 'curator', permlink: 're-curator-dtube-translations-root-20170905t002032311z'},
    "ko-kr": {author: 'curator', permlink: 're-curator-dtube-translations-root-20170919t133419412z'},
    "pt-pt": {author: 'curator', permlink: 're-curator-dtube-translations-root-20170919t134820783z'},
    "lt": {author: 'curator', permlink: 're-curator-dtube-translations-root-20170919t135235158z'},
    "tr": {author: 'curator', permlink: 're-curator-dtube-translations-root-20170919t135734303z'},
    "pl": {author: 'curator', permlink: 're-curator-dtube-translations-root-20170919t140006611z'}
  }
}
