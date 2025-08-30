import React, { useEffect, useMemo, useState } from 'react';
import styles from './VelvetHeader.module.css';

const VelvetHeader = ({ username = 'Dreamer', onHome, onLogout }) => {
  const [now, setNow] = useState(new Date());
  const quotes = useMemo(() => [
    'Dreams are the whispers of your soul.',
    'Within sleep, the mind paints its own universe.',
    'Every dream is a doorway to your inner world.',
    'Follow your dreams; they know the way.',
    'In dreams, we find the truths we hide by day.'
  ], []);
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const r = setInterval(() => setQuoteIndex((i) => (i + 1) % quotes.length), 7000);
    return () => clearInterval(r);
  }, [quotes.length]);

  const timeString = useMemo(() => {
    return now.toLocaleString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }, [now]);

  return (
    <div className={styles.headerWrap}>
      <div className={styles.backgroundShimmer} />
      <div className={styles.headerContent}>
        <div className={styles.titleBlock}>
          <h1 className={styles.welcomeTitle}>
            <span className={styles.greeting}>Welcome</span>
            <span className={styles.comma}>,</span>
            <span className={styles.username}>{username}</span>
            <span className={styles.sparkle}>✨</span>
          </h1>
          <p className={styles.dreamQuote}>
            {quotes[quoteIndex]}
          </p>
          <div className={styles.timeBadge}>{timeString}</div>
        </div>
        <div className={styles.actions}>
          <button className={`${styles.homeBtn} ${styles.ctaPrimary}`} onClick={onHome}>
            <span className={styles.btnIcon}>🏠</span>
            Home
          </button>
          <button className={`${styles.logoutBtn} ${styles.ctaSecondary}`} onClick={onLogout}>
            <span className={styles.btnIcon}>🚪</span>
            Logout
          </button>
        </div>
      </div>
      <div className={styles.particles}>
        <span className={`${styles.particle} ${styles.p1}`} />
        <span className={`${styles.particle} ${styles.p2}`} />
        <span className={`${styles.particle} ${styles.p3}`} />
      </div>
    </div>
  );
};

export default VelvetHeader;
