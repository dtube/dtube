Meteor.settings.public = {
  "uploadNodes": [
    {
      'owner': 'heimindanger',
      'node': {
        'host': 'ipfsstore.it',
        'port': 4443,
        'protocol': 'https'
      }
    },
    {
      'owner': 'lukestokes',
      'node': {
        'host': 'ipfs.lukestokes.info',
        'port': 5001,
        'protocol': 'http'
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
    "http://ipfsstore.it:8080",
    "https://ipfs.view.ly"
  ],
  "app": 'dtube/0.1',
  "dfees": 2500,
  "beneficiary": "dtube"
}
