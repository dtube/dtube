Meteor.settings.public = {
  "uploadNodes": [
    {
      'owner': 'nannal',
      'node': {
        'host': 'ipfsstore.it',
        'port': 4443,
        'protocol': 'https'
      }
    },
    {
      'owner': 'myself',
      'node': {
        'host': 'localhost',
        'port': 5001,
        'protocol': 'http'
      }
    }
  ],
  "displayNodes": [
    "https://ipfs.io",
    "https://gateway.ipfs.io",
    "https://earth.i.ipfs.io",
    "https://mercury.i.ipfs.io",
    "https://ipfsstore.it:8443",
    "https://scrappy.i.ipfs.io",
    "https://chappy.i.ipfs.io",
    "http://127.0.0.1:8080"
  ],
  "app": 'dtube/0.1',
  "dfees": 2500,
  "beneficiary": "dtube",
  "loadLimit": 10,
  "pageTitleSeparator": '-',
  "appName": 'DTube'
}
