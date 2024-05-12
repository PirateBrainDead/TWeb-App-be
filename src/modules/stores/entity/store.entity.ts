export type Store = {
  id: string;
  name: string;
  leafletLink: string;
  active: boolean;
};

export const createNewStore = (name: string): Omit<Store, 'id'> => {
  return { name, active: true, leafletLink: '' };
};
