WatchAgain = new Mongo.Collection(null)
watchAgainObserver = new PersistentMinimongo2(WatchAgain, 'watchagain', function() {
    Session.set('watchAgainLoaded', true)
});
