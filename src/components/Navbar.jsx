import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n'

export default function Navbar({ user, isAdmin, login, logout, onOpenAdmin, siteName, theme, toggleTheme, courses = [] }) {
  const { language, setLanguage, t, localized } = useLanguage()
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return courses.filter(c => `${localized(c, 'title')} ${c.subject || ''}`.toLowerCase().includes(q)).slice(0, 6)
  }, [query, courses, localized])

  const ThemeIcon = theme === 'dark' ? SunIcon : MoonIcon

  return (
    <nav className="navbar" aria-label={t('home')}>
      <div className="container navbar-inner">
        <div className="brand">
          <span className="brand-dot" />
          {siteName || 'Online School'}
        </div>

        <div className="nav-links desktop-only" aria-label="Site sections">
          <a href="#about">{t('home')}</a>
          <a href="#courses">{t('courses')}</a>
          <a href="#teachers">{t('teachers')}</a>
          <a href="#gallery">{t('gallery')}</a>
          <a href="#contact">{t('contact')}</a>
        </div>

        {/* Search - desktop */}
        <div className="navbar-search desktop-only">
          <input
            className="input search-input"
            type="search"
            aria-label={t('searchCourses')}
            placeholder={t('searchCourses')}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
          />
          {searchFocused && results.length > 0 && (
            <div className="search-results">
              {results.map(c => (
                <Link key={c.id} to={`/course/${c.id}`} className="search-result-item" onClick={() => setQuery('')}>
                  <span>{localized(c, 'title')}</span>
                  <small>{c.subject}</small>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Desktop actions */}
        <div className="navbar-actions desktop-only">
          <div className="language-switcher" aria-label={t('language')}>
            <button className={language === 'bn' ? 'active' : ''} onClick={() => setLanguage('bn')}>বাংলা</button>
            <span>|</span>
            <button className={language === 'en' ? 'active' : ''} onClick={() => setLanguage('en')}>English</button>
          </div>
          <button className="theme-toggle" aria-label="থিম পরিবর্তন করুন" onClick={toggleTheme}>
            <ThemeIcon />
          </button>
          {isAdmin && (
            <button className="btn btn-outline" onClick={onOpenAdmin}>{t('admin')}</button>
          )}
          {user ? (
            <>
              <Link to="/my-courses" className="btn btn-outline">{t('myCourses')}</Link>
              <span className="body" style={{ fontSize: 13 }}>{user.displayName || user.email}</span>
              <button className="btn btn-outline" onClick={logout}>{t('logout')}</button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={login}>{t('login')}</button>
          )}
        </div>

        {/* Mobile: theme toggle always visible + hamburger */}
        <div className="mobile-only navbar-mobile-actions">
          <button className="theme-toggle" aria-label="থিম পরিবর্তন করুন" onClick={toggleTheme}>
            <ThemeIcon />
          </button>
          <div className="language-switcher mobile-language-switcher" aria-label={t('language')}>
            <button className={language === 'bn' ? 'active' : ''} onClick={() => setLanguage('bn')}>বাংলা</button>
            <span>|</span>
            <button className={language === 'en' ? 'active' : ''} onClick={() => setLanguage('en')}>EN</button>
          </div>
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
            aria-label={t('searchCourses')}
            style={{ marginBottom: 12 }}
            placeholder={t('searchCourses')}
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {results.length > 0 && (
            <div className="search-results search-results-mobile">
              {results.map(c => (
                <Link key={c.id} to={`/course/${c.id}`} className="search-result-item" onClick={() => { setQuery(''); setMenuOpen(false) }}>
                  <span>{localized(c, 'title')}</span>
                  <small>{c.subject}</small>
                </Link>
              ))}
            </div>
          )}
          {isAdmin && (
            <button className="btn btn-outline" style={{ width: '100%', marginBottom: 8 }} onClick={() => { onOpenAdmin(); setMenuOpen(false) }}>
              {t('admin')}
            </button>
          )}
          {user ? (
            <>
              <Link to="/my-courses" className="btn btn-outline" style={{ width: '100%', marginBottom: 8, display: 'block', textAlign: 'center' }} onClick={() => setMenuOpen(false)}>{t('myCourses')}</Link>
              <span className="body" style={{ fontSize: 13, display: 'block', margin: '10px 0' }}>{user.displayName || user.email}</span>
              <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => { logout(); setMenuOpen(false) }}>{t('logout')}</button>
            </>
          ) : (
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => { login(); setMenuOpen(false) }}>
              {t('login')}
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
