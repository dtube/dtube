// This is for persistent client-side settings !

UserSettings = new Mongo.Collection(null)
userSettingsObserver = new PersistentMinimongo2(UserSettings, 'usersettings', function() {
    // load language
    loadDefaultLang(function() {
        loadLangAuto(function() {
            console.log('Loaded languages')
            // start router
            FlowRouter.initialize({hashbang: true}, function() {
                console.log('Router initialized')
            });
            // handle manual fragment change
            $(window).on('hashchange', function() {
                FlowRouter.go(window.location.hash)
            });
        })
    })
});

UserSettings.set = function(key, value) {
    UserSettings.remove({
        k: key,
        u: Session.get('activeUsername')
    })
    var obj = {
        k: key,
        v: value,
        u: Session.get('activeUsername')
    }
    UserSettings.insert(obj)
}

UserSettings.get = function(key) {
    var setting = UserSettings.findOne({k: key, u: Session.get('activeUsername')})
    if (!setting) return 0
    return setting.v
}