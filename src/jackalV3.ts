// src/jackalV3.ts
import { ClientHandler, type IClientHandler, type IStorageHandler } from '@jackallabs/jackal.js';

// Keep singletons so the app can reuse connections
let client: IClientHandler | null = null;
let storage: IStorageHandler | null = null;

/**
 * Connect the wallet (Keplr/Leap) and bootstrap storage.
 * Call this once (e.g., after user clicks "Connect").
 */
export async function connectJackal(opts: {
  // Jackal chain (RPC & chain-id)
  chainId: string;
  endpoint: string;
  // Host chain (used internally by SDK)
  host: { chainId: string; endpoint: string; chainConfig: any };
  // 'keplr' or 'leap'
  selectedWallet?: 'keplr' | 'leap';
}) {
  client = await ClientHandler.connect({
    selectedWallet: opts.selectedWallet ?? 'keplr',
    chainId: opts.chainId,
    endpoint: opts.endpoint,
    host: {
      chainConfig: opts.host.chainConfig,
      chainId: opts.host.chainId,
      endpoint: opts.host.endpoint
    }
  });
  storage = await client.createStorageHandler();
  await storage.initStorage();
  return {
    address: await client.getJackalAddress(),
    balance: await client.getJklBalance()
  };
}

/** Read a folder and return simple lists you can render. */
export async function listFolder(path: string) {
  if (!storage) throw new Error('Not connected');
  await storage.loadDirectory({ path }); // populates internal buffers
  return {
    folders: storage.listChildFolders(),
    files: storage.listChildFiles()
  };
}

/** Create one or more folders under a path. */
export async function createFolders(relativePath: string, names: string[]) {
  if (!storage) throw new Error('Not connected');
  return storage.createFolders({ names, relativePath });
}

/** Estimate JKL cost for gb/days and (optionally) purchase. */
export async function estimateStorage(gb: number, days: number) {
  if (!storage) throw new Error('Not connected');
  return storage.estimateStoragePlan({ gb, days });
}
export async function buyStorage(gb: number, days: number) {
  if (!storage) throw new Error('Not connected');
  return storage.purchaseStoragePlan({ gb, days });
}

/** Upload: queue files (public or private) then process queues. */
export async function uploadFiles(files: File[], isPrivate = false, durationDays = 0) {
  if (!storage) throw new Error('Not connected');
  if (isPrivate) {
    await storage.queuePrivate(files, durationDays);
  } else {
    await storage.queuePublic(files, durationDays);
  }
  await storage.processAllQueues();
}

/** Quick helpers */
export async function getProviders() {
  if (!storage) throw new Error('Not connected');
  return storage.getAvailableProviders();
}
export function isReady() {
  return Boolean(client && storage);
}
export async function jackalAddress() {
  if (!client) throw new Error('Not connected');
  return client.getJackalAddress();
}
