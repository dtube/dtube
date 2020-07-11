Template.wiki.load = function () {
    Session.set('pageTitle', 'Wiki: '+FlowRouter.getParam("page"))
    if (typeof showdown === 'undefined')
        jQuery.ajax({
            url: 'https://cdn.rawgit.com/showdownjs/showdown/1.9.1/dist/showdown.min.js',
            dataType: 'script',
            success: function() {
                getWikiContent(FlowRouter.getParam("page"))
            },
            async: true
        });
    else
        getWikiContent(FlowRouter.getParam("page"))
}


// getPage("arguiot", "Glottologist", "wiki")

Template.wiki.helpers({
    page: function () {
        return FlowRouter.getParam("page").split('\\')
    },
    markdown: function() {
        var content = Session.get('wikiContent')
        if (typeof showdown === 'undefined')
            return ''
        var converter = new showdown.Converter({
            tables: true,
            strikethrough: true,
            tasklists: true,
            ghCodeBlocks: true,
            openLinksInNewWindow: true
        })
        var html = converter.makeHtml(content)
        html = html.replace(/<table>/g, '<table class="ui table">')
        return html
    }
})

function getWikiContent(filePath) {
    filePath = filePath.replace(/\\/g, '/')
    if (filePath.indexOf('.md') !== filePath.length-2)
        filePath += '.md'
    fetch('https://api.github.com/repos/dtube/Contribute/contents/'+filePath, {mode: 'cors'})
        .then(data => data.json())
        .then(data => {
            if (!data || !data.download_url) {
                console.log('Could not fetch Wiki page: '+filePath)
                Session.set('wikiContent', '#Not found')
                return
            }
            fetch(data.download_url, {mode: 'cors'})
                .then(data => data.text())
                .then(data => {
                    Session.set('wikiContent', data)
                })
        })
}