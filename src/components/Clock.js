import React, { useState, useEffect } from "react"

import jackal_logo from "../assets/Jackal_icon.png"

export default function Clock({ JKLBalance }) {
	const [clock, setClock] = useState(null)

	const displayTime = () => {
		setInterval(() => {
			// const today = new Date()
			// const h = today.getHours()
			// const m = today.getMinutes()
			// const s = today.getSeconds()
			// const time = ` ${h}:${m}:${s} `
			let time = formatAMPM(new Date())
			setClock(time)
		}, 5000)
		clearInterval()
	}

	function formatAMPM(date) {
		var hours = date.getHours()
		var minutes = date.getMinutes()
		var ampm = hours >= 12 ? "PM" : "AM"
		hours = hours % 12
		hours = hours ? hours : 12 // the hour '0' should be '12'
		minutes = minutes < 10 ? "0" + minutes : minutes
		var strTime = hours + ":" + minutes + " " + ampm
		return strTime
	}

	useEffect(() => {
		displayTime()
		clearInterval()
	}, [])

	return (
		<div className='clock flex-this-div'>
			<img alt='JKL Balance' height={20} src={jackal_logo} />
			{JKLBalance.toFixed(3)}
			<p className=''>{clock || "00:00"}</p>
		</div>
	)
}
