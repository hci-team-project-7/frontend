"use client"

declare global {
  interface Window {
    google?: any
  }
}

let googleMapsPromise: Promise<any> | null = null

export function loadGoogleMaps(apiKey: string, libraries: string[] = ["places"]) {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps can only be loaded in the browser."))
  }

  if (!apiKey) {
    return Promise.reject(new Error("Google Maps API key is missing."))
  }

  if (window.google?.maps) {
    return Promise.resolve(window.google)
  }

  if (googleMapsPromise) {
    return googleMapsPromise
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>('script[data-google-maps-loader="true"]')
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(window.google))
      existingScript.addEventListener("error", () => reject(new Error("Failed to load Google Maps script.")))
      return
    }

    const script = document.createElement("script")
    const params = new URLSearchParams({ key: apiKey, libraries: libraries.join(",") })
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`
    script.async = true
    script.defer = true
    script.dataset.googleMapsLoader = "true"
    script.onload = () => {
      if (window.google?.maps) {
        resolve(window.google)
      } else {
        reject(new Error("Google Maps SDK unavailable after script load."))
      }
    }
    script.onerror = () => reject(new Error("Failed to load Google Maps script."))

    document.head.appendChild(script)
  })

  return googleMapsPromise
}
