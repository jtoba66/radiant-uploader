// src/config/mainnet.js
const signerChain = "jackal-1";

export const mainnet = {
  signerChain,
  chainId: signerChain,
  enabledChains: [signerChain],

  // ✅ Polkachu REST (CORS-safe, verified working)
  queryAddr: "https://jackal-api.polkachu.com",
  restEndpoint: "https://jackal-api.polkachu.com",

  // ✅ Keplr RPC (WebSocket-capable — no trailing /websocket)
  txAddr: "https://rpc-jackal.keplr.app",
  rpcEndpoint: "wss://rpc-jackal.keplr.app",

  chainConfig: {
    chainId: signerChain,
    chainName: "Jackal",
    rpc: "https://rpc-jackal.keplr.app",
    rest: "https://jackal-api.polkachu.com",
    walletUrlForStaking: "https://wallet.keplr.app/chains/jackal",
    bip44: { coinType: 118 },
    bech32Config: {
      bech32PrefixAccAddr: "jkl",
      bech32PrefixAccPub: "jklpub",
      bech32PrefixValAddr: "jklvaloper",
      bech32PrefixValPub: "jklvaloperpub",
      bech32PrefixConsAddr: "jklvalcons",
      bech32PrefixConsPub: "jklvalconspub",
    },
    currencies: [
      {
        coinDenom: "JKL",
        coinMinimalDenom: "ujkl",
        coinDecimals: 6,
        coinGeckoId: "jackal-protocol",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "JKL",
        coinMinimalDenom: "ujkl",
        coinDecimals: 6,
        gasPriceStep: { low: 0.002, average: 0.004, high: 0.02 },
      },
    ],
    stakeCurrency: {
      coinDenom: "JKL",
      coinMinimalDenom: "ujkl",
      coinDecimals: 6,
    },
    features: ["cosmwasm"],
  },

  host: {
    chainId: signerChain,
    // ✅ working WebSocket base URL (Jackal.js will append /websocket automatically)
    endpoint: "wss://rpc-jackal.keplr.app",
    chainConfig: {
      chainId: signerChain,
      chainName: "Jackal",
      rpc: "https://rpc-jackal.keplr.app",
      rest: "https://jackal-api.polkachu.com",
      bip44: { coinType: 118 },
      bech32Config: {
        bech32PrefixAccAddr: "jkl",
        bech32PrefixAccPub: "jklpub",
        bech32PrefixValAddr: "jklvaloper",
        bech32PrefixValPub: "jklvaloperpub",
        bech32PrefixConsAddr: "jklvalcons",
        bech32PrefixConsPub: "jklvalconspub",
      },
      currencies: [
        { coinDenom: "JKL", coinMinimalDenom: "ujkl", coinDecimals: 6 },
      ],
      feeCurrencies: [
        {
          coinDenom: "JKL",
          coinMinimalDenom: "ujkl",
          coinDecimals: 6,
          gasPriceStep: { low: 0.002, average: 0.004, high: 0.02 },
        },
      ],
      stakeCurrency: {
        coinDenom: "JKL",
        coinMinimalDenom: "ujkl",
        coinDecimals: 6,
      },
      features: ["cosmwasm"],
    },
  },
};
