const signerChain = "jackal-1";

export const mainnet = {
  signerChain,
  chainId: signerChain,
  enabledChains: [signerChain],
  queryAddr: "/lcd",
  txAddr: "/v1",
  rpcEndpoint: "/v1",
  restEndpoint: "/lcd",

  chainConfig: {
    chainId: signerChain,
    chainName: "Jackal",
    rpc: "/v1",
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
    endpoint: "/v1",
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
