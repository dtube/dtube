Template.wiki.load = function () {
    Session.set('pageTitle', 'Wiki: '+FlowRouter.getParam("page"))
    var page = FlowRouter.getParam("page")
    if (FlowRouter.getParam("folder"))
        page = FlowRouter.getParam("folder")+'/'+FlowRouter.getParam("page")

    if (typeof showdown === 'undefined')
    {
        jQuery.ajax({
            url: 'https://cdn.rawgit.com/showdownjs/showdown/1.9.1/dist/showdown.min.js',
            dataType: 'script',
            success: function() {
                getWikiContent(page)
            },
            async: true
        });
    }
    else
        getWikiContent(page)
}


// getPage("arguiot", "Glottologist", "wiki")

Template.wiki.helpers({
    page: function () {
        return FlowRouter.getParam("page")
    },
    folder: function () {
        return FlowRouter.getParam("folder")
    },
    editLink: function() {
        var link = "https://github.com/dtube/docs/edit/master/"
        var page = FlowRouter.getParam("page")
        if (FlowRouter.getParam("folder"))
            page = FlowRouter.getParam("folder") + '/'+page
        return link+page+'.md'
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
            openLinksInNewWindow: false
        })
        var html = converter.makeHtml(content)
        html = html.replace(/<table>/g, '<table class="ui table">')
        return html
    }
})

function getWikiContent(filePath) {
    if (filePath.indexOf('.md') !== filePath.length-2)
        filePath += '.md'
    fetch('https://api.github.com/repos/dtube/docs/contents/'+filePath, {mode: 'cors'})
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
                    setTimeout(() => {
                        Template.settingsdropdown.nightMode();
                    }, 100);

                })
        })
}