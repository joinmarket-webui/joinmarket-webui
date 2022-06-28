import React from 'react'
import * as rb from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import styles from './Modal.module.css'
import Sprite from './Sprite'

const ConfirmModal = ({ isShown, title, body, onCancel, onConfirm }) => {
  const { t } = useTranslation()

  return (
    <rb.Modal
      show={isShown}
      keyboard={true}
      onEscapeKeyDown={onCancel}
      centered={true}
      animation={true}
      backdrop="static"
      className={styles['modal']}
    >
      <rb.Modal.Header className={styles['modal-header']}>
        <rb.Modal.Title className={styles['modal-title']}>{title}</rb.Modal.Title>
      </rb.Modal.Header>
      <rb.Modal.Body className={styles['modal-body']}>{body}</rb.Modal.Body>
      <rb.Modal.Footer className={styles['modal-footer']}>
        <rb.Button variant="light" onClick={onCancel} className="d-flex justify-content-center align-items-center">
          <Sprite symbol="cancel" width="26" height="26" />
          <div>{t('modal.confirm_button_reject')}</div>
        </rb.Button>
        <rb.Button variant="dark" onClick={onConfirm}>
          {t('modal.confirm_button_accept')}
        </rb.Button>
      </rb.Modal.Footer>
    </rb.Modal>
  )
}

export { ConfirmModal }
