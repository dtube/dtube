// This is for persistent client-side settings !

UserSettings = new Mongo.Collection(null)
userSettingsObserver = new PersistentMinimongo2(UserSettings, 'usersettings');

UserSettings.set = function(key, value) {
    UserSettings.remove({k: key})
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