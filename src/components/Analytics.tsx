import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

declare global {
	interface Window {
		gtag?: (...args: unknown[]) => void
	}
}

const GA_MEASUREMENT_ID = 'G-GC21QKFV8K'
const ADS_MEASUREMENT_ID = 'AW-17417625713'

export default function Analytics() {
	const location = useLocation()

	useEffect(() => {
		if (!window.gtag) return
		window.gtag('config', GA_MEASUREMENT_ID, {
			page_path: location.pathname + location.search,
		})
		window.gtag('config', ADS_MEASUREMENT_ID, {
			page_path: location.pathname + location.search,
		})
	}, [location])

	return null
}


