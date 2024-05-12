export const DB_KEYS = {
  STORES: 'stores',
  USERS: {
    SUPER_ADMINS: 'users|super-admins',
    ALL_BY_STORE: (storeId: string) => `users|store:${storeId}`,
  },
  TASKS: {
    DAILY: (storeId: string, date: string) => `tasks-daily|store:${storeId}|date:${date}`,
    REPEATS: (storeId: string) => `tasks-repeats|store:${storeId}`,
    ALL_BY_STORE: (storeId: string) => `tasks-daily|store:${storeId}|*`,
  },
  TASK_TEMPLATES: {
    ALL_BY_USER: (userId: string) => `task-templates|user:${userId}`,
  },
  SECTIONS: {
    ALL_BY_STORE: (storeId: string) => `sections|store:${storeId}`,
  },
};
