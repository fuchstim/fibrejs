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
}
