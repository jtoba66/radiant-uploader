// src/utils.ts

export interface FilesAndPaths {
	[key: string]: File[];
  }
  
  export const truncate = (str: string, chars = 20): string => {
	return str.length > chars ? `${str.substring(0, chars)} ...` : str;
  };
  
  export const isDirectory = (
	entry: FileSystemEntry
  ): entry is FileSystemDirectoryEntry => entry.isDirectory;
  
  export const isFile = (
	entry: FileSystemEntry
  ): entry is FileSystemFileEntry => entry.isFile;
  
  /**
   * Get all files from a drag-and-drop event, including nested directories.
   * Returns an object where keys are directory paths and values are File arrays.
   */
  export const getFilesAsync = async (dataTransfer: DataTransfer) => {
	if (typeof window === "undefined") return {}; // SSR safety
  
	const filesAndPaths: FilesAndPaths = {};
  
	const items = dataTransfer.items || [];
	const tasks: Promise<void>[] = [];
  
	for (let i = 0; i < items.length; i++) {
	  const item = items[i];
	  if (item.kind !== "file") continue;
  
	  if (typeof item.webkitGetAsEntry === "function") {
		const entry = item.webkitGetAsEntry();
		if (entry) tasks.push(readEntryContentAsync(entry, filesAndPaths));
	  } else {
		// Fallback for browsers without webkitGetAsEntry
		const file = item.getAsFile();
		if (file) {
		  filesAndPaths["."] = filesAndPaths["."] || [];
		  filesAndPaths["."].push(file);
		}
	  }
	}
  
	await Promise.all(tasks);
	return filesAndPaths;
  };
  
  /**
   * Recursively reads files and folders using FileSystem APIs.
   */
  function readEntryContentAsync(entry: FileSystemEntry, tree: FilesAndPaths): Promise<void> {
	return new Promise((resolve) => {
	  if (isFile(entry)) {
		entry.file((file) => {
		  const fullPath = entry.fullPath || "/";
		  const segments = fullPath.split("/");
		  segments.pop();
		  const path = segments.join("/") || ".";
		  if (!tree[path]) tree[path] = [];
		  tree[path].push(file);
		  resolve();
		});
	  } else if (isDirectory(entry)) {
		const reader = entry.createReader();
		reader.readEntries(async (entries) => {
		  if (!entries.length) return resolve();
		  await Promise.all(entries.map((ent) => readEntryContentAsync(ent, tree)));
		  resolve();
		});
	  } else {
		resolve();
	  }
	});
  }
  