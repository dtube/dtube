/* eslint-disable no-unused-vars */
import moduleJson from './module.json';

/**
 * Example module.
 *
 * @param {Object} log         - Winston logger instance
 * @param {Object} skeletonApp - reference to the skeleton app instance
 * @param {Object} appSettings - settings.json contents
 * @param {Object} eventsBus   - event emitter for listening or emitting events
 *                               shared across skeleton app and every module/plugin
 * @param {Object} modules     - references to all loaded modules
 * @param {Object} settings    - module settings
 * @param {Object} Module      - reference to the Module class
 * @constructor
 */
export default class Example {
    constructor({ log, skeletonApp, appSettings, eventsBus, modules, settings, Module }) {
        /**
         * You can delete unused vars from the param destructuring.
         * Left them here just to emphasize what is passed. Delete the eslint rule at the top
         * when done.
         * You can also just have a one `config` param and do `Object.assign(this, config);`
         */
        this.module = new Module(moduleJson.name);

        // Get the automatically predefined logger instance.
        this.log = log;
        this.eventsBus = eventsBus;

        // Never do time consuming or blocking things directly in the constructor.
        // Instead hook to 'beforeDesktopJsLoad`, `desktopLoaded` or `afterInitialization` events.
        // This will also ensure plugins providing things like splash screens will be able
        // to start as quickly as possible.
        this.eventsBus.on('desktopLoaded', () => {
            this.init();
        });
    }

    init() {
        // Do some initialization if necessary.

        this.registerApi();

        // Lets inform that the module has finished loading.
        this.eventsBus.emit(`${moduleJson.name}.loaded`);
    }

    registerApi() {
        // Lets create a test event.
        this.module.on('testEvent', (event, fetchId, testArg) => {
            // Nothing fancy here, we will just respond with the result of testArg === 1.
            // fetchId is necessary for the system to know to which request the response is for.
            // It will be present if you will emit this event in Meteor app with `Desktop.fetch`.
            this.module.respond('testEvent', fetchId, testArg === 1);
        });
    }
}
