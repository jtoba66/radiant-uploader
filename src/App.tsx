import React, { useEffect } from "react"
import { useState } from "react"
import "./App.css"

import type { IWalletConfig, IWalletHandler } from "@jackallabs/jackal.js"
import { WalletHandler } from "@jackallabs/jackal.js"

import { testnet } from "./config"

function App() {
	const [walletHandler, setWalletHandler] = useState<IWalletHandler>()
	const [JKLBalance, setJKLBalance] = useState<string>()

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
		setJKLBalance(balance?.amount)
	}
	useEffect(() => {
		console.log("useEffect...")
	}, [JKLBalance])

	return (
		<div className='App'>
			<div className='header'>
				<h1>Radiant Uploader</h1>
				<div>
					<button onClick={getBalance}>Connect</button>
					<p className='header'>JKL Balance: {JKLBalance}</p>
				</div>
			</div>

			<div className='main-body'>
				<div className='left'>
					<p>[INSERT ICON]</p>
					<p>Drag and drop file or folder</p>
					<button>BROWSE FILES</button>
				</div>
				<div className='right'>
					<div className='nav-bar'>/Home</div>
					<div className='file-manager'>File Manager </div>
				</div>
			</div>
		</div>
	)
}

export default App
