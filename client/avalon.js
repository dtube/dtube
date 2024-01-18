import avalon from 'javalon2';

if (localStorage.getItem('avalonAPI')) {
    avalon.init({api: localStorage.getItem('avalonAPI')})
} else {
    avalon.init({api: 'https://avalon.d.tube'})
}

Session.set('avalonAPI',avalon.config.api)

// javalon.init({api: 'https://bran.nannal.com:443'})
//javalon.init({api: 'http://localhost:3001'})
window.avalon = avalon
