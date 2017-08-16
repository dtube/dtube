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
    "https://ipfsstore.it:8443"
  ],
  "app": 'dtube/0.1',
  "dfees": 2500,
  "beneficiary": "dtube",
  "loadLimit": 8
}
