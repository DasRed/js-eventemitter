export namespace EventEmitter {
    type EventName = string;
    type EventContext = object;
    type EventListener = () => Promise<void> | void;

    interface EventListenerData {
        name: EventName;
        callback: EventListener
        context?: EventContext
    }

    interface EventListeners {
        [key: string]: EventListener | EventListenerData;
    }

    interface ConstructorOptions {
        on?: EventListeners;
        once?: EventListeners;
    }

    interface EventEmitterConstructor {
        new(options?: ConstructorOptions): EventEmitter;
    }
}
export default class EventEmitter {
    constructor(options: EventEmitter.ConstructorOptions);

    on(name: EventEmitter.EventName, listener: EventEmitter.EventListener, context?: EventEmitter.EventContext): this;
    once(name: EventEmitter.EventName, listener: EventEmitter.EventListener, context?: EventEmitter.EventContext): this;
    off(name?: EventEmitter.EventName | null, listener?: EventEmitter.EventListener | null, context?: EventEmitter.EventContext | null): this;
    emit(name: EventEmitter.EventName, ...args: any[]): Promise<this>;
}
