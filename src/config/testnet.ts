interface IChainConfig {
	chainId: string
	chainName: string
	rpc: string
	rest: string
	bip44: {
		coinType: number
	}
	coinType: number
	stakeCurrency: {
		coinDenom: string
		coinMinimalDenom: string
		coinDecimals: number
	}
	bech32Config: {
		bech32PrefixAccAddr: string
		bech32PrefixAccPub: string
		bech32PrefixValAddr: string
		bech32PrefixValPub: string
		bech32PrefixConsAddr: string
		bech32PrefixConsPub: string
	}
	currencies: ICurrency[]
	feeCurrencies: ICurrency[]
	features: string[]
}

interface ICurrency {
	coinDenom: string
	coinMinimalDenom: string
	coinDecimals: number
	gasPriceStep?: {
		low: number
		average: number
		high: number
	}
}

interface IModeStructure {
	signerChain: string
	enabledChains: string[]
	queryAddr: string
	txAddr: string
	chainConfig: IChainConfig
}

const signerChain: string = "lupulella-2"
export const testnet: IModeStructure = {
	signerChain,
	enabledChains: [signerChain],
	queryAddr: "https://testnet-grpc.jackalprotocol.com",
	txAddr: "https://testnet-rpc.jackalprotocol.com",
	chainConfig: {
		chainId: signerChain,
		chainName: "Jackal Testnet II",
		rpc: "https://testnet-rpc.jackalprotocol.com",
		rest: "https://testnet-api.jackalprotocol.com",
		bip44: {
			coinType: 118
		},
		coinType: 118,
		stakeCurrency: {
			coinDenom: "JKL",
			coinMinimalDenom: "ujkl",
			coinDecimals: 6
		},
		bech32Config: {
			bech32PrefixAccAddr: "jkl",
			bech32PrefixAccPub: "jklpub",
			bech32PrefixValAddr: "jklvaloper",
			bech32PrefixValPub: "jklvaloperpub",
			bech32PrefixConsAddr: "jklvalcons",
			bech32PrefixConsPub: "jklvalconspub"
		},
		currencies: [
			{
				coinDenom: "JKL",
				coinMinimalDenom: "ujkl",
				coinDecimals: 6
			}
		],
		feeCurrencies: [
			{
				coinDenom: "JKL",
				coinMinimalDenom: "ujkl",
				coinDecimals: 6,
				gasPriceStep: {
					low: 0.002,
					average: 0.002,
					high: 0.02
				}
			}
		],
		features: []
	}
}

export default testnet
