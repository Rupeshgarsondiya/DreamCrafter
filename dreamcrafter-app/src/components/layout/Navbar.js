import React from 'react';
import { Moon, Sparkles, Home, Zap, Newspaper, User, LogOut, Mail } from 'lucide-react';
import AuthService from '../../services/auth';
import styles from './Navbar.module.css'; // ✅ CORRECT CSS MODULE IMPORT

const Navbar = ({ setCurrentPage, currentPage, isAuthenticated }) => {
  const handleLogout = async () => {
    const result = await AuthService.logout();
    if (result.success) {
      setCurrentPage('landing');
      window.location.reload();
    }
  };

  const navItems = isAuthenticated ? [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      action: () => setCurrentPage('home')
    },
    {
      id: 'features',
      label: 'Features', 
      icon: Zap,
      action: () => setCurrentPage('features')
    },
    {
      id: 'news',
      label: 'News',
      icon: Newspaper,
      action: () => document.getElementById('news')?.scrollIntoView({ behavior: 'smooth' })
    }
  ] : [
    {
      id: 'hero',
      label: 'Home',
      icon: Home,
      action: () => document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' })
    },
    {
      id: 'features',
      label: 'Features',
      icon: Zap,
      action: () => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
    },
    {
      id: 'news',
      label: 'News',
      icon: Newspaper,
      action: () => document.getElementById('news')?.scrollIntoView({ behavior: 'smooth' })
    }
  ];

  return (
    <nav className={styles.navbarContainer}>
      <div className={styles.navbarContent}>
        {/* Logo Section with Velvet Theme */}
        <div
          onClick={() => setCurrentPage(isAuthenticated ? 'home' : 'landing')}
          className={styles.logoSection}
        >
          <div className={styles.logoIconContainer}>
            <div className={styles.logoMainCircle}>
              <Moon className={styles.moonIcon} />
              <div className={styles.sparkleOverlay}>
                <Sparkles className={styles.sparkleIcon} />
              </div>
            </div>
            <div className={styles.logoGlow}></div>
          </div>
          
          <div className={styles.brandText}>
            <h1 className={styles.siteName}>
              <span className={styles.dreamText}>Dream</span>
              <span className={styles.crafterText}>Crafter</span>
            </h1>
            <p className={styles.brandSlogan}>A velvet lens on your inner world</p>
          </div>
        </div>

        {/* Navigation Icons */}
        <div className={styles.navSection}>
          <div className={styles.navIcons}>
            {navItems.map(({ id, label, icon: Icon, action }) => (
              <div
                key={id}
                onClick={action}
                className={`${styles.navIconWrapper} ${currentPage === id ? styles.active : ''}`}
                title={label}
              >
                <div className={styles.navIconCircle}>
                  <Icon className={styles.navIcon} />
                </div>
                <span className={styles.navLabel}>{label}</span>
                <div className={styles.navTooltip}>{label}</div>
              </div>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className={styles.authSection}>
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => setCurrentPage('dashboard')}
                  className={styles.dashboardButton}
                  title="Dashboard"
                >
                  <User className={styles.authIcon} />
                  <span>Dashboard</span>
                </button>
                <button
                  onClick={handleLogout}
                  className={styles.logoutButton}
                  title="Logout"
                >
                  <LogOut className={styles.authIcon} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setCurrentPage('login')}
                  className={styles.loginButton}
                >
                  <Mail className={styles.authIcon} />
                  <span>Login</span>
                  <div className={styles.buttonShine}></div>
                </button>
                <button
                  onClick={() => setCurrentPage('signup')}
                  className={styles.signupButton}
                >
                  <User className={styles.authIcon} />
                  <span>Sign Up</span>
                  <div className={styles.buttonShine}></div>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className={styles.mobileMenuButton}>
          <div className={styles.hamburgerLine}></div>
          <div className={styles.hamburgerLine}></div>
          <div className={styles.hamburgerLine}></div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
