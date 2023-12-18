import React, { useEffect, useRef } from "react"
import { useState } from "react"
import "./App.css"

import type {
	IWalletConfig,
	IWalletHandler,
	IUploadList
} from "@jackallabs/jackal.js"
import {
	WalletHandler,
	FileIo,
	getFileTreeData,
	FileUploadHandler
} from "@jackallabs/jackal.js"

import { testnet } from "./config"
import { getFilesAsync } from "./utils"

type FileData = {
	name: string
	fid: string
}

const ioVersion = "1.1.2"
const path = "radiant"

function App() {
	const [loading, setLoading] = useState<boolean>(false)
	const [wallet, setWallet] = useState<IWalletHandler | null>(null)
	const [JKLBalance, setJKLBalance] = useState<number>(0)
	const [JKLAddress, setJKLAddress] = useState<string>("")
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

		let jklAddress = await trackWallet.getJackalAddress()
		setJKLAddress(jklAddress)

		let trackIo = await FileIo.trackIo(trackWallet, ioVersion)
		setFileIo(trackIo)

		const listOfFolders = [path]

		// If folder doesn't exist, create folder
		await trackIo.verifyFoldersExist(listOfFolders)

		updateFileList()
		updateBalance(trackWallet)

		setWalletActive(true)
		setLoading(false)
	}

	const updateBalance = async (wallet: IWalletHandler) => {
		let balance = await wallet?.getJackalBalance()
		setJKLBalance(parseInt(balance?.amount || "0") / 1000000)
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
		setData(d)
	}

	const complete = () => {
		setLoading(false)
	}
	const uploadFile = (file: File) => {
		if (JKLBalance == 0) {
			alert("You don't have enough JKL")
			return null
		}
		setLoading(true)

		const fileName = file.name
		if (fileName.length == 0) {
			alert("file needs name")
			complete()
			return
		}

		const parentFolderPath = "s/" + path

		FileUploadHandler.trackFile(file, parentFolderPath)
			.then((handler) => {
				fileIo
					?.downloadFolder(parentFolderPath)
					.then((parent) => {
						const uploadList: IUploadList = {}
						uploadList[fileName] = {
							data: null,
							exists: false,
							handler: handler,
							key: fileName,
							uploadable: handler.getForPublicUpload()
						}

						fileIo
							?.staggeredUploadFiles(uploadList, parent, {
								complete: 0,
								timer: 0
							})
							.then(() => {
								if (wallet == null) {
									complete()
									return
								}

								getFileTreeData(
									"s/" + path + "/" + fileName,
									wallet.getJackalAddress(),
									wallet.getQueryHandler()
								)
									.then((f) => {
										const fFiles = f.value.files
										if (fFiles == null) {
											complete()
											return
										}
										const fidList = JSON.parse(fFiles.contents)
										const newFid = fidList.fids[0]
										console.log(newFid)

										updateFileList()
										complete()
									})
									.catch(complete)
							})
							.catch(complete)
					})
					.catch(complete)
			})
			.catch(complete)
	}

	const checkStoragePlan = () => {}

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
	const uploadButtonClick = () => {
		console.log("uploading...", selectedFiles[0].name)
		uploadFile(selectedFiles[0])
	}

	const openFile = (fileName: string) => {
		if (wallet == null) {
			return
		}
		const link =
			"https://jackal.link/p/" +
			wallet.getJackalAddress() +
			"/" +
			path +
			"/" +
			fileName
		const w = window.open(link, "_blank")
		if (w == null) {
			return
		}
		w.focus()
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
	}, [JKLBalance, data])

	const testFunction = async () => {
		const parentFolderPath = "s/" + path
		console.log("test btn clicked")
		updateFileList()
	}

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
							testFunction()
						}}
					>
						Test Button
					</button>
					{walletActive && <p className='header'>JKL Balance: {JKLBalance}</p>}
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
							<button onClick={uploadButtonClick}>Upload</button>
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
					<div className='file-manager'>
						<h3>File Manager</h3>
						{data.map((e, i) => (
							<>
								<li key={i}>
									{e.name}
									{"    "}
									<button onClick={() => openFile(e.name)}>View online</button>
								</li>
							</>
						))}
					</div>
				</div>
			</div>
		</div>
	)
}

export default App
