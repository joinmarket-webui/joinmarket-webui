import React from 'react'
import { useState, useEffect } from 'react'
import * as rb from 'react-bootstrap'
import DisplayAccounts from './DisplayAccounts'
import DisplayAccountUTXOs from './DisplayAccountUTXOs'
import { valueToUnit, walletDisplayName, BTC, SATS } from '../utils'
import DisplayUTXOs from './DisplayUTXOs'

export default function CurrentWallet ({ currentWallet }) {
  const [walletInfo, setWalletInfo] = useState(null)
  const [unit, setUnit] = useState(window.localStorage.getItem('unit') || BTC)
  const [utxos, setUtxos] = useState(null)
  const [fidelityBonds, setFidelityBonds] = useState(null)
  const [showUTXO, setShowUTXO] = useState(false)
  const [alert, setAlert] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const setValueUnit = unit => {
    setUnit(unit)
    window.localStorage.setItem('unit', unit)
  }

  useEffect(() => {
    const abortCtrl = new AbortController()
    const { name, token } = currentWallet
    const opts = {
      headers: { 'Authorization': `Bearer ${token}` },
      signal: abortCtrl.signal
    }

    setAlert(null)
    setIsLoading(true)
    fetch(`/api/v1/wallet/${name}/display`, opts)
      .then(res => res.ok ? res.json() : Promise.reject(new Error(res.message || 'Loading wallet failed.')))
      .then(data => setWalletInfo(data.walletinfo))
      .catch(err => setAlert({ variant: 'danger', message: err.message }))
      .finally(() => setIsLoading(false))

    return () => abortCtrl.abort()
  }, [currentWallet])

  useEffect(() => {
    const abortCtrl = new AbortController()
    const { name, token } = currentWallet
    const opts = {
      headers: { 'Authorization': `Bearer ${token}` },
      signal: abortCtrl.signal
    }
    const setData = utxos => {
      setUtxos(utxos)
      setFidelityBonds(utxos.filter(utxo => utxo.locktime))
    }

    setAlert(null)
    setIsLoading(true)
    fetch(`/api/v1/wallet/${name}/utxos`, opts)
      .then(res => res.ok ? res.json() : Promise.reject(new Error(res.message || 'Loading UTXOs failed.')))
      .then(data => setData(data.utxos))
      .catch(err => {
        if (!abortCtrl.signal.aborted) {
          setAlert({ variant: 'danger', message: err.message })
        }
      })
      .finally(() => setIsLoading(false))

    return () => abortCtrl.abort()
  }, [currentWallet])

  return (
    <div>
      <h1>{walletDisplayName(currentWallet.name)}</h1>
      {alert && <rb.Alert variant={alert.variant}>{alert.message}</rb.Alert>}
      {isLoading &&
        <div className="mb-3">
          <rb.Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
          Loading
        </div>}
      {walletInfo && walletInfo?.total_balance &&
        <>
          <p>Total Balance: {valueToUnit(walletInfo.total_balance, unit)}</p>
          <rb.Form.Check type="switch" label="Display amounts in sats" checked={unit === SATS} onChange={(e) => setValueUnit(e.target.checked ? SATS : BTC)} />
        </>}
      {!!fidelityBonds?.length && (
        <div className="my-4 pe-3">
          <h5>Fidelity Bonds</h5>
          <DisplayUTXOs utxos={fidelityBonds} unit={unit} className="pe-2" />
        </div>)}
      {walletInfo && <DisplayAccounts accounts={walletInfo.accounts} unit={unit} />}
      {utxos && <rb.Button variant="outline-dark" onClick={() => { setShowUTXO(!showUTXO) }} className="my-3">{showUTXO ? 'Hide UTXOs' : 'Show UTXOs'}</rb.Button>}
      {utxos && showUTXO && <DisplayAccountUTXOs utxos={utxos} unit={unit} className="mt-3" />}
    </div>
  )
}
