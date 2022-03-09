import React, { useState } from 'react'
import * as rb from 'react-bootstrap'
import Sprite from './Sprite'
import PageTitle from './PageTitle'
import Seedphrase from './Seedphrase'
import ToggleSwitch from './ToggleSwitch'
import { useSettings, useSettingsDispatch } from '../context/SettingsContext'
import { SATS, BTC } from '../utils'
import * as Api from '../libs/JmWalletApi'

export default function Settings({ currentWallet }) {
  const [seed, setSeed] = useState('')
  const [showingSeed, setShowingSeed] = useState(false)
  const [revealSensitiveInfo, setRevealSensitiveInfo] = useState(false)
  const [seedError, setSeedError] = useState(false)
  const settings = useSettings()
  const settingsDispatch = useSettingsDispatch()

  const setTheme = (theme) => {
    if (window.JM.THEMES.includes(theme)) {
      document.documentElement.setAttribute(window.JM.THEME_ROOT_ATTR, theme)
      settingsDispatch({ theme })
    }
  }

  const isSats = settings.unit === SATS
  const isLightTheme = settings.theme === window.JM.THEMES[0]

  return (
    <div>
      <PageTitle title="Settings" />
      <div style={{ marginLeft: '-.75rem' }}>
        <rb.Button
          variant="outline-dark"
          className="border-0 mb-2 d-inline-flex align-items-center"
          onClick={(e) => {
            e.preventDefault()
            settingsDispatch({ showBalance: !settings.showBalance })
          }}
        >
          <Sprite symbol={settings.showBalance ? 'hide' : 'show'} width="24" height="24" className="me-2" />
          {settings.showBalance ? 'Hide' : 'Show'} balance
        </rb.Button>

        <br />

        <rb.Button
          variant="outline-dark"
          className="border-0 mb-2 d-inline-flex align-items-center"
          onClick={(e) => {
            e.preventDefault()
            settingsDispatch({ unit: isSats ? BTC : SATS })
          }}
        >
          <Sprite symbol={isSats ? BTC : SATS} width="24" height="24" className="me-2" />
          Display amounts in {isSats ? BTC : SATS}
        </rb.Button>

        <br />

        <rb.Button
          variant="outline-dark"
          className="border-0 mb-2 d-inline-flex align-items-center"
          onClick={(e) => {
            e.preventDefault()
            setTheme(isLightTheme ? window.JM.THEMES[1] : window.JM.THEMES[0])
          }}
        >
          <Sprite
            symbol={isLightTheme ? window.JM.THEMES[0] : window.JM.THEMES[1]}
            width="24"
            height="24"
            className="me-2"
          />
          Switch to {isLightTheme ? 'dark' : 'light'} theme
        </rb.Button>

        <br />

        <rb.Button
          variant="outline-dark"
          className="border-0 mb-2 d-inline-flex align-items-center"
          onClick={(e) => {
            e.preventDefault()
            settingsDispatch({ useAdvancedWalletMode: !settings.useAdvancedWalletMode })
          }}
        >
          <Sprite
            symbol={settings.useAdvancedWalletMode ? 'wand' : 'console'}
            width="24"
            height="24"
            className="me-2"
          />
          Use {settings.useAdvancedWalletMode ? 'magic' : 'advanced'} wallet mode
        </rb.Button>

        <br />

        <rb.Button
          variant="outline-dark"
          className="border-0 mb-2 d-inline-flex align-items-center"
          onClick={async (e) => {
            e.preventDefault()
            setError(false)
            setRevealSensitiveInfo(false)
            if (!showingSeed) {
              const { name: walletName, token } = currentWallet
              const res = await Api.getSeed({ walletName, token })
              if (res.ok) {
                const { seedphrase } = await res.json()
                setSeed(seedphrase)
                setShowingSeed(!showingSeed)
              } else {
                setError(true)
              }
            } else {
              setShowingSeed(!showingSeed)
            }
          }}
        >
          <Sprite symbol="mnemonic" width="24" height="24" className="me-2" />
          {showingSeed ? 'Hide' : 'Show'} seed phrase
        </rb.Button>
        {error && (
          <div className="text-danger" style={{ marginLeft: '1rem' }}>
            Could not retreive seedphrase.
          </div>
        )}
        {showingSeed && (
          <div style={{ marginLeft: '1rem' }}>
            <div className="mb-4">
              <Seedphrase seedphrase={seed} isBlurred={!revealSensitiveInfo} />
            </div>
            <div className="mb-2">
              <ToggleSwitch
                label="Reveal sensitive information"
                onToggle={(isToggled) => {
                  setRevealSensitiveInfo(isToggled)
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
