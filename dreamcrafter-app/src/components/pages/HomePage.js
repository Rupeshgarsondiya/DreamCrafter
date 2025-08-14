import React, { useState, useEffect } from 'react';
import styles from './HomePage.module.css'; // ✅ CRITICAL: Add this import

const HomePage = ({ setCurrentPage }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeCloud, setActiveCloud] = useState(null);

  const dreamClouds = [
    { id: 1, emoji: '🌊', position: 'cloud1' },
    { id: 2, emoji: '🌲', position: 'cloud2' },
    { id: 3, emoji: '🌟', position: 'cloud3' },
    { id: 4, emoji: '🏰', position: 'cloud4' },
    { id: 5, emoji: '🎭', position: 'cloud5' }
  ];

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleCloudClick = (cloudId) => {
    setActiveCloud(activeCloud === cloudId ? null : cloudId);
  };

  return (
    <div className={styles.homepage}>
      {/* Background Elements */}
      <div className={styles.backgroundElements}>
        <div className={styles.velvetParticle1}></div>
        <div className={styles.velvetParticle2}></div>
        <div className={styles.velvetParticle3}></div>
      </div>

      {/* Title at Top */}
      <div className={styles.titleSection}>
        <h1 className={`${styles.mainTitle} ${isVisible ? styles.visible : ''}`}>
          Unlock Your Dream World
        </h1>
      </div>

      {/* Brain with Dream Clouds Section */}
      <div className={styles.brainSection}>
        <div className={styles.brainContainer}>
          {/* Central Brain */}
          <div className={styles.brainCore}>
            <div className={styles.brainEmoji}>🧠</div>
            <div className={styles.brainGlow}></div>
            <div className={styles.neuralRings}>
              <div className={styles.ring1}></div>
              <div className={styles.ring2}></div>
              <div className={styles.ring3}></div>
            </div>
          </div>

          {/* Dream Clouds Around Brain */}
          {dreamClouds.map((cloud) => (
            <div
              key={cloud.id}
              className={`${styles.dreamCloud} ${styles[cloud.position]} ${
                activeCloud === cloud.id ? styles.active : ''
              }`}
              onClick={() => handleCloudClick(cloud.id)}
            >
              <div className={styles.cloudContent}>
                <span className={styles.cloudEmoji}>{cloud.emoji}</span>
                <div className={styles.cloudAura}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Velvet Overlay */}
      <div className={styles.velvetOverlay}></div>
    </div>
  );
};

export default HomePage;
