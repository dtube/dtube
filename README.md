[![Crowdin](https://d322cqt584bo4o.cloudfront.net/dtube/localized.svg)](https://crowdin.com/project/dtube)
[![License: GPL v3](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![DTube channel on Discord](https://img.shields.io/discord/347020217966395393.svg?logo=discord)](https://discord.gg/dtube)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

# DTube App

This is the main javascript application you can use on d.tube. This is probably the starting point for anyone wanting to contribute to d.tube.

## Preview

![DTube Homepage Preview](https://i.imgur.com/G6knxMI.png)

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

## Going in-depth
### Running blockchain locally
You can run a blockchain locally on your PC to avoid sending transactions onto the live network. Follow instructions in [dtube/avalon](https://github.com/dtube/avalon), then just change API to 'localhost:3001' in the settings page to point your UI to your development chain.

### Working with Uploads

For doing anything on the upload side, it is strongly recommended to run your own [dtube/ipfs-uploader](https://github.com/dtube/ipfs-uploader). Once running, simply turn the `localhost` setting to `true` in `client/settings.js` and it will upload locally instead of our production servers.

### Working on the Player

As you can see, we use the embed directly available on emb.d.tube. This is the [dtube/embed](https://github.com/dtube/embed) repository. Feel free to clone it and directly point the `client/views/commons/videos/player.js` to your file:// version of the player if you want to make changes that include the player.

### Working with pre-rendering for bots

The [dtube/minidtube](https://github.com/dtube/minidtube) repository is responsible for all the pre-rendering and serving a decent version of d.tube to bots which normally wouldn't be able to.

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

For any help, feel free to join us in our [Discord Channel](https://discord.gg/dtube)

## Contributing
If you want to contribute to the project, please read [this page](https://d.tube/#!/wiki/contribute).
