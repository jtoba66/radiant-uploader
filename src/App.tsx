import React, { useEffect, useRef, useMemo } from "react"
import { useState } from "react"
import "./App.css"

import { ReactComponent as UploadIcon } from "./assets/upload-icon.svg"
import { ReactComponent as FileIcon } from "./assets/file-icon.svg"
import { ReactComponent as FolderIcon } from "./assets/folder-icon.svg"

import type {
	IWalletConfig,
	IWalletHandler,
	IUploadList,
	IFolderHandler
} from "@jackallabs/jackal.js"
import {
	WalletHandler,
	FileIo,
	getFileTreeData,
	FileUploadHandler,
	FolderHandler
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
	const [uploading, setUploading] = useState<boolean>(false)
	const [wallet, setWallet] = useState<IWalletHandler | null>(null)
	const [JKLBalance, setJKLBalance] = useState<number>(0)
	const [JKLAddress, setJKLAddress] = useState<string>("")
	const [walletActive, setWalletActive] = useState<boolean>(false)
	const [fileIo, setFileIo] = useState<FileIo | null>(null)
	const [data, setData] = useState<FileData[]>([])
	const [folders, setFolders] = useState<string[]>([])
	const [selectedFiles, setSelectedFiles] = useState<File[]>([])
	const [inDropZone, setInDropZone] = useState<boolean>(false)
	const [currentDir, setCurrentDir] = useState<IFolderHandler | null>(null)

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

		await updateFileList(trackWallet, trackIo)
		await updateBalance(trackWallet)

		setWalletActive(true)
		setLoading(false)
	}

	const updateBalance = async (wallet: IWalletHandler) => {
		let balance = await wallet?.getJackalBalance()
		setJKLBalance(parseInt(balance?.amount || "0") / 1000000)
	}
	const updateFileList = async (wallet: IWalletHandler, fileIo: FileIo) => {
		if (fileIo == null) {
			return
		}
		if (wallet == null) {
			return
		}
		const folder = await fileIo.downloadFolder("s/" + path)
		setCurrentDir(folder)
		setFolders(folder.getChildDirs())
		const files = folder.getFolderDetails().fileChildren

		let d = []

		let x = 0
		for (const key of Object.keys(files)) {
			const f = files[key]

			const fDetails = await getFileTreeData(
				"s/" + path + "/" + f.name,
				wallet.getJackalAddress(),
				wallet.getQueryHandler()
			)
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
		setUploading(false)
	}
	const handleUpload = async (files: File[]) => {
		if (JKLBalance === 0) {
			alert("You don't have enough JKL")
			return null
		}

		setUploading(true)
		const parentFolderPath = "s/" + path
		let uploadList: IUploadList = {}

		await Promise.all(
			files.map(async (file) => {
				let handler = await FileUploadHandler.trackFile(file, parentFolderPath)
				uploadList[file.name] = {
					data: null,
					exists: false,
					handler: handler,
					key: file.name,
					uploadable: handler.getForPublicUpload()
				}
			})
		)
		currentDir &&
			(await fileIo
				?.staggeredUploadFiles(uploadList, currentDir, {
					complete: 0,
					timer: 0
				})
				.catch((err) => {
					console.log(err)
					console.log("upload failed")
				}))

		wallet && fileIo && updateFileList(wallet, fileIo)
		complete()
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
	const uploadButtonClick = () => {
		handleUpload(selectedFiles)
	}

	const openFile = (fileName: string) => {
		if (wallet == null) {
			return
		}
		const link =
			"https://testnet.jackal.link/p/" +
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
			let filesAndFolders = await getFilesAsync(e.dataTransfer)
			setSelectedFiles(filesAndFolders)
		} else {
			let files = e.dataTransfer?.files || []
			let selected = Array.from(files)
			setSelectedFiles(selected)
		}
	}

	// useEffect(() => {
	// 	console.log("useEffect...")
	// }, [])

	useMemo(() => {
		console.log("useMemo...")
		wallet && fileIo && updateFileList(wallet, fileIo)
		console.log("currentDir:", currentDir)
	}, [wallet, fileIo])

	const testFunction = async () => {
		// const parentFolderPath = "s/" + path
		console.log("test btn clicked")
		folders.map((e) => console.log(e))
	}

	return (
		<div className='App'>
			<div className='header'>
				<div>
					<h1>Radiant Uploader</h1>
					<p>by Jackal Labs</p>
				</div>
				<div>
					<button
						className='blue-btn'
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
					{uploading && <h2>Uploading in progress...</h2>}
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
					<UploadIcon className='upload-icon' />
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
					<div className='nav-bar'>
						{currentDir && <p>{currentDir.getWhoAmI()}/</p>}
					</div>
					<div className='file-manager'>
						<h3>File Manager</h3>
						{folders &&
							folders.map((e, i) => (
								<div key={i} className='each-folder'>
									<div className='folder-name'>
										<FolderIcon />
										{e}
									</div>
								</div>
							))}
						{data.map((e, i) => (
							<div key={i} className='each-file'>
								<div className='file-name'>
									<FileIcon />
									{e.name}
								</div>
								<p onClick={() => openFile(e.name)}>View online</p>
								<p>delete</p>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	)
}

export default App
