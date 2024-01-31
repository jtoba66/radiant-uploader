import React from "react"
import { truncate } from "../utils"

import copy_icon from "../assets/copy_icon.png"
import file_icon from "../assets/file.png"

export default function EachFile({ file, copyToClipboard, openFile }) {
	return (
		<div className='each-file'>
			<div className='file-name'>
				<img height={30} alt='file_icon' src={file_icon} />
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
