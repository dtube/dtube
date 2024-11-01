javalon = require('javalon2').default;

if (localStorage.getItem('avalonAPI')) {
    javalon.init({api: localStorage.getItem('avalonAPI')})
} else {
    javalon.init({api: 'https://api.avalonblocks.com'})
}

Session.set('avalonAPI',javalon.config.api)

// javalon.init({api: 'https://bran.nannal.com:443'})
//javalon.init({api: 'http://localhost:3001'})
window.avalon = javalon
