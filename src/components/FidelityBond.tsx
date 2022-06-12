import React, { useEffect, useMemo, useState } from 'react'
import * as rb from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'

import { useServiceInfo } from '../context/ServiceInfoContext'
import { useLoadConfigValue } from '../context/ServiceConfigContext'
import { useCurrentWallet, useCurrentWalletInfo, useReloadCurrentWalletInfo, Account } from '../context/WalletContext'

// @ts-ignore
import DisplayUTXOs from './DisplayUTXOs'
// @ts-ignore
import PageTitle from './PageTitle'

import FidelityBondDetailsSetupForm from './fidelity_bond/FidelityBondDetailsSetupForm'
import * as Api from '../libs/JmWalletApi'
import styles from './FidelityBond.module.css'
import { isLocked } from '../hooks/BalanceSummary'

type AlertWithMessage = rb.AlertProps & { message: string }

/**
 * Send funds to a timelocked address.
 * Defaults to sweep with a collaborative transaction.
 * If the selected utxo is a single expired FB, "diret-send" is used.
 *
 * The transaction will have no change output.
 */
const sweepToFidelityBond = async (
  requestContext: Api.WalletRequestContext,
  account: Account,
  timelockedDestinationAddress: Api.BitcoinAddress,
  counterparties: number
): Promise<void> => {
  const amount_sats = 0 // sweep

  await Api.postCoinjoin(requestContext, {
    mixdepth: parseInt(account.account, 10),
    destination: timelockedDestinationAddress,
    amount_sats,
    counterparties,
  }).then((res) => (res.ok ? true : Api.Helper.throwError(res)))
}

const FidelityBondInProgress = () => {
  const { t } = useTranslation()
  return (
    <>
      <div className="d-flex justify-content-center align-items-center">
        <rb.Spinner animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
        <Trans i18nKey="fidelity_bond.transaction_in_progress_loading_text">Creating Fidelity Bond…</Trans>
      </div>
      <div className="d-flex justify-content-center">
        <small>
          <Trans i18nKey="fidelity_bond.transaction_in_progress_patience_text">
            Please be patient, this will take several minutes.
          </Trans>
        </small>
      </div>
      <rb.Alert variant="info" className="my-4">
        {t('send.text_coinjoin_already_running')}
      </rb.Alert>
    </>
  )
}

const FidelityBondError = () => {
  const { t } = useTranslation()
  return (
    <>
      <rb.Alert variant="danger" className="my-4">
        {t('fidelity_bond.text_fidelity_bond_create_error')}
      </rb.Alert>
    </>
  )
}

const FidelityBondSuccess = () => {
  const { t } = useTranslation()
  return (
    <>
      <rb.Alert variant="success" className="my-4">
        {t('fidelity_bond.text_fidelity_bond_create_success')}
      </rb.Alert>
    </>
  )
}

