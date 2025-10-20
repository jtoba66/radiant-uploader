// src/jackalV3.ts
import {
  ClientHandler,
  type IClientHandler,
  type IStorageHandler,
  type IClientSetup,
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

  const { chainId, chainConfig, txAddr } = mainnet;

  try {
    console.log("🔗 Requesting wallet connection...");

    // ✅ Suggest chain first (if needed)
    if (walletProvider.experimentalSuggestChain) {
      try {
        await walletProvider.experimentalSuggestChain(chainConfig);
        console.log("✅ Chain suggested successfully");
      } catch (err) {
        console.info("Chain already registered:", err);
      }
    }

    // ✅ CRITICAL FIX: enable() expects an ARRAY of chain IDs!
    console.log("🔓 Enabling wallet for chain:", chainId);
    await walletProvider.enable([chainId]);
    console.log("✅ Wallet enabled");

    // ✅ Get the key - Keplr should now be unlocked
    console.log("🔑 Getting wallet key...");
    const key = await walletProvider.getKey(chainId);
    
    if (!key || !key.bech32Address) {
      throw new Error("Failed to retrieve wallet address from Keplr");
    }
    
    const address = key.bech32Address;
    console.log("👛 Wallet address:", address);

    // ✅ Create the proper IClientSetup object for ClientHandler.connect
    const setup: IClientSetup = {
      selectedWallet: opts.selectedWallet ?? "keplr",
      chainId,
      endpoint: txAddr,
      chainConfig,
    };

    // ✅ Connect to Jackal.js client using proper API
    console.log("🌐 Connecting to Jackal mainnet...");
    client = await ClientHandler.connect(setup);

    // ✅ Initialize StorageHandler
    console.log("💾 Initializing storage handler...");
    storage = await client.createStorageHandler();
    
    // Load provider pool if available
    if (storage.loadProviderPool) {
      await storage.loadProviderPool();
    }

    const balanceCoin = await client.getJklBalance();
    const balance = Number(balanceCoin.amount) / 1_000_000;
    console.log(`✅ Connected: ${address}, Balance: ${balance} JKL`);

    return { address, balance };
  } catch (err: any) {
    console.error("❌ Wallet connection failed:", err);
    
    // Provide more helpful error messages
    if (err.message?.includes("rejected") || err.message?.includes("Request rejected")) {
      throw new Error("Wallet connection was rejected. Please try again and approve the connection.");
    }
    if (err.message?.includes("locked")) {
      throw new Error("Wallet is locked. Please unlock your wallet and try again.");
    }
    
    throw new Error(err.message || "Failed to connect to wallet");
  }
}

/** Retrieve normalized JKL balance (uJKL → JKL). */
export async function getBalance() {
  if (!client) throw new Error("Jackal not connected");
  const balanceCoin = await client.getJklBalance();
  return Number(balanceCoin.amount) / 1_000_000;
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
  return storage.createFolders({ names });
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
    await storage.processAllQueues();
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