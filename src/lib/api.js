const configuredApiBase = import.meta.env.VITE_API_URL || ""

// Build API paths for same-origin development and separately deployed production APIs.
export function apiUrl(path) {
    return configuredApiBase.replace(/\/+$/, "") + path
}
