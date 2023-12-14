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
	for (let i = 0; i < dataTransfer.items.length; i++) {
		const item = dataTransfer.items[i]
		if (item.kind === "file") {
			if (typeof item.webkitGetAsEntry === "function") {
				const entry = item.webkitGetAsEntry()
				if (entry) {
					const entryContent = await readEntryContentAsync(entry)
					files.push(...entryContent)
				}
				continue
			}

			const file = item.getAsFile()
			if (file) {
				files.push(file)
			}
		}
	}

	return files
}

// Returns a promise with all the files of the directory hierarchy
function readEntryContentAsync(entry: FileSystemEntry) {
	return new Promise<File[]>((resolve, reject) => {
		let reading = 0
		const contents: File[] = []

		readEntry(entry)

		function readEntry(entry: FileSystemEntry) {
			if (isFile(entry)) {
				reading++
				entry.file((file) => {
					reading--
					contents.push(file)

					if (reading === 0) {
						resolve(contents)
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
					resolve(contents)
				}
			})
		}
	})
}
