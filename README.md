# dtube dev documentation

## Install

While dtube is still on BitBucket, clone from the link BitBucket gives you.

Once cloned, `cd` into the new repo.

You'll also need to make sure Meteor is installed first:

`curl https://install.meteor.com/ | sh`

Finally,

`meteor npm install`

Then do `meteor` in the folder.

(or `meteor --production`)

This might take 15 minutes, but then it'll say you can open localhost:3000

If you have problems with the app, try doing the following: 

```
cd ..
git clone http://github.com/skzap/waka2
git clone http://github.com/skzap/Autolinker.js
```

Then `cd` back into the dtube repo you cloned and:

```
meteor npm link ../waka2
meteor npm link ../Autolinker.js
```

And open up the app again.

## Structure

 - `.meteor` meteor files, don't touch unless you know what you are doing.
 - `.vscode` if you use visual studio code.
 - `public` static files like pics.
 - `client` all the app code
 - - `client/collections` minimongo tables.
 - - `client/css` css files.
 - - `client/lib` semantic ui related code.
 - - `client/views` views, each has 2 files, html and js, a handlebar template and logic.

That is it! All the rest of the logic is in the `/client/` folder.

## Problems

After each fix, you may need to re-run the install steps.

Adding new NPM packages causes things to break?

Fix: You may need NPM version `5.7.1` or higher.

Meteor is complaining about babel spread and crashing?

Fix: `meteor npm install @babel/runtime@latest`

