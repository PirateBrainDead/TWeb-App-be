import { storeIdMock } from '../../../tasks/tests/__mocks__/tasks.mocks';
import { UpdateStoreDto } from '../../dto/update-store.dto';
import { Store } from '../../entity/store.entity';
import { StoreWithUsers } from '../../dto/user-stores.dto';
import { CreateStoreDto } from '../../dto/create-store.dto';

export const updateStoreDtoMock = {
  leafletLink: 'https://update12333.com',
} as UpdateStoreDto;

export const savedStoreMock = {
  id: storeIdMock,
  leafletLink: 'https://update12333.com',
  name: 'test store',
  active: true,
} as Store;

export const savedStoreWithUsersMock: StoreWithUsers = {
  storeId: storeIdMock,
  storeName: 'test store',
  storeActive: true,
  managerApp: 'managerapp',
  hqApp: 'hqapp',
};

export const createStoreDtoMock: CreateStoreDto = {
  storeName: 'new store',
  managerUsername: 'managerUsername',
  managerPassword: 'test123',
  managerConfirmPassword: 'test123',
  hqUsername: 'hqUsername',
  hqPassword: 'test123',
  hqConfirmPassword: 'test123',
};

export const storesMock = [
  {
    id: storeIdMock,
    name: 'First Store',
    active: true,
    leafletLink: '',
  },
] as Store[];
