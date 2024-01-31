import React from "react"
import { truncate } from "../utils"

import copy_icon from "../assets/copy_icon.png"
import fallback from "../assets/file-icons/fallback.png"
import jpeg from "../assets/file-icons/jpeg.png"
import pdf from "../assets/file-icons/pdf.png"
import png from "../assets/file-icons/png.png"
import text from "../assets/file-icons/text.png"
import mp3 from "../assets/file-icons/mp3.png"
import mp4 from "../assets/file-icons/mp4.png"

const IconCollection = {
	png,
	pdf,
	jpeg,
	jpg: jpeg,
	docx: text,
	txt: text,
	mp4,
	mp3
}

export default function EachFile({ file, copyToClipboard, openFile }) {
	let fileType = file.name.split(".")[1]

	return (
		<div className='each-file'>
			<div className='file-name'>
				<img
					height={50}
					alt='file icon'
					src={IconCollection[fileType] || fallback}
				/>
				{truncate(file.name, 30)}
			</div>
			<p
				className='view-online windows-font'
				onClick={() => openFile(file.name)}
			>
				View online
			</p>
			<img
				alt='copy'
				src={copy_icon}
				className='copy-icon'
				onClick={() => copyToClipboard(file.name)}
			/>
		</div>
	)
}
