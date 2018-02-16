/**
 * Simple class that allows to hook into Squirrel.Windows events.
 */
export default class SquirrelEvents {
    /**
     * @param {Squirrel} Squirrel - reference to the Squirrel class
     */
    constructor(Squirrel) {
        this.Squirrel = Squirrel;
    }

    /**
     * Invoked during installation.
     */
    install() {
        this.Squirrel.createShortcuts();
    }

    /**
     * Invoked on first run.
     */
    firstRun() { // eslint-disable-line class-methods-use-this
    }

    /**
     * Invoked during update.
     */
    updated() {
        this.Squirrel.updateShortcuts();
    }

    /**
     * Invoked during uninstall.
     */
    uninstall() {
        this.Squirrel.removeShortcuts();
    }
}
