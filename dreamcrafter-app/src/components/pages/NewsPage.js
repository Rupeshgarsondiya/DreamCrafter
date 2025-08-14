import React from 'react';
import styles from './HomePage.module.css'; // ✅ REUSE YOUR EXISTING STYLES

const NewsPage = ({ setCurrentPage }) => {
  const newsArticles = [
    {
      id: 1,
      title: "Revolutionary Brain Imaging Reveals Dream Content",
      excerpt: "Scientists can now decode visual dreams using advanced fMRI technology",
      image: "🧠",
      date: "August 2025"
    },
    {
      id: 2,
      title: "Lucid Dreaming Training Shows Remarkable Success",
      excerpt: "New techniques help 85% of participants achieve lucid dreams within 30 days",
      image: "🌙",
      date: "July 2025"
    },
    {
      id: 3,
      title: "AI Interprets Dreams with 92% Accuracy",
      excerpt: "Machine learning algorithms crack the code of subconscious symbolism",
      image: "🤖",
      date: "June 2025"
    }
  ];

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
        <h1 className={`${styles.mainTitle} ${styles.visible}`}>
          Dream Science News
        </h1>
      </div>

      {/* News Grid using existing brain section styling */}
      <div className={styles.brainSection}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
          gap: '2rem',
          maxWidth: '1200px',
          width: '100%'
        }}>
          {newsArticles.map((article) => (
            <div key={article.id} style={{
              background: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '15px',
              overflow: 'hidden',
              border: '2px solid rgba(165, 105, 189, 0.2)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 25px rgba(165, 105, 189, 0.1)',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}>
              <div style={{
                height: '200px',
                background: 'linear-gradient(135deg, rgba(165, 105, 189, 0.2), rgba(210, 105, 30, 0.2))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '4rem'
              }}>
                {article.image}
              </div>
              <div style={{ padding: '1.5rem' }}>
                <div style={{
                  color: '#A569BD',
                  fontSize: '0.9rem',
                  marginBottom: '0.5rem',
                  fontFamily: 'Georgia, serif'
                }}>
                  {article.date}
                </div>
                <h3 style={{
                  color: '#8B4513',
                  fontSize: '1.3rem',
                  marginBottom: '1rem',
                  fontWeight: '600',
                  fontFamily: 'Georgia, serif'
                }}>
                  {article.title}
                </h3>
                <p style={{
                  color: 'rgba(139, 69, 19, 0.8)',
                  lineHeight: '1.5',
                  fontFamily: 'Georgia, serif'
                }}>
                  {article.excerpt}
                </p>
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

export default NewsPage;
