import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

export default function Navbar({ user, isAdmin, login, logout, onOpenAdmin, siteName, theme, toggleTheme, courses = [] }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return courses.filter(c => c.title?.toLowerCase().includes(q) || c.subject?.toLowerCase().includes(q)).slice(0, 6)
  }, [query, courses])

  const ThemeIcon = theme === 'dark' ? SunIcon : MoonIcon

  return (
    <nav className="navbar" aria-label="প্রধান নেভিগেশন">
      <div className="container navbar-inner">
        <div className="brand">
          <span className="brand-dot" />
          {siteName || 'Online School'}
        </div>

        <div className="nav-links desktop-only" aria-label="Site sections">
          <a href="#about">About</a>
          <a href="#courses">Courses</a>
          <a href="#teachers">Teachers</a>
          <a href="#gallery">Gallery</a>
          <a href="#contact">Contact</a>
        </div>

        {/* Search - desktop */}
        <div className="navbar-search desktop-only">
          <input
            className="input search-input"
            type="search"
            aria-label="কোর্স খুঁজুন"
            placeholder="কোর্স খুঁজুন..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
          />
          {searchFocused && results.length > 0 && (
            <div className="search-results">
              {results.map(c => (
                <Link key={c.id} to={`/course/${c.id}`} className="search-result-item" onClick={() => setQuery('')}>
                  <span>{c.title}</span>
                  <small>{c.subject}</small>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Desktop actions */}
        <div className="navbar-actions desktop-only">
          <button className="theme-toggle" aria-label="থিম পরিবর্তন করুন" onClick={toggleTheme}>
            <ThemeIcon />
          </button>
          {isAdmin && (
            <button className="btn btn-outline" onClick={onOpenAdmin}>অ্যাডমিন প্যানেল</button>
          )}
          {user ? (
            <>
              <Link to="/my-courses" className="btn btn-outline">আমার কোর্স</Link>
              <span className="body" style={{ fontSize: 13 }}>{user.displayName || user.email}</span>
              <button className="btn btn-outline" onClick={logout}>লগআউট</button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={login}>Google দিয়ে লগইন</button>
          )}
        </div>

        {/* Mobile: theme toggle always visible + hamburger */}
        <div className="mobile-only navbar-mobile-actions">
          <button className="theme-toggle" aria-label="থিম পরিবর্তন করুন" onClick={toggleTheme}>
            <ThemeIcon />
          </button>
          <button className="menu-toggle" aria-label="মেনু খুলুন" onClick={() => setMenuOpen(o => !o)}>
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="mobile-menu">
          <input
            className="input"
            type="search"
            aria-label="কোর্স খুঁজুন"
            style={{ marginBottom: 12 }}
            placeholder="কোর্স খুঁজুন..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {results.length > 0 && (
            <div className="search-results search-results-mobile">
              {results.map(c => (
                <Link key={c.id} to={`/course/${c.id}`} className="search-result-item" onClick={() => { setQuery(''); setMenuOpen(false) }}>
                  <span>{c.title}</span>
                  <small>{c.subject}</small>
                </Link>
              ))}
            </div>
          )}
          {isAdmin && (
            <button className="btn btn-outline" style={{ width: '100%', marginBottom: 8 }} onClick={() => { onOpenAdmin(); setMenuOpen(false) }}>
              অ্যাডমিন প্যানেল
            </button>
          )}
          {user ? (
            <>
              <Link to="/my-courses" className="btn btn-outline" style={{ width: '100%', marginBottom: 8, display: 'block', textAlign: 'center' }} onClick={() => setMenuOpen(false)}>আমার কোর্স</Link>
              <span className="body" style={{ fontSize: 13, display: 'block', margin: '10px 0' }}>{user.displayName || user.email}</span>
              <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => { logout(); setMenuOpen(false) }}>লগআউট</button>
            </>
          ) : (
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => { login(); setMenuOpen(false) }}>
              Google দিয়ে লগইন
            </button>
          )}
        </div>
      )}
    </nav>
  )
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.5 14.5c-1 .3-2 .5-3 .5-5 0-9-4-9-9 0-1 .2-2 .5-3-4 1-7 4.6-7 8.9C2 16.7 6.3 21 11.6 21c4.3 0 7.9-3 8.9-6.5z" />
    </svg>
  )
}
