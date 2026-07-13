import {Link, useLocation} from 'react-router-dom'
import {
  FileMagnifyingGlass,
  ClockCounterClockwise,
} from '@phosphor-icons/react'

import {NAVBAR} from '../constants/testIds'

const NavLink = props => {
  const {to, children, testId, active} = props

  const activeClassName = active
    ? 'text-primary border-primary'
    : 'text-slate-500 border-transparent hover:text-slate-900 hover:border-slate-300'

  return (
    <Link
      to={to}
      data-testid={testId}
      className={`px-4 py-2 text-sm font-semibold uppercase tracking-wide transition-colors duration-200 border-b-2 ${activeClassName}`}
    >
      {children}
    </Link>
  )
}

const Navbar = () => {
  const location = useLocation()

  const isHomeRoute = location.pathname === '/'
  const isAnalyzeRoute = location.pathname === '/analyze'
  const isHistoryRoute = location.pathname === '/history'

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          to="/"
          data-testid={NAVBAR.logoLink}
          className="flex items-center gap-2 group"
        >
          <FileMagnifyingGlass
            size={26}
            weight="bold"
            className="text-primary"
          />

          <p className="font-heading font-black text-lg tracking-tight text-slate-900">
            ResumeIQ
          </p>
        </Link>

        <nav className="flex items-center gap-1">
          <NavLink
            to="/"
            testId={NAVBAR.homeLink}
            active={isHomeRoute}
          >
            Home
          </NavLink>

          <NavLink
            to="/analyze"
            testId={NAVBAR.analyzeLink}
            active={isAnalyzeRoute}
          >
            Analyze
          </NavLink>

          <NavLink
            to="/history"
            testId={NAVBAR.historyLink}
            active={isHistoryRoute}
          >
            <div className="flex items-center gap-1">
              <ClockCounterClockwise size={16} weight="bold" />
              <span>History</span>
            </div>
          </NavLink>
        </nav>
      </div>
    </header>
  )
}

export default Navbar