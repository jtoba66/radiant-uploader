const signerChain = "jackal-1";

export const mainnet = {
  signerChain,
  chainId: signerChain,
  enabledChains: [signerChain],

  // ✅ REST can stay proxied
  queryAddr: "/lcd",
  restEndpoint: "/lcd",

  // ✅ RPC/WebSocket must include protocol
  txAddr: "https://rpc-jackal.keplr.app",
  rpcEndpoint: "https://rpc-jackal.keplr.app",

  chainConfig: {
    chainId: signerChain,
    chainName: "Jackal",
    rpc: "https://rpc-jackal.keplr.app", // ✅ full URL
    rest: "/lcd",                        // ✅ proxied
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
    endpoint: "https://rpc-jackal.keplr.app", // ✅ must include https://
    chainConfig: {
      chainId: signerChain,
      chainName: "Jackal",
      rpc: "https://rpc-jackal.keplr.app", // ✅ same here
      rest: "/lcd",
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
