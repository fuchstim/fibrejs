import { TEventTypes } from '../types/events';
import EventEmitter from './event-emitter';

class EventBus extends EventEmitter<TEventTypes> {}

export default new EventBus();
