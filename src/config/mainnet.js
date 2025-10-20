const signerChain = "jackal-1";

export const mainnet = {
  signerChain,
  chainId: signerChain,
  enabledChains: [signerChain],

  // ✅ REST endpoints via Netlify proxy
  queryAddr: "/lcd",
  restEndpoint: "/lcd",

  // ✅ RPC endpoints (proxy for HTTP, full URL for WebSocket)
  txAddr: "/v1",
  rpcEndpoint: "wss://rpc-jackal.keplr.app/websocket",

  chainConfig: {
    chainId: signerChain,
    chainName: "Jackal",
    rpc: "/v1", // proxied through Netlify (bypasses CORS)
    rest: "/lcd",
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
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/jackal/chain.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "JKL",
        coinMinimalDenom: "ujkl",
        coinDecimals: 6,
        coinGeckoId: "jackal-protocol",
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/jackal/chain.png",
        gasPriceStep: { low: 0.002, average: 0.004, high: 0.02 },
      },
    ],
    stakeCurrency: {
      coinDenom: "JKL",
      coinMinimalDenom: "ujkl",
      coinDecimals: 6,
      coinGeckoId: "jackal-protocol",
      coinImageUrl:
        "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/jackal/chain.png",
    },
    features: ["cosmwasm"],
  },

  host: {
    chainId: signerChain,
    // ✅ WebSocket endpoint for Jackal.js internals
    endpoint: "wss://rpc-jackal.keplr.app/websocket",
    chainConfig: {
      chainId: signerChain,
      chainName: "Jackal",
      rpc: "/v1",
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
        {
          coinDenom: "JKL",
          coinMinimalDenom: "ujkl",
          coinDecimals: 6,
          coinGeckoId: "jackal-protocol",
          coinImageUrl:
            "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/jackal/chain.png",
        },
      ],
      feeCurrencies: [
        {
          coinDenom: "JKL",
          coinMinimalDenom: "ujkl",
          coinDecimals: 6,
          coinGeckoId: "jackal-protocol",
          coinImageUrl:
            "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/jackal/chain.png",
          gasPriceStep: { low: 0.002, average: 0.004, high: 0.02 },
        },
      ],
      stakeCurrency: {
        coinDenom: "JKL",
        coinMinimalDenom: "ujkl",
        coinDecimals: 6,
        coinGeckoId: "jackal-protocol",
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/jackal/chain.png",
      },
      features: ["cosmwasm"],
    },
  },
};
