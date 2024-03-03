Template.uploadform.events({
    'click .external': function (event) {
        var hash = $(event.currentTarget).parent().next()[0].value
        if (hash && hash.length > 40)
        window.open('https://ipfs.io/ipfs/' + hash)
    }
})