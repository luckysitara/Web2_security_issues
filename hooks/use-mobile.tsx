"use client"

import { useState, useEffect } from "react"

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Function to check if viewport width is less than 768px (typical mobile breakpoint)
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Check on initial load
    checkMobile()

    // Add event listener for window resize
    window.addEventListener("resize", checkMobile)

    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  return isMobile
}
