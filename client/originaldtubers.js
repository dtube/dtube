const fetch = require('node-fetch');

const listEndpoint = "https://dtube.fso.ovh:443/oc/";

function fetchList(cb) {
    fetch(listEndpoint + "creators", {
        method: 'get',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        }
    }).then(res => res.json()).then(function(res) {
        cb(null, res)
    }).catch(function(error) {
        cb(error)
    })
}

async function checkUser(username, cb) {
    res = await fetch(listEndpoint + "creator/" + username, {
        method: 'get',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        }
    })
    res = await res.text();
    if(res.trim() == 'true') {
        res = true;
    } else {
        res = false;
    }
    if(typeof cb !== 'function') {
        return res;
    } else {
        cb(null, res);
    }
}

const originaldtubers = {fetchList, checkUser};
exports.originaldtubers = originaldtubers;
