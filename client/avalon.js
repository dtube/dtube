import { setTimeout } from "timers";

var CryptoJS = require("crypto-js")
const { randomBytes } = require('crypto')
const secp256k1 = require('secp256k1')
const bs58 = require('bs58')
var crypto = (self.crypto || self.msCrypto), QUOTA = 65536;

window.avalon = {
    config: {
        //api: ['https://api.avalon.wtf'],
        //api: ['https://bran.nannal.com'],
        api: ['http://127.0.0.1:3001']
    },
    init: (config) => {
        avalon.config = config
    },
    getAccount: (name, cb) => {
        fetch(avalon.randomNode()+'/account/'+name, {
            method: 'get',
            headers: {
              'Accept': 'application/json, text/plain, */*',
              'Content-Type': 'application/json'
            }
        }).then(res => res.json()).then(function(res) {
            cb(null, res)
        });
    },
    getAccountHistory: (name, lastBlock, cb) => {
        fetch(avalon.randomNode()+'/blog/'+name+'/history/'+lastBlock, {
            method: 'get',
            headers: {
              'Accept': 'application/json, text/plain, */*',
              'Content-Type': 'application/json'
            }
        }).then(res => res.json()).then(function(res) {
            cb(null, res)
        });
    },
    getAccounts: (names, cb) => {
        fetch(avalon.randomNode()+'/accounts/'+names.join(','), {
            method: 'get',
            headers: {
              'Accept': 'application/json, text/plain, */*',
              'Content-Type': 'application/json'
            }
        }).then(res => res.json()).then(function(res) {
            cb(null, res)
        });
    },
    getContent: (name, link, cb) => {
        fetch(avalon.randomNode()+'/content/'+name+'/'+link, {
            method: 'get',
            headers: {
              'Accept': 'application/json, text/plain, */*',
              'Content-Type': 'application/json'
            }
        }).then(res => res.json()).then(function(res) {
            cb(null, res)
        });
    },
    generateCommentTree: (root, author, link) => {
        var replies = []
        if (author == root.author && link == root.link) {
            var content = root
        } else {
            var content = root.comments[author+'/'+link]
        }
        if (!content || !content.child || !root.comments) return []
        for (var i = 0; i < content.child.length; i++) {
            var comment = root.comments[content.child[i][0]+'/'+content.child[i][1]]
            comment.replies = avalon.generateCommentTree(root, comment.author, comment.link)
            comment.ups = 0
            comment.downs = 0
            if (comment.votes) {
                for (let i = 0; i < comment.votes.length; i++) {
                    if (comment.votes[i].vt > 0)
                        comment.ups += comment.votes[i].vt
                    if (comment.votes[i].vt < 0)
                        comment.downs += comment.votes[i].vt
                }
            }
            comment.totals = comment.ups + comment.downs
            replies.push(comment)
        }
        replies = replies.sort(function(a,b) {
            return b.totals-a.totals
        })
        return replies
    },
    getDiscussionsByAuthor: (username, cb) => {
        fetch(avalon.randomNode()+'/blog/'+username, {
            method: 'get',
            headers: {
              'Accept': 'application/json, text/plain, */*',
              'Content-Type': 'application/json'
            }
        }).then(res => res.json()).then(function(res) {
            cb(null, res)
        });
    },
    getNewDiscussions: (author, link, cb) => {
        if (!author && !link) {
            fetch(avalon.randomNode()+'/new', {
                method: 'get',
                headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
                }
            }).then(res => res.json()).then(function(res) {
                cb(null, res)
            });
        } else {
            fetch(avalon.randomNode()+'/new/'+author+'/'+link, {
                method: 'get',
                headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
                }
            }).then(res => res.json()).then(function(res) {
                cb(null, res)
            });
        }
    },
    getHotDiscussions: (author, link, cb) => {
        if (!author && !link) {
            fetch(avalon.randomNode()+'/hot', {
                method: 'get',
                headers: {
                  'Accept': 'application/json, text/plain, */*',
                  'Content-Type': 'application/json'
                }
            }).then(res => res.json()).then(function(res) {
                cb(null, res)
            });
        } else {
            fetch(avalon.randomNode()+'/hot/'+author+'/'+link, {
                method: 'get',
                headers: {
                  'Accept': 'application/json, text/plain, */*',
                  'Content-Type': 'application/json'
                }
            }).then(res => res.json()).then(function(res) {
                cb(null, res)
            });
        }
        
    },
    randomBytes: (n) => {
        var a = new Uint8Array(n);
        for (var i = 0; i < n; i += QUOTA) {
        crypto.getRandomValues(a.subarray(i, i + Math.min(n - i, QUOTA)));
        }
        return a;
    },
    keypair: () => {
        let priv, pub
        do {
            priv = Buffer.from(avalon.randomBytes(32).buffer)
            pub = secp256k1.publicKeyCreate(priv)
        } while (!secp256k1.privateKeyVerify(priv))
    
        return {
            pub: bs58.encode(pub),        
            priv: bs58.encode(priv)
        }
    },
    pubToPriv: (priv) => {
        return bs58.encode(
                secp256k1.publicKeyCreate(
                    bs58.decode(priv)))
    },
    sign: (privKey, sender, tx) => {
        if (typeof tx !== 'object') {
            try {
                tx = JSON.parse(tx)
            } catch(e) {
                console.log('invalid transaction')
                return
            }
        }
        
        tx.sender = sender
        // add timestamp to seed the hash (avoid transactions reuse)
        tx.ts = new Date().getTime()
        // hash the transaction
        tx.hash = CryptoJS.SHA256(JSON.stringify(tx)).toString()
        // sign the transaction
        var signature = secp256k1.sign(new Buffer(tx.hash, "hex"), bs58.decode(privKey))
        tx.signature = bs58.encode(signature.signature)
        return tx
    },
    sendTransaction: (tx, cb) => {
        avalon.sendRawTransaction(tx, function(headBlock) {
            setTimeout(function() {
                avalon.verifyTransaction(tx, headBlock, 3, function(error, block) {
                    if (error) console.log(error)
                    else cb(block)
                })
            }, 1500)
        })
    },
    sendRawTransaction: (tx, cb) => {
        fetch(avalon.randomNode()+'/transact', {
            method: 'post',
            headers: {
              'Accept': 'application/json, text/plain, */*',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(tx)
        }).then(function(res) {
            res.text().then(function(headBlock) {
                cb(parseInt(headBlock))
            })
        });
    },
    verifyTransaction: (tx, headBlock, retries, cb) => {
        var nextBlock = headBlock+1
        fetch(avalon.randomNode()+'/block/'+nextBlock, {
            method: 'get',
            headers: {
              'Accept': 'application/json, text/plain, */*',
              'Content-Type': 'application/json'
            }
        }).then(res => res.text()).then(function(text) {
            try {
                var block = JSON.parse(text)
            } catch (error) {
                // block is not yet available, retrying in 1.5 secs
                setTimeout(function(){avalon.verifyTransaction(tx, headBlock, retries, cb)}, 1500)
                return
            }

            var isConfirmed = false
            for (let i = 0; i < block.txs.length; i++) {
                if (block.txs[i].hash == tx.hash) {
                    isConfirmed = true
                    break
                }
            }

            if (isConfirmed) {
                cb(null, block)
            } else if (retries > 0) {
                retries--
                setTimeout(function(){avalon.verifyTransaction(tx, nextBlock, retries, cb)},3000)
            } else {
                cb('Failed to find transaction up to block #'+nextBlock)
            }
        });
    },
    randomNode: () => {
        var nodes = avalon.config.api
        return nodes[Math.floor(Math.random()*nodes.length)]
    }
}