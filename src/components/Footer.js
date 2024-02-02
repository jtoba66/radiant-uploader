import React from "react"

import Clock from "./Clock"
import jackal_logo from "../assets/Jackal_icon.png"

export default function Footer({
	JKLBalance,
	JKLAddress,
	connectButtonClick,
	walletActive
}) {
	return (
		<>
			<p className='col-double windows-font' style={{ color: "gray" }}>
				Built with {"❤︎"} by{" "}
				<a
					style={{ color: "gray" }}
					href='https://www.jackallabs.io/'
					target='_blank'
					rel='noreferrer'
				>
					Jackal Labs
				</a>
			</p>
			<div className='footer windows-font'>
				<a
					className='footer-btn'
					href='https://www.youtube.com/watch?v=dQw4w9WgXcQ'
					target='_blank'
					style={{
						display: "flex",
						margin: "5px",
						marginLeft: "10px",
						padding: "2px",
						height: "35px",
						width: "min-content",
						cursor: "pointer"
					}}
					rel='noreferrer'
				>
					<img alt='Jackal Logo' id='jkl_logo' src={jackal_logo} />
					<p>Start</p>
				</a>
				<div>
					<a
						href='https://twitter.com/Jackal_Protocol'
						target='blank'
						rel='noreferrer'
					>
						Twitter
					</a>
					<a
						href='https://t.me/+rtuZnbTlHaIzNjVh'
						target='blank'
						rel='noreferrer'
					>
						Telegram
					</a>
					<a
						href='https://discord.com/invite/5GKym3p6rj'
						target='blank'
						rel='noreferrer'
					>
						Discord
					</a>
					<a
						href='https://github.com/JackalLabs/'
						target='blank'
						rel='noreferrer'
					>
						Github
					</a>
				</div>
				{!walletActive ? (
					<p onClick={connectButtonClick} className='footer-btn blue-btn'>
						Connect
					</p>
				) : (
					<p className='footer-btn'>
						{`${JKLAddress.slice(0, 6)}...${JKLAddress.slice(-4)}`}
					</p>
				)}
				<Clock JKLBalance={JKLBalance} />
				{/* <div className='taskbar-divider'></div> */}
			</div>
		</>
	)
}
