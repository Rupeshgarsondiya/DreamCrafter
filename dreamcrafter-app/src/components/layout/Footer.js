import React from 'react';
import { Moon, Heart, Mail, Phone, Github, Twitter, Instagram, ArrowUp } from 'lucide-react';
import styles from './Footer.module.css';

const Footer = ({ setCurrentPage }) => {
  const currentYear = new Date().getFullYear();

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offsetTop = element.offsetTop - 70;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className={styles.footer}>
      {/* Back to Top */}
      <button className={styles.backToTop} onClick={scrollToTop}>
        <ArrowUp size={16} />
        <span>Top</span>
      </button>

      <div className={styles.container}>
        {/* Brand */}
        <div className={styles.brand}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <Moon size={24} />
              <div className={styles.sparkle}>
                <Heart size={10} />
              </div>
            </div>
            <div className={styles.logoText}>
              <h3 className={styles.brandName}>
                <span className={styles.dream}>Dream</span>
                <span className={styles.crafter}>Crafter</span>
              </h3>
              <p className={styles.tagline}>A velvet lens on your inner world</p>
            </div>
          </div>
          
          <p className={styles.description}>
            Unlock the mysteries of your subconscious mind through advanced AI analysis.
          </p>
        </div>

        {/* Links - Mobile-First Structure */}
        <div className={styles.links}>
          <div className={styles.linkSection}>
            <h4>Navigation</h4>
            <button onClick={() => scrollToSection('home')}>Home</button>
            <button onClick={() => scrollToSection('features')}>Features</button>
            <button onClick={() => scrollToSection('news')}>News</button>
          </div>

          <div className={styles.linkSection}>
            <h4>Company</h4>
            <button onClick={() => {}}>About</button>
            <button onClick={() => {}}>Careers</button>
            <button onClick={() => {}}>Blog</button>
          </div>

          <div className={styles.linkSection}>
            <h4>Contact</h4>
            <div className={styles.contact}>
              <div className={styles.contactItem}>
                <Mail size={14} />
                <span>hello@dreamcrafter.com</span>
              </div>
              <div className={styles.contactItem}>
                <Phone size={14} />
                <span>+1 (555) 123-4567</span>
              </div>
            </div>
            
            <div className={styles.social}>
              <a href="https://github.com/Rupeshgarsondiya/DreamCrafter" aria-label="GitHub"><Github size={16} /></a>
              <a href="https://github.com/Rupeshgarsondiya/DreamCrafter" aria-label="Twitter"><Twitter size={16} /></a>
              <a href="https://github.com/Rupeshgarsondiya/DreamCrafter" aria-label="Instagram"><Instagram size={16} /></a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className={styles.bottom}>
        <p>© {currentYear} DreamCrafter. Made with <Heart size={12} className={styles.heartIcon} /> for dreamers</p>
      </div>
    </footer>
  );
};

export default Footer;
