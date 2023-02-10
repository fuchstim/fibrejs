export enum EEventName {
  CONFIG_UPDATED = 'CONFIG_UPDATED',
}

export type TEventTypes = {
  [EEventName.CONFIG_UPDATED]: { version: string },
};
