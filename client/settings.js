Meteor.settings.public = {
  "remote": {
    "dfees": 2500,
    "loadLimit": 10,
    "uploadNodes": [
      { 'owner': 'nannal','node': {'host': 'gateway.ipfsstore.it','port': 4443,'protocol': 'https'} },
      { 'owner': 'dtube','node': {'host': 'dtube1.gateway.ipfsstore.it','port': 4443,'protocol': 'https'} },
      { 'owner': 'dtube','node': {'host': 'dtube2.gateway.ipfsstore.it','port': 4443,'protocol': 'https'} },
      { 'owner': null,'node': {'host': 'localhost','port': 5001,'protocol': 'https'} }
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
      "http://localhost:8080"
    ]
  },
  "app": 'dtube/0.1',
  "beneficiary": "dtube",
  "pageTitleSeparator": '-',
  "appName": 'DTube',
  "ipns": "Qmb8hgdQoyotsnUj3JKWvWzcfA9Jx4Ak2ao1XzCVLfDtuB"
}
