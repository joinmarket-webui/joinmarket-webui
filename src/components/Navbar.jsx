import React from 'react'
import { Link, NavLink } from 'react-router-dom'
import * as rb from 'react-bootstrap'
import WalletPreview from './WalletPreview'

export default function Navbar({ currentWallet, connectionError }) {
  return (
    <rb.Navbar bg="white" sticky="top" expand="md" variant="light" collapseOnSelect className="border-bottom pb-0">
      <div className="container-lg align-items-stretch">
        {connectionError ? (
          <rb.Navbar.Text>No Connection</rb.Navbar.Text>
        ) : (
          <>
            {!currentWallet ? (
              <>
                <Link to="/" className="navbar-brand">
                  <img src="/logo.svg" width="30" height="30" className="d-inline-block align-top" alt="JoinMarket" />
                  <span className="ms-2">JoinMarket</span>
                </Link>
                <rb.Navbar.Toggle className="border-0" />
                <rb.Navbar.Collapse>
                  <rb.Nav className="ms-auto">
                    <Link to="/create-wallet" className="nav-link">
                      Create Wallet
                    </Link>
                  </rb.Nav>
                </rb.Navbar.Collapse>
              </>
            ) : (
              <>
                <rb.Nav className="d-flex flex-1">
                  <NavLink to="/wallet" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
                    <span className="me-auto">
                      <div class="nav-item">
                        <WalletPreview wallet={currentWallet} />
                      </div>
                    </span>
                  </NavLink>
                </rb.Nav>
                <rb.Navbar.Toggle className="border-0" />
                <rb.Navbar.Collapse className="flex-1 flex-grow-0 align-items-stretch">
                  <ul class="navbar-nav justify-content-center align-items-stretch">
                    <NavLink
                      to="/send"
                      className={({ isActive }) =>
                        'nav-link d-flex align-items-center pb-0 fw-bolder' + (isActive ? ' active' : '')
                      }
                    >
                      <li class="nav-item">Send</li>
                    </NavLink>
                    <NavLink
                      to="/receive"
                      className={({ isActive }) =>
                        'nav-link d-flex align-items-center pb-0 fw-bolder mx-md-4' + (isActive ? ' active' : '')
                      }
                    >
                      <div class="nav-item">Receive </div>
                    </NavLink>
                    <NavLink
                      to="/earn"
                      className={({ isActive }) =>
                        'nav-link d-flex align-items-center pb-0 fw-bolder' + (isActive ? ' active' : '')
                      }
                    >
                      <div class="nav-item"> Earn </div>
                    </NavLink>
                  </ul>
                </rb.Navbar.Collapse>
                <rb.Navbar.Collapse className="flex-1">
                  <span className="ms-auto">
                    <rb.Nav>
                      <Link to="/settings" className="nav-link px-0">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="30px"
                          height="30px"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          data-v-4fa90e7f=""
                        >
                          <path
                            d="M17.3 10.453l1.927.315a.326.326 0 01.273.322v1.793a.326.326 0 01-.27.321l-1.93.339c-.111.387-.265.76-.459 1.111l1.141 1.584a.326.326 0 01-.034.422l-1.268 1.268a.326.326 0 01-.418.037l-1.6-1.123a5.482 5.482 0 01-1.118.468l-.34 1.921a.326.326 0 01-.322.269H11.09a.325.325 0 01-.321-.272l-.319-1.911a5.5 5.5 0 01-1.123-.465l-1.588 1.113a.326.326 0 01-.418-.037L6.052 16.66a.327.327 0 01-.035-.42l1.123-1.57a5.497 5.497 0 01-.47-1.129l-1.901-.337a.326.326 0 01-.269-.321V11.09c0-.16.115-.296.273-.322l1.901-.317c.115-.393.272-.77.47-1.128l-1.11-1.586a.326.326 0 01.037-.417L7.34 6.052a.326.326 0 01.42-.034l1.575 1.125c.354-.194.73-.348 1.121-.46l.312-1.91a.326.326 0 01.322-.273h1.793c.159 0 .294.114.322.27l.336 1.92c.389.112.764.268 1.12.465l1.578-1.135a.326.326 0 01.422.033l1.268 1.268a.326.326 0 01.036.418L16.84 9.342c.193.352.348.724.46 1.11zM9.716 12a2.283 2.283 0 104.566 0 2.283 2.283 0 00-4.566 0z"
                            clip-rule="evenodd"
                          ></path>
                        </svg>
                      </Link>
                      <Link to="/" className="nav-link px-0">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="30px"
                          height="30px"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          data-v-4fa90e7f=""
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M5.5 9.5v-3a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1zM13.5 9.5v-3a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1zM13.5 17.5v-3a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1zM5.5 17.5v-3a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1z"
                          ></path>
                        </svg>
                      </Link>
                    </rb.Nav>
                  </span>
                </rb.Navbar.Collapse>
              </>
            )}
          </>
        )}
      </div>
    </rb.Navbar>
  )
}