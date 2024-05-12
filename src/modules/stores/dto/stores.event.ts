export type StoreLeafletChangedEvent = {
  storeId: string;
  leafletLink: string;
};

export type StoreClearInfoEvent = {
  storeId: string;
};

export type StoreDeactivateEvent = StoreClearInfoEvent;
