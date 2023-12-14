import React, { useEffect, useRef } from "react"
import { useState } from "react"
import "./App.css"

import type { IWalletConfig, IWalletHandler } from "@jackallabs/jackal.js"
import { WalletHandler, FileIo, getFileTreeData } from "@jackallabs/jackal.js"

import { testnet } from "./config"
import { getFilesAsync, isDirectory, isFile } from "./utils"

type FileData = {
	name: string
	fid: string
}

const ioVersion = "1.1.2"
const path = "radiant"

function App() {
	const [loading, setLoading] = useState<boolean>(false)
	const [wallet, setWallet] = useState<IWalletHandler>()
	const [JKLBalance, setJKLBalance] = useState<number>(0)
	const [walletActive, setWalletActive] = useState<boolean>(false)
	const [fileIo, setFileIo] = useState<FileIo | null>(null)
	const [data, setData] = useState<FileData[]>([])
	const [selectedFiles, setSelectedFiles] = useState<File[]>([])
	const [inDropZone, setInDropZone] = useState<boolean>(false)

	const initWallet = async () => {
		setLoading(true)
		const walletConfig: IWalletConfig = {
			selectedWallet: "keplr",
			...testnet
		}
		let trackWallet = await WalletHandler.trackWallet(walletConfig)
		setWallet(trackWallet)

		let balance = await trackWallet.getJackalBalance()
		setJKLBalance(parseInt(balance.amount) / 1000000)

		let trackIo = await FileIo.trackIo(trackWallet, ioVersion)
		setFileIo(trackIo)

		const listOfFolders = [path, "memes"]

		// If folder doesn't exist, create folder
		await trackIo.verifyFoldersExist(listOfFolders)

		updateFileList()

		setWalletActive(true)
		setLoading(false)
	}

	const updateFileList = async () => {
		if (fileIo == null) {
			return
		}
		if (wallet == null) {
			return
		}
		const listFiles = await fileIo.downloadFolder("s/" + path)
		const files = listFiles.getFolderDetails().fileChildren

		let d = []

		let x = 0
		for (const key of Object.keys(files)) {
			const f = files[key]

			const fDetails = await getFileTreeData(
				"s/" + path + "/" + f.name,
				wallet.getJackalAddress(),
				wallet.getQueryHandler()
			)
			console.log("fdetails", fDetails)
			const dFiles = fDetails.value.files
			if (dFiles == null) {
				continue
			}
			const fidList = JSON.parse(dFiles.contents)
			const newFid = fidList.fids[0]

			d[x] = { name: key, fid: newFid }
			x++
		}
		console.log(d)
		setData(d)
	}

	const connectButtonClick = async () => {
		await initWallet()
		if (!wallet) {
			initWallet()
		}
	}

	const singleFile = useRef<HTMLInputElement | null>(null)

	const browseFilesButtonClick = () => {
		singleFile.current?.click()
	}
	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		let files = e.target.files || []
		let selected = Array.from(files)
		setSelectedFiles(selected)
	}

	//Drag n Drop
	const handleDragEnter = (e: any) => {
		e.preventDefault()
		e.stopPropagation()
	}
	const handleDragLeave = (e: any) => {
		e.preventDefault()
		e.stopPropagation()
		setInDropZone(false)
	}
	const handleDragOver = (e: any) => {
		e.preventDefault()
		e.stopPropagation()
		setInDropZone(true)
	}
	const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
		e.stopPropagation()
		setInDropZone(false)

		if (e.dataTransfer?.files[0].type === "") {
			// let's assume a file with empty type means a folder
			console.log("folder")
			let filesAndFolders = await getFilesAsync(e.dataTransfer)
			setSelectedFiles(filesAndFolders)
		} else {
			console.log("file")
			let files = e.dataTransfer?.files || []
			let selected = Array.from(files)
			setSelectedFiles(selected)
		}
	}

	useEffect(() => {
		console.log("useEffect...")
	}, [JKLBalance])

	return (
		<div className='App'>
			<div className='header'>
				<h1>Radiant Uploader</h1>
				<div>
					<button
						onClick={connectButtonClick}
						disabled={walletActive ? true : false}
					>
						{walletActive ? "Connected" : "Connect Wallet"}
					</button>
					<button
						onClick={(e) => {
							console.log(selectedFiles)
						}}
					>
						Test Button
					</button>
					<p className='header'>JKL Balance: {JKLBalance}</p>
				</div>
			</div>
			{loading && <h2>LOADING...</h2>}
			<div className='main-body'>
				{/* LEFT */}
				<div
					className={
						inDropZone
							? "left drag-drop-zone inside-drag-area"
							: "left drag-drop-zone"
					}
					onDrop={(e) => handleDrop(e)}
					onDragOver={(e) => handleDragOver(e)}
					onDragEnter={(e) => handleDragEnter(e)}
					onDragLeave={(e) => handleDragLeave(e)}
				>
					{selectedFiles.length > 0 && (
						<>
							<div className='uploading-queue'>
								<h3>Uploading queue:</h3>
								{selectedFiles.map((e, i) => (
									<li key={i}> {e.name}</li>
								))}
							</div>
							<button>Upload</button>
						</>
					)}
					<p>[INSERT ICON]</p>
					<p>Drag and drop file or folder</p>
					<button onClick={browseFilesButtonClick}>BROWSE FILES</button>
					<input
						type='file'
						id='file'
						ref={singleFile}
						style={{ display: "none" }}
						multiple
						onChange={handleFileChange}
					/>
				</div>

				{/* RIGHT */}
				<div className='right'>
					<div className='nav-bar'>/Home</div>
					<div className='file-manager'>File Manager </div>
				</div>
			</div>
		</div>
	)
}

export default App
