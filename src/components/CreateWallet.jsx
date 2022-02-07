import React, { useState } from 'react'
import * as rb from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import PageTitle from './PageTitle'
import ToggleSwitch from './ToggleSwitch'
import { serialize, walletDisplayName } from '../utils'
import { useCurrentWallet } from '../context/WalletContext'

const WalletCreationForm = ({ createWallet, isCreating }) => {
  const [validated, setValidated] = useState(false)

  const onSubmit = (e) => {
    e.preventDefault()

    const form = e.currentTarget
    const isValid = form.checkValidity()
    setValidated(true)

    if (isValid) {
      const { wallet, password } = serialize(form)
      createWallet(wallet, password)
    }
  }

  return (
    <>
      <rb.Form onSubmit={onSubmit} validated={validated} noValidate>
        <rb.Form.Group className="mb-4" controlId="walletName">
          <rb.Form.Label>Wallet Name</rb.Form.Label>
          <rb.Form.Control name="wallet" placeholder="Your wallet..." required />
          <rb.Form.Control.Feedback>Looks good!</rb.Form.Control.Feedback>
          <rb.Form.Control.Feedback type="invalid">Please set a wallet name.</rb.Form.Control.Feedback>
        </rb.Form.Group>
        <rb.Form.Group className="mb-4" controlId="password">
          <rb.Form.Label>Password</rb.Form.Label>
          <rb.Form.Control
            name="password"
            type="password"
            placeholder="Choose a secure password..."
            autoComplete="new-password"
            required
          />
          <rb.Form.Control.Feedback>Looks good!</rb.Form.Control.Feedback>
          <rb.Form.Control.Feedback type="invalid">Please set a password.</rb.Form.Control.Feedback>
        </rb.Form.Group>
        <rb.Button variant="dark" type="submit" disabled={isCreating}>
          {isCreating ? (
            <div>
              <rb.Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
              Creating
            </div>
          ) : (
            'Create'
          )}
        </rb.Button>
      </rb.Form>
    </>
  )
}

const WalletCreationConfirmation = ({ createdWallet, walletConfirmed }) => {
  const [userConfirmed, setUserConfirmed] = useState(false)

  const onToggle = (toggled) => {
    setUserConfirmed(toggled)
  }

  return (
    <div>
      <p className="mb-4">
        <div>Wallet Name</div>
        <div className="fs-4">{walletDisplayName(createdWallet.name)}</div>
      </p>
      <p className="mb-4">
        <div className="mb-2">Seedphrase</div>
        <Seedphrase seedphrase={createdWallet.seedphrase} />
      </p>
      <p className="mb-4">
        <div>Password</div>
        <div className="fs-4">{createdWallet.password}</div>
      </p>
      <div className="mb-4">
        <ToggleSwitch label="I've written down the information above." onToggle={onToggle} />
      </div>
      <rb.Button
        variant="dark"
        type="submit"
        disabled={!userConfirmed}
        onClick={() => userConfirmed && walletConfirmed()}
      >
        Fund Wallet
      </rb.Button>
    </div>
  )
}

const Seedphrase = ({ seedphrase }) => {
  return (
    <div className="seedphrase d-flex flex-wrap">
      {seedphrase.split(' ').map((seedWord, index) => (
        <div key={index} className="d-flex py-2 ps-2 pe-3">
          <span className="seedword-index text-secondary text-end">{index + 1}</span>
          <span className="text-secondary">.&nbsp;</span>
          <span>{seedWord}</span>
        </div>
      ))}
    </div>
  )
}

export default function CreateWallet({ startWallet }) {
  const currentWallet = useCurrentWallet()
  const navigate = useNavigate()

  const [alert, setAlert] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [createdWallet, setCreatedWallet] = useState(null)

  const createWallet = async (name, password) => {
    const walletname = name.endsWith('.jmdat') ? name : `${name}.jmdat`

    setAlert(null)
    setIsCreating(true)

    try {
      const wallettype = 'sw-fb'
      const res = await fetch(`/api/v1/wallet/create`, {
        method: 'POST',
        body: JSON.stringify({
          password,
          walletname,
          wallettype,
        }),
      })

      if (res.ok) {
        const { seedphrase, token, walletname: name } = await res.json()
        setCreatedWallet({ name, seedphrase, password, token })
      } else {
        const { message } = await res.json()
        setAlert({ variant: 'danger', message })
      }
    } catch (e) {
      setAlert({ variant: 'danger', message: e.message })
    } finally {
      setIsCreating(false)
    }
  }

  const walletConfirmed = () => {
    if (createWallet.name && createdWallet.token) {
      startWallet(createdWallet.name, createdWallet.token)
      navigate('/wallet')
    } else {
      setAlert({ variant: 'danger', message: 'Wallet confirmation failed.' })
    }
  }

  const isCreated = createdWallet?.name && createdWallet?.seedphrase && createdWallet?.password
  const canCreate = !currentWallet && !isCreated

  return (
    <rb.Row className="create-wallet justify-content-center">
      <rb.Col md={10} lg={8} xl={6}>
        {isCreated ? (
          <PageTitle
            title="Wallet created successfully!"
            subtitle="Please write down your seed phrase and password! Without this information you will not be able to access and recover your wallet!"
            success
          />
        ) : (
          <PageTitle title="Create Wallet" />
        )}
        {alert && <rb.Alert variant={alert.variant}>{alert.message}</rb.Alert>}
        {canCreate && <WalletCreationForm createWallet={createWallet} isCreating={isCreating} />}
        {isCreated && <WalletCreationConfirmation createdWallet={createdWallet} walletConfirmed={walletConfirmed} />}
        {!canCreate && !isCreated && (
          <rb.Alert variant="warning">
            Currently <strong>{walletDisplayName(currentWallet.name)}</strong> is active. You need to lock it first.{' '}
            <Link to="/" className="alert-link">
              Go back
            </Link>
            .
          </rb.Alert>
        )}
      </rb.Col>
    </rb.Row>
  )
}
