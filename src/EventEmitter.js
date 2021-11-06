const FILTERS = {
    CALLBACK_CONTEXT: (listener, callback, context) => listener.callback !== callback || listener.context !== context,
    CONTEXT:          (listener, callback, context) => listener.context !== context,
    CALLBACK:         (listener, callback) => listener.callback !== callback,
};

export default class EventEmitter {
    static CATCH_ALL = '*';

    /** @type {Object<EventEmitter.EventName,EventEmitter.EventListenerData[]>} */
    _listeners;

    /**
     *
     * @param {EventEmitter.EventListeners} on
     * @param {EventEmitter.EventListeners} once
     */
    constructor({on = {}, once = {}} = {}) {
        this._listeners = {};

        Object.entries(on).forEach(([name, caller]) => this.on(name, caller?.callback ?? caller, caller?.context));
        Object.entries(once).forEach(([name, caller]) => this.once(name, caller?.callback ?? caller, caller?.context));
    }

    /**
     *
     * @param {EventEmitter.EventName} name
     * @param {EventEmitter.EventListener} callback
     * @param {EventEmitter.EventContext} [context]
     * @return {EventEmitter}
     */
    addEventListener(name, callback, context) {
        return this.on(name, callback, context);
    }

    /**
     *
     * @param {EventEmitter.EventName} name
     * @param {EventEmitter.EventListener} callback
     * @param {EventEmitter.EventContext} [context]
     * @return {EventEmitter}
     */
    addListener(name, callback, context) {
        return this.on(name, callback, context);
    }

    /**
     *
     * @param {EventEmitter.EventName} name
     * @param {*[]} [args]
     * @return {EventEmitter}
     */
    emit(name, ...args) {
        (this._listeners[name] || []).forEach((listener) => listener.callback.call(listener.context, ...args));
        (this._listeners[EventEmitter.CATCH_ALL] || []).forEach((listener) => listener.callback.call(listener.context, name, ...args));

        return this;
    }

    /**
     *
     * @param {EventEmitter.EventName|null} [name]
     * @param {EventEmitter.EventListener|null} [callback]
     * @param {EventEmitter.EventContext|null} [context]
     * @return {EventEmitter}
     */
    off(name, callback, context) {
        let listener = [];
        let filter   = () => false;

        // #1 remove all
        if (name == null && callback == null && context == null) {
            this._listeners = {};
            return this;
        }

        // #2 remove all for name
        if (name != null && callback == null && context == null) {
            delete this._listeners[name];
            return this;
        }

        // #3 remove all for name and callback
        if (name != null && callback != null && context == null) {
            listener = [this._listeners[name] || []];
            filter   = FILTERS.CALLBACK;
        }

        // #4 remove all for name and callback and context
        else if (name != null && callback != null && context != null) {
            listener = [this._listeners[name] || []];
            filter   = FILTERS.CALLBACK_CONTEXT;
        }

        // #5 remove all for callback and context
        else if (name == null && callback != null && context != null) {
            listener = Object.values(this._listeners);
            filter   = FILTERS.CALLBACK_CONTEXT;
        }

        // #6 remove all for name and context
        else if (name != null && callback == null && context != null) {
            listener = [this._listeners[name] || []];
            filter   = FILTERS.CONTEXT;
        }

        // #7 remove all for context
        else if (name == null && callback == null && context != null) {
            listener = Object.values(this._listeners);
            filter   = FILTERS.CONTEXT;
        }

        // #8 remove all for callback
        else if (name == null && callback != null && context == null) {
            listener = Object.values(this._listeners);
            filter   = FILTERS.CALLBACK;
        }

        listener.forEach((listener) => {
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
     * @param {EventEmitter.EventName} name
     * @param {EventEmitter.EventListener} callback
     * @param {EventEmitter.EventContext} [context]
     * @return {EventEmitter}
     */
    on(name, callback, context) {
        this._listeners[name] = this._listeners[name] || [];
        this._listeners[name].push({
            callback,
            context,
        });

        return this;
    }

    /**
     *
     * @param {EventEmitter.EventName} name
     * @param {EventEmitter.EventListener} callback
     * @param {EventEmitter.EventContext} [context]
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
     * @param {EventEmitter.EventName|null} [name]
     * @param {EventEmitter.EventListener|null} [callback]
     * @param {EventEmitter.EventContext} [context]
     * @return {EventEmitter}
     */
    removeEventListener(name, callback, context) {
        return this.off(name, callback, context);
    }

    /**
     *
     * @param {EventEmitter.EventName|null} [name]
     * @param {EventEmitter.EventListener|null} [callback]
     * @param {EventEmitter.EventContext} [context]
     * @return {EventEmitter}
     */
    removeListener(name, callback, context) {
        return this.off(name, callback, context);
    }

    /**
     * @param {EventEmitter.EventName} name
     * @param {*[]} [args]
     * @return {EventEmitter}
     */
    trigger(name, ...args) {
        return this.emit(name, ...args)
    }
}
