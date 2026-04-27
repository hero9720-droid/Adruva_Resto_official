import Dexie, { Table } from 'dexie';

export interface SyncItem {
  id?: number;
  url: string;
  method: 'POST' | 'PATCH' | 'DELETE' | 'PUT';
  payload: any;
  timestamp: number;
}

export interface MenuCache {
  id: string;
  data: any;
  category: string;
}

export class AdruvaOfflineDB extends Dexie {
  sync_queue!: Table<SyncItem>;
  menu_cache!: Table<MenuCache>;
  tables_cache!: Table<{ id: string; data: any }>;

  constructor() {
    super('AdruvaPOS');
    this.version(1).stores({
      sync_queue: '++id, timestamp',
      menu_cache: 'id, category',
      tables_cache: 'id'
    });
  }
}

export const db = new AdruvaOfflineDB();
