export interface RepositoryInterface {
  findAll<T>(key: string): Promise<T[]>;
  findMany(...keys: string[]): Promise<any>;
  upsert<T>(key: string, data: T[]): Promise<void>;
  create<T extends { id: string }>(key: string, newData: T): Promise<void>;
  createMany<T extends { id: string }>(key: string, newData: T[]): Promise<void>;
  update<T extends { id: string }>(key: string, data: T): Promise<void>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  delete<T extends { id: string }>(key: string, id: string): Promise<void>;
  deleteCollection(keys: string[]): Promise<void>;
}
