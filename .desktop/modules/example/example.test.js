/* eslint-disable no-console */
import test from 'ava';
import { Application } from 'spectron';
import path from 'path';
import fs from 'fs';
import shell from 'shelljs';
import electron from 'electron';
import {
    constructModule, createTestAppWithModule, fetch,
    fireEventsBusEventAndWaitForAnother
} from
    'meteor-desktop-test-suite';

/**
 * For this to work, init testing with `npm run desktop -- init-tests-support`.
 * This will add necessary packages to your `devDependencies` and add `desktop-test` to scripts.
 *
 * This is an example of functional test for your module.
 *
 * You could test your module from the built app, like in desktop.test.js.
 *
 * Here instead we will treat this module like a separate plugin and test it in a test app instance.
 * This has a significant advantage as you do not have to rebuild the desktop app if you made
 * changes in the module - you just need to rerun the tests which is usually faster.
 *
 * However if your module is importing files from the outside of its dir this will fail - support
 * for that is planned - vote on features on meteor-desktop issues list on github.
 *
 * Be aware that you can specify npm dependencies in the dependencies section of module.json -
 * those will be installed in the test app.
 */

let userData;
let appDir;

async function getApp(t) {
    // Waits for the test app to start.
    const app = t.context.app;
    await app.client.waitUntilWindowLoaded();
    t.is(await app.client.getWindowCount(), 1);
    return app;
}

test.before(
    async () => {
        // Create a new test app with this module included.
        appDir = await createTestAppWithModule(
            null, __dirname);
    }
);

test.after(
    () => {
        // Remove the test app and its data.
        shell.rm('-rf', userData);
        shell.rm('-rf', appDir);
    }
);

test.beforeEach(async (t) => {
    // Every test start a new instance of the test app.
    t.context.app = new Application({ // eslint-disable-line no-param-reassign
        path: electron,
        args: [appDir],
        env: { ELECTRON_ENV: 'test' }
    });
    await t.context.app.start();
    userData = await t.context.app.electron.remote.app.getPath('userData');
});

test.afterEach.always(async (t) => {
    try {
        // Test app saves an error.txt file if it encounters an uncaught exception.
        // It is good to see it's contents if it is present.
        const errorFile = path.join(appDir, 'error.txt');
        console.log(
            'error caught in the test app:',
            fs.readFileSync(errorFile, 'utf8')
        );
        fs.unlinkSync(errorFile);
    } catch (e) {
        // No error.txt present. That's good!
    }

    if (t.context.app && t.context.app.isRunning()) {
        await t.context.app.stop();
    }
});

test('the test app', async t => await getApp(t));

test.serial('if testEvent returns true for 1', async (t) => {
    const app = await getApp(t);
    await constructModule(app);
    await fireEventsBusEventAndWaitForAnother(app, 'desktopLoaded', 'example.loaded');
    const response = await fetch(app, 'example', 'testEvent', 1);
    // Fetch returns an array with the response event arguments.
    t.true(response[0]);
});

test.serial('if testEvent returns false for 5', async (t) => {
    const app = await getApp(t);
    await constructModule(app);
    await fireEventsBusEventAndWaitForAnother(app, 'desktopLoaded', 'example.loaded');
    const response = await fetch(app, 'example', 'testEvent', 5);
    // Fetch returns an array with the response event arguments.
    t.false(response[0]);
});
