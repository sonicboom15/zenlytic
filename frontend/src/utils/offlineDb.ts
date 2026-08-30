import { OfflineOrderDraft } from '../types/order';
import { Customer } from '../types/customer';
import { Product } from '../types/product';

const DB_NAME = 'zenlytic_offline_db';
const DB_VERSION = 1;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('order_outbox')) {
        db.createObjectStore('order_outbox', { keyPath: 'localId' });
      }
      if (!db.objectStoreNames.contains('cached_customers')) {
        db.createObjectStore('cached_customers', { keyPath: 'customerId' });
      }
      if (!db.objectStoreNames.contains('cached_products')) {
        db.createObjectStore('cached_products', { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const offlineDb = {
  // Order Outbox
  saveDraftOrder: async (draft: OfflineOrderDraft): Promise<void> => {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('order_outbox', 'readwrite');
      tx.objectStore('order_outbox').put(draft);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  getQueuedOrders: async (): Promise<OfflineOrderDraft[]> => {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('order_outbox', 'readonly');
      const req = tx.objectStore('order_outbox').getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  },

  deleteDraftOrder: async (localId: string): Promise<void> => {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('order_outbox', 'readwrite');
      tx.objectStore('order_outbox').delete(localId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  // Cache Master Data
  cacheCustomers: async (customers: Customer[]): Promise<void> => {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('cached_customers', 'readwrite');
      const store = tx.objectStore('cached_customers');
      store.clear();
      customers.forEach((c) => store.put(c));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  getCachedCustomers: async (): Promise<Customer[]> => {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('cached_customers', 'readonly');
      const req = tx.objectStore('cached_customers').getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  },

  cacheProducts: async (products: Product[]): Promise<void> => {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('cached_products', 'readwrite');
      const store = tx.objectStore('cached_products');
      store.clear();
      products.forEach((p) => store.put(p));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  getCachedProducts: async (): Promise<Product[]> => {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('cached_products', 'readonly');
      const req = tx.objectStore('cached_products').getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }
};

