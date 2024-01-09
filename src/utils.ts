interface FilesAndFolders {
	files: File[]
	folders: string[]
}

export interface FilesAndPaths {
	[key: string]: File[]
}

export const isDirectory = (
	entry: FileSystemEntry
): entry is FileSystemDirectoryEntry => {
	return entry.isDirectory
}

export const isFile = (
	entry: FileSystemEntry
): entry is FileSystemFileEntry => {
	return entry.isFile
}

export const getFilesAsync = async (dataTransfer: DataTransfer) => {
	const files: File[] = []
	const filesAndPaths: FilesAndPaths = {}

	for (let i = 0; i < dataTransfer.items.length; i++) {
		const item = dataTransfer.items[i]
		if (item.kind === "file") {
			if (typeof item.webkitGetAsEntry === "function") {
				const entry = item.webkitGetAsEntry()
				if (entry) {
					// const entryContent = await readEntryContentAsync(entry, filesAndPaths)
					// files.push(...entryContent)
					await readEntryContentAsync(entry, filesAndPaths)
				}
				continue
			}

			const file = item.getAsFile()
			if (file) {
				files.push(file)
			}
		}
	}
	// console.log("WE WANT THIS: ", filesAndPaths)
	return filesAndPaths
}

// Returns a promise with all the files of the directory hierarchy
function readEntryContentAsync(entry: FileSystemEntry, tree: FilesAndPaths) {
	return new Promise<FilesAndPaths>((resolve, reject) => {
		let reading = 0
		// const contents: File[] = []

		readEntry(entry)

		function readEntry(entry: FileSystemEntry) {
			let fullPath = entry.fullPath.split("/")
			fullPath.pop()
			let path = fullPath.join("/")

			if (isFile(entry)) {
				reading++
				entry.file((file) => {
					reading--
					// console.log("-->", reading, file)
					// contents.push(file)
					tree[path] = tree[path] || []
					tree[path].push(file)

					if (reading === 0) {
						resolve(tree)
					}
				})
			} else if (isDirectory(entry)) {
				readReaderContent(entry.createReader())
			}
		}

		function readReaderContent(reader: FileSystemDirectoryReader) {
			reading++

			reader.readEntries(function (entries) {
				reading--
				for (const entry of entries) {
					readEntry(entry)
				}

				if (reading === 0) {
					resolve(tree)
				}
			})
		}
	})
}
