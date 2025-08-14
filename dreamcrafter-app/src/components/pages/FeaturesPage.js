import React from 'react';
import { Brain, Moon, Heart, Star, Eye, Zap } from 'lucide-react';
import styles from './HomePage.module.css'; // ✅ REUSE YOUR EXISTING STYLES

const FeaturesPage = ({ setCurrentPage }) => {
  const features = [
    {
      icon: Brain,
      title: "AI Dream Interpretation",
      description: "Advanced AI-powered analysis of your dream patterns and hidden meanings"
    },
    {
      icon: Moon,
      title: "Lucid Dream Training",
      description: "Learn proven techniques to achieve consciousness within your dreams"
    },
    {
      icon: Heart,
      title: "Dream Journal",
      description: "Record and track your dreams with our intelligent journaling system"
    },
    {
      icon: Star,
      title: "Sleep Analytics",
      description: "Comprehensive analysis of your sleep cycles and dream phases"
    },
    {
      icon: Eye,
      title: "Vision Boards",
      description: "Create visual representations of your dream experiences"
    },
    {
      icon: Zap,
      title: "Real-time Monitoring",
      description: "Track your REM cycles and dream intensity in real-time"
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
          Powerful Dream Features
        </h1>
      </div>

      {/* Features Grid using existing brain section styling */}
      <div className={styles.brainSection}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '2rem',
          maxWidth: '1200px',
          width: '100%'
        }}>
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} style={{
                background: 'rgba(255, 255, 255, 0.8)',
                padding: '2rem',
                borderRadius: '15px',
                border: '2px solid rgba(165, 105, 189, 0.2)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 25px rgba(165, 105, 189, 0.1)',
                textAlign: 'center',
                transition: 'all 0.3s ease'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: 'linear-gradient(135deg, #A569BD, #D2691E)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto'
                }}>
                  <Icon style={{ width: '30px', height: '30px', color: 'white' }} />
                </div>
                <h3 style={{ 
                  color: '#8B4513', 
                  fontSize: '1.5rem', 
                  marginBottom: '1rem',
                  fontFamily: 'Georgia, serif'
                }}>
                  {feature.title}
                </h3>
                <p style={{ 
                  color: 'rgba(139, 69, 19, 0.8)', 
                  lineHeight: '1.6',
                  fontFamily: 'Georgia, serif'
                }}>
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Velvet Overlay */}
      <div className={styles.velvetOverlay}></div>
    </div>
  );
};

export default FeaturesPage;
