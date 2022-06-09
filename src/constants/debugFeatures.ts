interface DebugFeatures {
  insecureScheduleTesting: boolean
  logFidelityBondAddressToConsole: boolean
}

const devMode = process.env.NODE_ENV === 'development'

const debugFeatures: DebugFeatures = {
  insecureScheduleTesting: true,
  logFidelityBondAddressToConsole: true,
}

type DebugFeature = keyof DebugFeatures

export const isDebugFeatureEnabled = (name: DebugFeature): boolean => {
  if (!devMode) {
    return false
  }

  return debugFeatures[name] || false
}

// only to be used in tests
export const __testSetDebugFeatureEnabled = (name: DebugFeature, enabled: boolean): boolean => {
  return (debugFeatures[name] = enabled)
}
