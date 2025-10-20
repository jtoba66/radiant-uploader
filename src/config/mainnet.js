const signerChain = "jackal-1";

export const mainnet = {
  signerChain,
  chainId: signerChain,
  enabledChains: [signerChain],

  // ✅ Polkachu REST + RPC (CORS-safe)
  queryAddr: "https://jackal-api.polkachu.com",
  restEndpoint: "https://jackal-api.polkachu.com",
  txAddr: "https://jackal-rpc.polkachu.com",
  rpcEndpoint: "wss://jackal-rpc.polkachu.com/websocket",

  chainConfig: {
    chainId: signerChain,
    chainName: "Jackal",
    rpc: "https://jackal-rpc.polkachu.com",
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
    endpoint: "wss://jackal-rpc.polkachu.com/websocket",
    chainConfig: {
      chainId: signerChain,
      chainName: "Jackal",
      rpc: "https://jackal-rpc.polkachu.com",
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
