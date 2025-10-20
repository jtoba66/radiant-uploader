// src/config/mainnet.js
const signerChain = "jackal-1";

export const mainnet = {
  signerChain,
  chainId: signerChain,
  enabledChains: [signerChain],

  // ✅ Polkachu REST (CORS-safe, verified working)
  queryAddr: "https://jackal-api.polkachu.com",
  restEndpoint: "https://jackal-api.polkachu.com",

  // ✅ Jackal official RPC (browser-compatible)
  txAddr: "https://rpc.jackalprotocol.com",
  rpcEndpoint: "https://rpc.jackalprotocol.com",

  chainConfig: {
    chainId: signerChain,
    chainName: "Jackal",
    rpc: "https://rpc.jackalprotocol.com",
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
    // ✅ Jackal official RPC endpoint
    endpoint: "https://rpc.jackalprotocol.com",
    chainConfig: {
      chainId: signerChain,
      chainName: "Jackal",
      rpc: "https://rpc.jackalprotocol.com",
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