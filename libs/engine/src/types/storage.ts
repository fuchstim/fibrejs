export enum EStorageEventNames {
  CONFIG_UPDATED = 'CONFIG_UPDATED'
}

export type TStorageEventTypes = {
  [EStorageEventNames.CONFIG_UPDATED]: { version: string }
};
