import React, { useEffect, useRef, useMemo, ReactEventHandler } from "react"
import { useState } from "react"
import "./App.css"

import loading_cat from "./assets/loading_cat.gif"
import loading_cat_smol from "./assets/loading_cat_smol.gif"
import official_logo from "./assets/radiant_official_logo.png"
import file_icon from "./assets/file.png"
import upload_icon from "./assets/upload.png"
import folder_icon from "./assets/folder_close.png"
import folder_open from "./assets/folder_open.png"
import john from "./assets/john-travolta.gif"
import { ReactComponent as CopyIcon } from "./assets/copy-icon.svg"

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

import { mainnet } from "./config"
import { getFilesAsync, FilesAndPaths, truncate } from "./utils"

type FileData = {
	name: string
	fid: string
}

// When user switches wallet
window.addEventListener("keplr_keystorechange", () => {
	window.location.reload()
})

const ioVersion = "1.1.2"
// const path = "radiant"

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
	const [fileTree, setFileTree] = useState<FilesAndPaths>({})
	const [path, setPath] = useState<string>("radiant")
	const [navigation, setNavigation] = useState<any>([])
	const [noProviders, setNoProviders] = useState(false)

	const initWallet = async () => {
		setLoading(true)
		const walletConfig: IWalletConfig = {
			selectedWallet: "keplr",
			// ...testnet
			...mainnet
		}
		let trackWallet = await WalletHandler.trackWallet(walletConfig)
		setWallet(trackWallet)

		let jklAddress = trackWallet.getJackalAddress()
		setJKLAddress(jklAddress)

		let trackIo = await FileIo.trackIo(trackWallet, ioVersion)
		setFileIo(trackIo)

		const listOfFolders = [path]

		// If folder doesn't exist, create folder
		await trackIo.verifyFoldersExist(listOfFolders)

		await loadRoot(trackWallet, trackIo)
		await updateBalance(trackWallet)

		setWalletActive(true)
		setLoading(false)
	}

	const updateBalance = async (wallet: IWalletHandler) => {
		let balance = await wallet?.getJackalBalance()
		setJKLBalance(parseInt(balance?.amount || "0") / 1000000)
	}
	const loadRoot = async (wallet: IWalletHandler, fileIo: FileIo) => {
		setLoading(true)
		if (fileIo == null) {
			return
		}
		if (wallet == null) {
			return
		}

		setPath("radiant")

		const folder = await fileIo.downloadFolder("s/radiant")
		setCurrentDir(folder)
		setFolders(folder.getChildDirs())
		const files = folder.getFolderDetails().fileChildren

		let d = []

		let x = 0
		for await (const key of Object.keys(files)) {
			const f = files[key]
			const fDetails = await getFileTreeData(
				"s/radiant/" + f.name,
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
		setLoading(false)
		setData(d)
	}

	const updateFileList = async () => {
		loadFolder("")
	}

	const loadFolder = async (
		folderName: string,
		navigation: boolean = false
	) => {
		setLoading(true)
		if (fileIo == null) {
			return
		}
		if (wallet == null) {
			return
		}

		let newPath = path

		if (folderName.length > 0 && !navigation) {
			newPath = `${path}/${folderName}`
			setPath(newPath)
		}

		if (navigation) {
			newPath = "radiant/" + folderName
			setPath(newPath)
		}

		const folder = await fileIo.downloadFolder(`s/${newPath}`)
		setCurrentDir(folder)
		setFolders(folder.getChildDirs())
		const files = folder.getFolderDetails().fileChildren

		let d = []

		let x = 0
		for await (const key of Object.keys(files)) {
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
			const newFid = fidList?.fids?.[0]

			d[x] = { name: key, fid: newFid }

			x++
		}
		setLoading(false)
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
		console.log("uploading:", uploadList)

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
		setSelectedFiles([])
		updateFileList()
		complete()
	}

	const connectButtonClick = async (e: any) => {
		e.target.disabled = true
		await initWallet()
		if (!wallet) {
			initWallet()
		}
		checkAvailableProviders()
		e.target.disabled = false
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
		let link = getJackalLink(fileName)
		const w = window.open(link, "_blank")
		if (w == null) {
			return
		}
		w.focus()
	}

	const getJackalLink = (fileName: string): string => {
		if (wallet == null) {
			return ""
		}
		const link =
			// "https://testnet.jackal.link/p/" +
			"https://jackal.link/p/" +
			wallet.getJackalAddress() +
			"/" +
			path +
			"/" +
			fileName

		return link
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
			// let files = filesAndFolders.files
			// let folders = filesAndFolders.folders
			console.log("FINAL:", filesAndFolders)

			// filter out .DS_Store files
			// files = files.filter((file) => !file.name.includes(".DS_Store"))
			// setSelectedFiles(filtered)
		} else {
			let files = e.dataTransfer?.files || []
			let selected = Array.from(files)
			setSelectedFiles(selected)
		}
	}

	const createMultiFolders = async (folderNames: string[]) => {
		console.log(path)
		if (wallet && fileIo) {
			const folderHandler = await fileIo.downloadFolder("s/" + path)
			await fileIo?.createFolders(folderHandler, folderNames)
			updateFileList()
		} else {
			console.log("can't create folders")
		}
	}
	const newFolderClick = async () => {
		setLoading(true)
		let folderName = prompt("New folder's name")
		if (folderName) {
			await createMultiFolders([folderName])
		}
		await updateFileList()
		setLoading(false)
	}

	const backToRootClick = () => {
		wallet && fileIo && loadRoot(wallet, fileIo)
	}

	const navigationClick = async (index: number) => {
		let arr = []
		for (let i = 0; i <= index; i++) {
			arr.push(navigation[i])
		}
		let newPath = arr.join("/")
		console.log("navigationClick", newPath)
		setPath("")
		loadFolder(newPath, true)
	}
	const copyToClipboard = (fileName: string) => {
		const link = getJackalLink(fileName)
		navigator.clipboard.writeText(link)
	}

	useMemo(() => {
		console.log("useMemo (wallet, fileIo)")
		updateFileList()
	}, [wallet, fileIo])

	useMemo(() => {
		if (currentDir) {
			let arr = `${currentDir.getWhereAmI()}/${currentDir.getWhoAmI()}`.split(
				"/"
			)
			arr.splice(0, 2)
			setNavigation(arr)
		}
	}, [currentDir])

	const checkAvailableProviders = () => {
		let providers = fileIo?.getAvailableProviders()
		if (providers?.length === 0) {
			setNoProviders(true)
		}
	}

	const testFunction = async () => {
		console.log("TEST:")
	}

	return (
		<div className='App'>
			<div className='header'>
				<div>
					<img alt='Official Radiant Logo' id='logo' src={official_logo} />
					<p id='by-jkl'>by Jackal Labs</p>
				</div>
				<div>
					<button
						className='blue-btn'
						onClick={(e) => connectButtonClick(e)}
						disabled={walletActive ? true : false}
					>
						{walletActive ? "Connected" : "Connect Wallet"}
					</button>
					{/* <button
						onClick={(e) => {
							testFunction()
						}}
					>
						Test Button
					</button> */}

					{walletActive && (
						<>
							<p>{`Address: ${JKLAddress.slice(0, 6)}...${JKLAddress.slice(
								-4
							)}`}</p>
							<p className='header'>Balance: {JKLBalance.toFixed(3)} JKL</p>
						</>
					)}
					{noProviders && (
						<p style={{ color: "red" }}>Providers not available</p>
					)}
				</div>
			</div>
			{loading && <h2>LOADING...</h2>}
			{wallet == null && <h3>Please connect your wallet</h3>}
			<div className={"main-body " + (wallet == null ? "blurry" : "")}>
				{/* LEFT */}
				<div
					className={
						inDropZone
							? "left sick-border drag-drop-zone inside-drag-area"
							: "left sick-border drag-drop-zone"
					}
					onDrop={(e) => handleDrop(e)}
					onDragOver={(e) => handleDragOver(e)}
					onDragEnter={(e) => handleDragEnter(e)}
					onDragLeave={(e) => handleDragLeave(e)}
				>
					{uploading ? (
						<img alt='uploading...' src={loading_cat_smol} />
					) : (
						<>
							{selectedFiles.length > 0 && (
								<>
									<div className='uploading-queue'>
										<h4>Uploading queue:</h4>
										{selectedFiles.map((e, i) => (
											<li key={i}> {truncate(e.name, 20)}</li>
										))}
									</div>
									<button onClick={uploadButtonClick}>Upload</button>
									<br />
								</>
							)}
							{selectedFiles[0] && (
								<button
									onClick={() => {
										setSelectedFiles([])
									}}
								>
									Clear upload list
								</button>
							)}
							{selectedFiles.length === 0 && (
								<>
									{/* <UploadIcon className='upload-icon' /> */}
									<img alt='upload icon' width={50} src={upload_icon} />
									<p>Drag and drop your file(s) here</p>
									<p></p>
									<button onClick={browseFilesButtonClick}>BROWSE FILES</button>
								</>
							)}
							<input
								type='file'
								id='file'
								ref={singleFile}
								style={{ display: "none" }}
								multiple
								onChange={handleFileChange}
							/>
						</>
					)}
				</div>

				{/* RIGHT */}
				<div className='right'>
					<div className='nav-bar sick-border'>
						<button onClick={backToRootClick}>Root</button>
						{navigation.map((e: any, i: any) => {
							console.log()
							if (i === navigation.length - 1) {
								return (
									<button className='navigation' key={i} disabled>
										{e}
									</button>
								)
							}
							return (
								<button
									className='navigation'
									onClick={(e) => navigationClick(i)}
									key={i}
								>
									{e}
								</button>
							)
						})}
					</div>
					{wallet && loading && (
						<div className='loading_cat'>
							<img alt='cat is loading pls wait' src={loading_cat} />
							<p>Pls hold...</p>
						</div>
					)}
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							margin: "0 10px"
						}}
						className='title-bar'
					>
						<h2>File Manager</h2>
						<button onClick={newFolderClick}>New folder</button>
					</div>
					<div
						className={"file-manager sick-border" + (loading ? "blurry" : "")}
					>
						<div className='folder-container'>
							{folders &&
								folders.map((e, i) => (
									<div key={i} className='each-folder'>
										<img
											alt='folder'
											src={folder_icon}
											width={50}
											onMouseOver={(e) => (e.currentTarget.src = folder_open)}
											onMouseLeave={(e) => (e.currentTarget.src = folder_icon)}
											onClick={() => loadFolder(e)}
										/>
										<div className='folder-name'>{e}</div>
									</div>
								))}
						</div>
						{wallet && data.length === 0 && folders.length === 0 && (
							<div className='john'>
								<img alt='john travolta' height='100' src={john} />
								<p>there's nothing here</p>
							</div>
						)}
						{data.map((e, i) => (
							<div key={i} className='each-file'>
								<div className='file-name'>
									<img height={30} alt='file_icon' src={file_icon} />
									{truncate(e.name, 30)}
								</div>
								<p className='view-online' onClick={() => openFile(e.name)}>
									View online
								</p>
								<CopyIcon
									className='copy-icon'
									onClick={() => copyToClipboard(e.name)}
								/>
							</div>
						))}
					</div>
				</div>
			</div>
			<p style={{ color: "gray" }}>©Jackal Labs {new Date().getFullYear()}</p>
		</div>
	)
}

export default App
