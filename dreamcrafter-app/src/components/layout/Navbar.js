import React, { useState } from 'react';
import { Moon, Sparkles, Home, Zap, Newspaper, User, LogOut, Mail, Menu, X } from 'lucide-react';
import AuthService from '../../services/auth';
import styles from './Navbar.module.css';

const Navbar = ({ setCurrentPage, currentPage, isAuthenticated }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    const result = await AuthService.logout();
    if (result.success) {
      setCurrentPage('landing');
      window.location.reload();
    }
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offsetTop = element.offsetTop - 70;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, action: () => scrollToSection('home') },
    { id: 'features', label: 'Features', icon: Zap, action: () => scrollToSection('features') },
    { id: 'news', label: 'News', icon: Newspaper, action: () => scrollToSection('news') }
  ];

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        {/* Logo - Always Visible */}
        <div className={styles.logo} onClick={() => scrollToSection('home')}>
          <div className={styles.logoIcon}>
            <Moon className={styles.moonIcon} />
            <div className={styles.sparkle}>
              <Sparkles className={styles.sparkleIcon} />
            </div>
          </div>
          <div className={styles.logoText}>
            <span className={styles.dream}>Dream</span>
            <span className={styles.crafter}>Crafter</span>
          </div>
        </div>

        {/* Desktop Navigation - Hidden on Mobile */}
        <div className={styles.desktopNav}>
          {navItems.map(({ id, label, icon: Icon, action }) => (
            <button key={id} onClick={action} className={styles.navItem}>
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Desktop Auth - Hidden on Mobile */}
        <div className={styles.desktopAuth}>
          {isAuthenticated ? (
            <>
              <button onClick={() => setCurrentPage('dashboard')} className={styles.authBtn}>
                <User size={14} />
                <span>Dashboard</span>
              </button>
              <button onClick={handleLogout} className={styles.authBtn}>
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setCurrentPage('login')} className={styles.authBtn}>
                <User size={14} />
                <span>Login</span>
              </button>
              <button onClick={() => setCurrentPage('signup')} className={styles.signupBtn}>
                <Mail size={14} />
                <span>Sign Up</span>
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button - Only Visible on Mobile */}
        <button 
          className={styles.mobileToggle}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu - Only Visible When Open */}
      {isMobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <div className={styles.mobileNav}>
            {navItems.map(({ id, label, icon: Icon, action }) => (
              <button key={id} onClick={action} className={styles.mobileNavItem}>
                <Icon size={18} />
                <span>{label}</span>
              </button>
            ))}
          </div>
          <div className={styles.mobileAuth}>
            {isAuthenticated ? (
              <>
                <button onClick={() => { setCurrentPage('dashboard'); setIsMobileMenuOpen(false); }} className={styles.mobileAuthBtn}>
                  <User size={16} />
                  <span>Dashboard</span>
                </button>
                <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className={styles.mobileAuthBtn}>
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <button onClick={() => { setCurrentPage('login'); setIsMobileMenuOpen(false); }} className={styles.mobileAuthBtn}>
                  <User size={16} />
                  <span>Login</span>
                </button>
                <button onClick={() => { setCurrentPage('signup'); setIsMobileMenuOpen(false); }} className={styles.mobileSignupBtn}>
                  <Mail size={16} />
                  <span>Sign Up</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