export default function FidelityBond() {
  const { t } = useTranslation()
  const currentWallet = useCurrentWallet()
  const currentWalletInfo = useCurrentWalletInfo()
  const reloadCurrentWalletInfo = useReloadCurrentWalletInfo()
  const serviceInfo = useServiceInfo()
  const loadConfigValue = useLoadConfigValue()

  const isCoinjoinInProgress = useMemo(() => serviceInfo && serviceInfo.coinjoinInProgress, [serviceInfo])
  const isMakerRunning = useMemo(() => serviceInfo && serviceInfo.makerRunning, [serviceInfo])

  const [alert, setAlert] = useState<AlertWithMessage | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isInitiateTxSuccess, setIsInitiateTxSuccess] = useState(false)
  const [initiateTxError, setInitiateTxError] = useState<unknown>(undefined)
  const isInitiateTxError = useMemo(() => initiateTxError !== undefined, [initiateTxError])

  const utxos = useMemo(() => currentWalletInfo?.data.utxos.utxos, [currentWalletInfo])
  const fidelityBonds = useMemo(() => utxos?.filter((utxo) => utxo.locktime), [utxos])
  const activeFidelityBonds = useMemo(() => fidelityBonds?.filter(isLocked), [fidelityBonds])
  const [amountOfFidelityBondsBeforeStart, setAmountOfFidelityBondsBeforeStart] = useState<number | undefined>(
    undefined
  )
  const [amountOfFidelityBondsAfterFinish, setAmountOfFidelityBondsAfterFinish] = useState<number | undefined>(
    undefined
  )
  const fidelityBondSuccessfullyCreated = useMemo(() => {
    if (amountOfFidelityBondsBeforeStart === undefined) return undefined
    if (amountOfFidelityBondsAfterFinish === undefined) return undefined
    return amountOfFidelityBondsAfterFinish === amountOfFidelityBondsBeforeStart + 1
  }, [amountOfFidelityBondsBeforeStart, amountOfFidelityBondsAfterFinish])

  const [waitForTakerToFinish, setWaitForTakerToFinish] = useState(false)

  useEffect(() => {
    if (isSending) return
    if (!isInitiateTxSuccess && !isInitiateTxError) return
    if (isCoinjoinInProgress === null) return

    setWaitForTakerToFinish(isCoinjoinInProgress)
  }, [isSending, isInitiateTxSuccess, isInitiateTxError, isCoinjoinInProgress])

  useEffect(() => {
    if (!currentWallet) {
      setAlert({ variant: 'danger', message: t('current_wallet.error_loading_failed') })
      setIsInitializing(false)
      return
    }

    const abortCtrl = new AbortController()

    setAlert(null)
    setIsLoading(true)

    reloadCurrentWalletInfo({ signal: abortCtrl.signal })
      .catch((err) => {
        const message = err.message || t('current_wallet.error_loading_failed')
        !abortCtrl.signal.aborted && setAlert({ variant: 'danger', message })
      })
      .finally(() => {
        if (abortCtrl.signal.aborted) return

        setIsLoading(false)
        setIsInitializing(false)
      })

    return () => abortCtrl.abort()
  }, [currentWallet, reloadCurrentWalletInfo, t])

  useEffect(() => {
    if (isSending) return
    if (!isInitiateTxSuccess && !isInitiateTxError) return
    if (waitForTakerToFinish) return

    const abortCtrl = new AbortController()
    setIsLoading(true)

    const delayInMs = 1_000 // let the backend some time to synchronize
    setTimeout(() => {
      if (abortCtrl.signal.aborted) return

      reloadCurrentWalletInfo({ signal: abortCtrl.signal })
        .then((info) => {
          const fidelityBonds = info.data.utxos.utxos.filter((utxo) => utxo.locktime)
          setAmountOfFidelityBondsAfterFinish(fidelityBonds.length)
        })
        .catch((err) => {
          const message = err.message || t('current_wallet.error_loading_failed')
          !abortCtrl.signal.aborted && setAlert({ variant: 'danger', message })
        })
        .finally(() => !abortCtrl.signal.aborted && setIsLoading(false))
    }, delayInMs)

    return () => abortCtrl.abort()
  }, [waitForTakerToFinish, isSending, isInitiateTxSuccess, isInitiateTxError, reloadCurrentWalletInfo, t])

  const onSubmit = async (
    selectedAccount: Account,
    selectedLockdate: Api.Lockdate,
    timelockedDestinationAddress: Api.BitcoinAddress
  ) => {
    if (isSending) return
    if (!currentWallet) return
    if (!fidelityBonds) return

    const abortCtrl = new AbortController()
    const { name: walletName, token } = currentWallet
    const requestContext = { walletName, token, signal: abortCtrl.signal }

    setIsSending(true)
    setAmountOfFidelityBondsBeforeStart(fidelityBonds.length)
    try {
      const minimumMakers = await loadConfigValue({
        signal: abortCtrl.signal,
        key: { section: 'POLICY', field: 'minimum_makers' },
      }).then((data) => parseInt(data.value, 10))

      // TODO: how many counterparties to use? is "minimum" for fbs okay?
      await sweepToFidelityBond(requestContext, selectedAccount, timelockedDestinationAddress, minimumMakers)
      setIsInitiateTxSuccess(true)
      setWaitForTakerToFinish(true)
    } catch (error) {
      setInitiateTxError(error)
      throw error
    } finally {
      setIsSending(false)
    }
  }

  // TODO: use alert like in other screens
  if (isMakerRunning) {
    return <>Creating Fidelity Bonds is temporarily disabled: Earn is active.</>
  }
  if (!waitForTakerToFinish && isCoinjoinInProgress) {
    return <>Creating Fidelity Bonds is temporarily disabled: A collaborative transaction is in progress.</>
  }

  return (
    <div className={styles['fidelity-bond']}>
      <PageTitle title={t('fidelity_bond.title')} subtitle={t('fidelity_bond.subtitle')} />

      <div className="mb-4">
        <Trans i18nKey="fidelity_bond.description">
          <a
            href="https://github.com/JoinMarket-Org/joinmarket-clientserver/blob/master/docs/fidelity-bonds.md"
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary"
          >
            See the documentation about Fidelity Bonds
          </a>{' '}
          for more information.
        </Trans>
      </div>

      {alert && <rb.Alert variant={alert.variant}>{alert.message}</rb.Alert>}

      <div>
        {isInitializing || isLoading ? (
          <div className="d-flex justify-content-center align-items-center">
            <rb.Spinner animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
            {t('global.loading')}
          </div>
        ) : (
          <>
            {fidelityBondSuccessfullyCreated !== undefined ? (
              <>{fidelityBondSuccessfullyCreated ? <FidelityBondSuccess /> : <FidelityBondError />}</>
            ) : (
              <>
                {activeFidelityBonds && (
                  <>
                    {activeFidelityBonds.length === 0 ? (
                      <>
                        {waitForTakerToFinish || isInitiateTxSuccess || isInitiateTxError ? (
                          <>
                            <FidelityBondInProgress />
                          </>
                        ) : (
                          <>
                            {currentWallet && currentWalletInfo && (
                              <FidelityBondDetailsSetupForm
                                currentWallet={currentWallet}
                                walletInfo={currentWalletInfo}
                                onSubmit={onSubmit}
                              />
                            )}
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="mt-2 mb-4">
                          <h5>{t('current_wallet_advanced.title_fidelity_bonds')}</h5>
                          <DisplayUTXOs utxos={activeFidelityBonds} />
                        </div>
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
