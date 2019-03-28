/**
 * @typedef {Object} EventEmitterCaller
 * @property {function} callback
 * @property {Object} [context]
 */

/**
 * @typedef {EventEmitterCaller} EventEmitterListener
 * @property {string} name
 */

/**
 * @typedef {Object} EventEmitterConstructorOptions
 * @property {Object<string, Function|EventEmitterCaller>} [on]
 * @property {Object<string, Function|EventEmitterCaller>} [once]
 */

const FILTERS = {
    CALLBACK_CONTEXT: (/** EventEmitterListener */ listener, /** function */ callback, /** object */ context) => listener.callback !== callback && listener.context !== context,
    CONTEXT:          (/** EventEmitterListener */ listener, /** function */ callback, /** object */ context) => listener.context !== context,
    CALLBACK:         (/** EventEmitterListener */ listener, /** function */ callback, /** object */ context) => listener.callback !== callback,
};

class EventEmitter {
    /**
     *
     * @param {EventEmitterConstructorOptions}
     */
    constructor({on = {}, once = {}} = {}) {
        /** @type {Object<string,EventEmitterListener[]>} */
        this._listeners = {};

        Object.entries(on).forEach(([name, /** EventEmitterCaller|Function */ caller]) => this.on(name, caller instanceof Function ? caller : caller.callback, caller instanceof Function ? undefined : caller.context));
        Object.entries(once).forEach(([name, /** EventEmitterCaller|Function */ caller]) => this.once(name, caller instanceof Function ? caller : caller.callback, caller instanceof Function ? undefined : caller.context));
    }

    /**
     *
     * @param {string} name
     * @param {Function} callback
     * @param {object} [context]
     * @return {EventEmitter}
     */
    addEventListener(name, callback, context) {
        return this.on(name, callback, context);
    }

    /**
     *
     * @param {string} name
     * @param {Function} callback
     * @param {object} [context]
     * @return {EventEmitter}
     */
    addListener(name, callback, context) {
        return this.on(name, callback, context);
    }

    /**
     *
     * @param {string} name
     * @param {*} [args]
     * @return {EventEmitter}
     */
    emit(name, ...args) {
        return this.trigger(name, ...args);
    }

    /**
     *
     * @param {string|null|undefined} name
     * @param {Function|null|undefined} [callback]
     * @param {object|null|undefined} [context]
     * @return {EventEmitter}
     */
    off(name, callback, context) {
        let listener = [];
        let filter   = () => false;

        // remove all
        if (name == null && callback == null && context == null) {
            this._listeners = {};
            return this;
        }

        // remove all for name
        if (name != null && callback == null && context == null) {
            delete this._listeners[name];
            return this;
        }

        // remove all for name and callback
        if (name != null && callback != null && context == null) {
            listener = [this._listeners[name] || []];
            filter   = FILTERS.CALLBACK;
        }

        // remove all for name and callback and context
        else if (name != null && callback != null && context != null) {
            listener = [this._listeners[name] || []];
            filter   = FILTERS.CALLBACK_CONTEXT;
        }

        // remove all for callback and context
        else if (name == null && callback != null && context != null) {
            listener = Object.values(this._listeners);
            filter   = FILTERS.CALLBACK_CONTEXT;
        }

        // remove all for name and context
        else if (name != null && callback == null && context != null) {
            listener = [this._listeners[name] || []];
            filter   = FILTERS.CONTEXT;
        }

        // remove all for context
        else if (name == null && callback == null && context != null) {
            listener = Object.values(this._listeners);
            filter   = FILTERS.CONTEXT;
        }

        // remove all for callback
        else if (name == null && callback != null && context == null) {
            listener = Object.values(this._listeners);
            filter   = FILTERS.CALLBACK;
        }

        listener.forEach((/** EventEmitterListener[] */ listener) => {
            for (let i = listener.length - 1; i >= 0; i--) {
                if (filter(listener[i], callback, context) === false) {
                    listener.splice(i, 1);
                }
            }
        });

        return this;
    }

    /**
     *
     * @param {string} name
     * @param {Function} callback
     * @param {object} [context]
     * @return {EventEmitter}
     */
    on(name, callback, context) {
        this._listeners[name] = this._listeners[name] || [];
        this._listeners[name].push({
            name,
            callback,
            context,
        });

        return this;
    }

    /**
     *
     * @param {string} name
     * @param {Function} callback
     * @param {object} [context]
     * @return {EventEmitter}
     */
    once(name, callback, context) {
        const wrap = (...args) => {
            this.off(name, wrap, context);
            return callback(...args);
        };

        return this.on(name, wrap, context);
    }

    /**
     *
     * @param {string|null} name
     * @param {Function|null} [callback]
     * @param {object} [context]
     * @return {EventEmitter}
     */
    removeEventListener(name, callback, context) {
        return this.off(name, callback, context);
    }

    /**
     *
     * @param {string|null} name
     * @param {Function|null} [callback]
     * @param {object} [context]
     * @return {EventEmitter}
     */
    removeListener(name, callback, context) {
        return this.off(name, callback, context);
    }

    /**
     * @param {string} name
     * @param {*} [args]
     * @return {EventEmitter}
     */
    trigger(name, ...args) {
        (this._listeners[name] || []).forEach((/** EventEmitterListener */ listener) => listener.callback.call(listener.context, ...args));

        return this;
    }
}

export default EventEmitter;
