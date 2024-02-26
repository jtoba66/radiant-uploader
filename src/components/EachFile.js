import React from "react";
import { truncate } from "../utils";

import copy_icon from "../assets/copy_icon.png";
import fallback from "../assets/file-icons/fallback.png";
import jpeg from "../assets/file-icons/jpeg.png";
import pdf from "../assets/file-icons/pdf.png";
import png from "../assets/file-icons/png.png";
import text from "../assets/file-icons/text.png";
import mp3 from "../assets/file-icons/mp3.png";
import mp4 from "../assets/file-icons/mp4.png";

import serious_fallback from "../assets/serious-icons/fallback.png";
import serious_jpg from "../assets/serious-icons/jpg.png";
import serious_pdf from "../assets/serious-icons/pdf.png";
import serious_png from "../assets/serious-icons/png.png";
import serious_doc from "../assets/serious-icons/doc.png";
import serious_mp3 from "../assets/serious-icons/mp3.png";
import serious_mp4 from "../assets/serious-icons/mp4.png";
import serious_txt from "../assets/serious-icons/txt.png";

let IconCollection = {
	png,
	pdf,
	jpeg,
	jpg: jpeg,
	docx: text,
	txt: text,
	mp4,
	mp3,
	fallback,
};

const SeriousCollection = {
	png: serious_png,
	pdf: serious_pdf,
	jpeg: serious_jpg,
	jpg: serious_jpg,
	docx: serious_doc,
	txt: serious_txt,
	mp4: serious_mp4,
	mp3: serious_mp3,
	fallback: serious_fallback,
};

export default function EachFile({ file, copyToClipboard, openFile, serious }) {
	const [showAlert, setShowAlert] = React.useState(false);

	IconCollection = serious ? SeriousCollection : IconCollection;

	let fileType = file.name.split(".")[1];

	return (
		<div className='each-file'>
			<div className='file-name'>
				<img
					height={50}
					alt='file icon'
					src={IconCollection[fileType] || fallback}
				/>
				{truncate(file.name, window.innerWidth > 480 ? 30 : 10)}
			</div>
			<p
				className='view-online windows-font'
				onClick={() => openFile(file.name)}
			>
				View online
			</p>
			<div className='copy-link'>
				{showAlert && <p className='copied-alert'>Link copied</p>}
				<img
					alt='copy'
					src={copy_icon}
					className='copy-icon'
					onClick={() => {
						copyToClipboard(file.name);
						setShowAlert(true);
						setTimeout(() => {
							setShowAlert(false);
						}, 1000);
					}}
				/>
			</div>
		</div>
	);
}
