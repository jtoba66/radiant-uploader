// src/jackalV3.ts
import {
  ClientHandler,
  type IClientHandler,
  type IStorageHandler,
} from "@jackallabs/jackal.js";
import { mainnet } from "./config/mainnet";

let client: IClientHandler | null = null;
let storage: IStorageHandler | null = null;

/**
 * Establish a Jackal mainnet connection.
 * Uses official Keplr API (enable + getKey) and Keplr registry chainConfig.
 */
export async function connectJackal(
  opts: { selectedWallet?: "keplr" | "leap" } = {}
): Promise<{ address: string; balance: number }> {
  if (typeof window === "undefined") {
    throw new Error("Wallets unavailable in server-side context");
  }

  const anyWindow = window as unknown as {
    keplr?: any;
    leap?: any;
    getOfflineSigner?: (chainId: string) => any;
  };

  const walletProvider =
    opts.selectedWallet === "leap" && anyWindow.leap
      ? anyWindow.leap
      : anyWindow.keplr;

  if (!walletProvider) {
    throw new Error("No supported wallet found. Please install Keplr or Leap.");
  }

  const { chainId, rpcEndpoint, host } = mainnet;

  try {
    console.log("🔗 Requesting wallet connection...");

    // ✅ Suggest chain only if needed (clean config)
    if (walletProvider.experimentalSuggestChain) {
      try {
        await walletProvider.experimentalSuggestChain({
          ...host.chainConfig,
          chainId,
          rpc: rpcEndpoint,
          rest:
            host.chainConfig.rest ??
            "https://lcd-jackal.keplr.app",
          stakeCurrency: host.chainConfig.stakeCurrency,
          feeCurrencies: host.chainConfig.feeCurrencies,
          features: host.chainConfig.features ?? ["cosmwasm"],
        });
      } catch {
        console.info("Chain already registered, skipping suggestChain");
      }
    }

    // ✅ Unlock / request permission
    await walletProvider.enable(chainId);

    // ✅ Retrieve key info (modern Keplr API)
    const key = await walletProvider.getKey(chainId);
    const address = key.bech32Address;
    console.log("👛 Wallet address:", address);

    // ✅ Create signer after unlock confirmed
    const offlineSigner =
      walletProvider.getOfflineSigner?.(chainId) ??
      anyWindow.getOfflineSigner?.(chainId);

    if (!offlineSigner) {
      throw new Error("Unable to get offline signer from wallet.");
    }

    // ✅ Connect to Jackal.js client
    console.log("🌐 Connecting to Jackal mainnet...");
    client = await ClientHandler.connect({
      selectedWallet: opts.selectedWallet ?? "keplr",
      chainId,
      endpoint: rpcEndpoint,
      host,
    });

    // ✅ Initialize StorageHandler
    storage = await client.createStorageHandler();
    if (storage.initStorage) {
      await storage.initStorage();
    }

    const balance = (await client.getJklBalance()) / 1_000_000;
    console.log(`✅ Connected: ${address}, Balance: ${balance} JKL`);

    return { address, balance };
  } catch (err: any) {
    console.error("❌ Wallet connection failed:", err.message || err);
    throw err;
  }
}

/** Retrieve normalized JKL balance (uJKL → JKL). */
export async function getBalance() {
  if (!client) throw new Error("Jackal not connected");
  const balance = await client.getJklBalance();
  return balance / 1_000_000;
}

/** List contents of a directory path. */
export async function listFolder(path: string) {
  if (!storage) throw new Error("Jackal not connected");
  await storage.loadDirectory({ path });
  return {
    folders: storage.listChildFolders(),
    files: storage.listChildFiles(),
  };
}

/** Create one or more folders (v3.7.2 final signature). */
export async function createFolders(_path: string, names: string[]) {
  if (!storage) throw new Error("Jackal not connected");
  return storage.createFolders({ names }); // ✅ only "names" allowed
}

/** Estimate cost (GB × days) — auto-normalized to JKL. */
export async function estimateStorage(gb: number, days: number) {
  if (!storage) throw new Error("Jackal not connected");
  const cost = await storage.estimateStoragePlan({ gb, days });
  return typeof cost === "number" ? cost / 1_000_000 : cost;
}

/** Purchase storage plan (optional pre-purchase; not required for uploads). */
export async function buyStorage(gb: number, days: number) {
  if (!storage) throw new Error("Jackal not connected");
  const tx = await storage.purchaseStoragePlan({ gb, days });
  return tx;
}

/** Upload public or private files (auto-pay from wallet). */
export async function uploadFiles(
  files: File[],
  isPrivate = false,
  durationDays = 0
) {
  if (!storage) throw new Error("Jackal not connected");
  if (files.length === 0) throw new Error("No files selected");

  try {
    if (isPrivate) {
      await storage.queuePrivate(files, durationDays);
    } else {
      await storage.queuePublic(files, durationDays);
    }
    await storage.processAllQueues(); // ✅ v3.7.2 correct method
  } catch (err) {
    console.error("Upload error:", err);
    throw err;
  }
}

/** Retrieve available providers (nodes offering storage). */
export async function getProviders() {
  if (!storage) throw new Error("Jackal not connected");
  if (storage.getAvailableProviders) {
    return storage.getAvailableProviders();
  }
  return [];
}

/** Return connected Jackal address. */
export async function jackalAddress() {
  if (!client) throw new Error("Jackal not connected");
  return client.getJackalAddress();
}

/** Quick readiness check. */
export function isReady() {
  return Boolean(client && storage);
}
