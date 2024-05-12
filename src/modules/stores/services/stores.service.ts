import { Injectable } from '@nestjs/common';
import { StoreActivationDto, UpdateStoreDto } from '../dto/update-store.dto';
import { createNewStore, Store } from '../entity/store.entity';
import { CellClsService } from '../../libs/cls/cell-cls.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EVENTS } from '../../../shared/constants/evens.constants';
import { StoreDeactivateEvent, StoreLeafletChangedEvent } from '../dto/stores.event';
import { StoreWithUsers } from '../dto/user-stores.dto';
import { UsersRepository } from '../../users/users.repository';
import { CreateStoreDto } from '../dto/create-store.dto';
import { StoresRepository } from '../stores.repository';
import { StoresValidationService } from './stores-validation.service';
import { partition } from '../../../shared/utils/partition.utils';
import { createNewUser, User } from '../../users/entities/user.entity';
import { Role } from '../../users/entities/role.enum';
import { UsersValidationService } from '../../users/services/users-validation.service';

@Injectable()
export class StoresService {
  constructor(
    private readonly storesValidationService: StoresValidationService,
    private readonly usersValidationService: UsersValidationService,
    private readonly storesRepository: StoresRepository,
    private readonly usersRepository: UsersRepository,
    private readonly cls: CellClsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAll(): Promise<StoreWithUsers[]> {
    const stores = await this.storesRepository.findAll();
    const storesWithUsers: StoreWithUsers[] = [];
    for (const store of stores) {
      const users = await this.usersRepository.findAll(store.id);
      const [managers, hqs] = partition<User>(users, (user) => user.role === Role.Manager);

      storesWithUsers.push({
        storeId: store.id,
        storeName: store.name,
        storeActive: store.active,
        managerApp: managers[0].username,
        hqApp: hqs[0].username,
      });
    }

    return storesWithUsers;
  }

  async findById(): Promise<Store> {
    return await this.storesRepository.findById(this.cls.storeId);
  }

  async create({
    hqPassword,
    hqUsername,
    managerPassword,
    managerUsername,
    storeName,
  }: CreateStoreDto): Promise<boolean> {
    const stores = await this.storesRepository.findAll();
    this.storesValidationService.validateUniqueStoreName(storeName, stores);

    const allUsernames = await this.usersRepository.findAllUsernamesFromStores(stores);
    this.usersValidationService.validateUsernameUnique(managerUsername, allUsernames, Role.Manager);
    this.usersValidationService.validateUsernameUnique(hqUsername, allUsernames, Role.HQ);

    const createStore: Omit<Store, 'id'> = createNewStore(storeName);
    const store = await this.storesRepository.create(createStore);

    const manager = await createNewUser(managerUsername, managerPassword, Role.Manager);
    const hq = await createNewUser(hqUsername, hqPassword, Role.HQ);

    await this.usersRepository.create(manager, store.id);
    await this.usersRepository.create(hq, store.id);

    return true;
  }

  async update(updateStoreDto: UpdateStoreDto): Promise<boolean> {
    const store = await this.storesRepository.findById(this.cls.storeId);

    const updatedStore = { ...store, ...updateStoreDto };
    await this.storesRepository.update(updatedStore);

    const storeEvent: StoreLeafletChangedEvent = {
      storeId: this.cls.storeId,
      leafletLink: updateStoreDto.leafletLink,
    };
    this.eventEmitter.emit(EVENTS.STORES.LEAFLET_CHANGED, storeEvent);

    return true;
  }

  async updateActivation(storeActivationDto: StoreActivationDto): Promise<boolean> {
    const store = await this.storesRepository.findById(storeActivationDto.id);

    const updatedStore: Store = { ...store, active: storeActivationDto.activate };
    await this.storesRepository.update(updatedStore);

    if (!storeActivationDto.activate) {
      const storeEvent: StoreDeactivateEvent = { storeId: storeActivationDto.id };
      this.eventEmitter.emit(EVENTS.STORES.DEACTIVATION, storeEvent);
    }

    return true;
  }
}
