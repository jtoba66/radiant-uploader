import React, { useEffect } from "react"
import { useState } from "react"
import logo from "./logo.svg"
import "./App.css"

import type { IWalletConfig, IWalletHandler } from "@jackallabs/jackal.js"
import { WalletHandler } from "@jackallabs/jackal.js"

import { testnet } from "./config"

// let walletHandler: IWalletHandler

// WalletHandler.trackWallet(walletConfig).then((e) => (walletHandler = e))

function App() {
	const [walletHandler, setWalletHandler] = useState<IWalletHandler>()

	const initWallet = async () => {
		const walletConfig: IWalletConfig = {
			selectedWallet: "keplr",
			...testnet
		}
		let res = await WalletHandler.trackWallet(walletConfig)
		setWalletHandler(res)
	}
	const getBalance = async () => {
		await initWallet()
		if (!walletHandler) {
			initWallet()
		}
		let balance = await walletHandler?.getJackalBalance()
		console.log(balance)
	}

	useEffect(() => {
		console.log("hello")
		getBalance()
	}, [])
	return (
		<div className='App'>
			<header className='App-header'>
				<img src={logo} className='App-logo' alt='logo' />
				<p>
					Edit <code>src/App.tsx</code> and save to reload.
				</p>
				<a
					className='App-link'
					href='https://reactjs.org'
					target='_blank'
					rel='noopener noreferrer'
				>
					Learn React
				</a>
			</header>
		</div>
	)
}

export default App
