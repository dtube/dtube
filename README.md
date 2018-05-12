# DTube App Documentation

This is the main javascript application you can use on d.tube. This is probably the starting point for anyone wanting to contribute to d.tube.

## Install

### Install Meteor
* Linux and Mac: `curl https://install.meteor.com/ | sh`
* Windows: [link](https://www.meteor.com/install)

### Install the app

Clone this repository and `meteor npm install` in it. This will install all dependencies coming from npm including the ones required for development.

### Start the app
Finally, do `meteor` in the folder to start the app in development mode.
##### Options:
* `-p 3456` for running on a different port than the default 3000.
* `--production` will minify and merge the javascript and css files.

Meteor will automatically push any change on the code to the browser while you keep the meteor dev server running.

## Structure

 - `.meteor` meteor files, don't touch unless you know what you are doing.
 - `.vscode` if you use visual studio code.
 - `public` all the static files like pictures, fonts and translations.
 - `client` all the app code
 - - `client/collections` minimongo collections that templates feed from
 - - `client/css` css files.
 - - `client/lib` semantic ui related code.
 - - `client/views` templates, each has 2 files, html and js, a handlebar template and associated logic.
 - - - `client/views/commons` all the re-used templates
 - - - `client/views/pages` all the templates matching a route in `router.js`
 - - - `client/views/topbar` the fixed menu on top of the app
 - - - `client/views/sidebar` the sidebar menu

## Common Issues

If you are using windows, the `meteor npm` seems to be buggy at times. You can try using the normal `npm` instead if you have that installed.

After each meteor or package.json update, you will need to re-run `meteor npm install`

## Working with Uploads

For doing anything on the upload side, it is strongly recommended to run your own [dtube/ipfs-uploader](https://github.com/dtube/ipfs-uploader). Then simply point `upload.js` to `localhost:5000` instead of our production encoding servers.

## Working on the Player

As you can see, we use the embed directly available on emb.d.tube. This is the [dtube/embed](https://github.com/dtube/embed) repository. Feel free to clone it and directly point the `player.js` to your file:// version of the player.

