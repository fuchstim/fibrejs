import BaseEventEmitter from 'events';

type TEventTypeMap = Record<string, object>;
type TEventName<T extends TEventTypeMap> = string & keyof T;
type TEventListener<T> = (payload: T) => void | Promise<void>;

export default class EventEmitter<T extends TEventTypeMap> extends BaseEventEmitter {
  on<N extends TEventName<T>>(eventName: N, listener: TEventListener<T[N]>) {
    return super.on(eventName, listener);
  }

  off<N extends TEventName<T>>(eventName: N, listener: TEventListener<T[N]>) {
    return super.off(eventName, listener);
  }

  emit<N extends TEventName<T>>(eventName: N, payload: T[N]) {
    return super.emit(eventName, payload);
  }

  addListener<N extends TEventName<T>>(eventName: N, listener: TEventListener<T[N]>) {
    return super.addListener(eventName, listener);
  }

  once<N extends TEventName<T>>(eventName: N, listener: TEventListener<T[N]>) {
    return super.once(eventName, listener);
  }

  removeListener<N extends TEventName<T>>(eventName: N, listener: TEventListener<T[N]>) {
    return super.removeListener(eventName, listener);
  }

  removeAllListeners<N extends TEventName<T>>(eventName: N) {
    return super.removeAllListeners(eventName);
  }

  listeners<N extends TEventName<T>>(eventName: N): TEventListener<T[N]>[] {
    return super.listeners(eventName) as TEventListener<T[N]>[];
  }

  rawListeners<N extends TEventName<T>>(eventName: N): TEventListener<T[N]>[] {
    return super.rawListeners(eventName) as TEventListener<T[N]>[];
  }

  listenerCount<N extends TEventName<T>>(eventName: N): number {
    return super.listenerCount(eventName);
  }

  prependListener<N extends TEventName<T>>(eventName: N, listener: TEventListener<T[N]>) {
    return super.prependListener(eventName, listener);
  }

  prependOnceListener<N extends TEventName<T>>(eventName: N, listener: TEventListener<T[N]>) {
    return super.prependOnceListener(eventName, listener);
  }

  eventNames() {
    return super.eventNames() as unknown as TEventName<T>[];
  }
}
