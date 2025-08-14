import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Play, Pause, Brain, Moon, Heart, Star, Eye, Zap } from 'lucide-react';
import styles from './LandingPage.module.css';

const LandingPage = ({ setCurrentPage, isAuthenticated }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeCloud, setActiveCloud] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Your existing data arrays remain the same...
  const dreamClouds = [
    { id: 1, emoji: '🌊', position: 'cloud1', title: "Ocean Dreams", description: "Dive into oceanic consciousness" },
    { id: 2, emoji: '🌲', position: 'cloud2', title: "Forest Whispers", description: "Ancient woodland wisdom" },
    { id: 3, emoji: '🌟', position: 'cloud3', title: "Cosmic Journey", description: "Travel stellar dreamscapes" },
    { id: 4, emoji: '🏰', position: 'cloud4', title: "Memory Palace", description: "Architecture of remembrance" },
    { id: 5, emoji: '🎭', position: 'cloud5', title: "Theater of Dreams", description: "Dramatic subconscious stories" }
  ];

  const features = [
    {
      icon: Brain,
      title: "AI Dream Interpretation",
      description: "Advanced AI-powered analysis of your dream patterns and hidden meanings using cutting-edge natural language processing and psychological frameworks."
    },
    {
      icon: Moon,
      title: "Lucid Dream Training",
      description: "Learn proven techniques to achieve consciousness within your dreams through guided exercises, reality checks, and expert mentorship programs."
    },
    {
      icon: Heart,
      title: "Dream Journal",
      description: "Record and track your dreams with our intelligent journaling system featuring voice-to-text, image integration, and mood analysis."
    },
    {
      icon: Star,
      title: "Sleep Analytics",
      description: "Comprehensive analysis of your sleep cycles and dream phases with detailed insights, recommendations, and health monitoring."
    },
    {
      icon: Eye,
      title: "Vision Boards",
      description: "Create visual representations of your dream experiences and life goals with our interactive board creator and manifestation tools."
    },
    {
      icon: Zap,
      title: "Real-time Monitoring",
      description: "Track your REM cycles and dream intensity in real-time with wearable device integration and live biometric analysis."
    }
  ];

  const newsArticles = [
    {
      id: 1,
      title: "Revolutionary Brain Imaging Reveals Dream Content",
      excerpt: "Scientists at MIT have developed groundbreaking fMRI technology that can decode visual dreams with unprecedented accuracy, opening new frontiers in consciousness research.",
      image: "🧠",
      date: "August 2025",
      category: "Neuroscience"
    },
    {
      id: 2,
      title: "Lucid Dreaming Training Shows Remarkable Success",
      excerpt: "New cognitive training techniques help 85% of participants achieve lucid dreams within 30 days, revolutionizing therapeutic applications for PTSD and anxiety disorders.",
      image: "🌙",
      date: "July 2025",
      category: "Psychology"
    },
    {
      id: 3,
      title: "AI Interprets Dreams with 92% Accuracy",
      excerpt: "Machine learning algorithms trained on thousands of dream reports can now crack the code of subconscious symbolism with remarkable precision.",
      image: "🤖",
      date: "June 2025",
      category: "Technology"
    }
  ];

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleCloudClick = (cloudId) => {
    setActiveCloud(activeCloud === cloudId ? null : cloudId);
  };

  const toggleVideoPlay = () => {
    setIsPlaying(!isPlaying);
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offsetTop = element.offsetTop - 80; // Account for navbar height
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className={styles.combinedLandingPage}>
      {/* ✅ HOME SECTION - FIXED SPACING */}
      <section id="home" className={styles.homeSection}>
        {/* Your existing home section content remains the same... */}
        <div className={styles.backgroundElements}>
          <div className={styles.velvetParticle1}></div>
          <div className={styles.velvetParticle2}></div>
          <div className={styles.velvetParticle3}></div>
          <div className={styles.shimmerOverlay}></div>
        </div>

        <div className={styles.titleSection}>
          <h1 className={`${styles.mainTitle} ${isVisible ? styles.visible : ''}`}>
            Unlock Your Dream World
          </h1>
          <p className={styles.subtitle}>A velvet lens on your inner consciousness</p>
        </div>

        <div className={styles.brainSection}>
          <div className={styles.brainContainer}>
            <div className={styles.brainCore}>
              <div className={styles.brainEmoji}>🧠</div>
              <div className={styles.brainGlow}></div>
              <div className={styles.neuralRings}>
                <div className={styles.ring1}></div>
                <div className={styles.ring2}></div>
                <div className={styles.ring3}></div>
              </div>
            </div>

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
                {activeCloud === cloud.id && (
                  <div className={styles.dreamTooltip}>
                    <h4>{cloud.title}</h4>
                    <p>{cloud.description}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.heroContent}>
          <p className={styles.heroDescription}>
            Explore the depths of your subconscious and unlock the mysteries hidden within your dreams through advanced AI analysis and consciousness exploration.
          </p>
          
          <div className={styles.heroButtons}>
            <button 
              className={styles.ctaPrimary}
              onClick={() => setCurrentPage('signup')}
            >
              <span>Begin Your Journey</span>
              <ArrowRight className={styles.buttonIcon} />
            </button>
            <button 
              className={styles.ctaSecondary}
              onClick={() => scrollToSection('features')}
            >
              <span>Explore Features</span>
              <Sparkles className={styles.buttonIcon} />
            </button>
          </div>
        </div>

        <div className={styles.velvetOverlay}></div>
      </section>

      {/* ✅ FEATURES SECTION - FIXED SPACING */}
      <section id="features" className={styles.featuresSection}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Powerful Dream Analysis Features</h2>
            <p className={styles.sectionSubtitle}>
              Discover the comprehensive tools that make DreamCrafter the most advanced dream analysis platform, 
              combining cutting-edge AI with deep psychological insights.
            </p>
          </div>
          
          <div className={styles.featuresGrid}>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className={`${styles.featureCard} ${styles[`delay${index + 1}`]}`}>
                  <div className={styles.featureIconContainer}>
                    <div className={styles.featureIcon}>
                      <Icon className={styles.iconSvg} />
                    </div>
                    <div className={styles.featureIconGlow}></div>
                  </div>
                  <div className={styles.featureContent}>
                    <h3 className={styles.featureTitle}>{feature.title}</h3>
                    <p className={styles.featureDescription}>{feature.description}</p>
                    <div className={styles.featureAccent}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ✅ NEWS SECTION - FIXED SPACING */}
      <section id="news" className={styles.newsSection}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Dream Science Insights</h2>
            <p className={styles.sectionSubtitle}>
              Stay updated with the latest breakthroughs in dream research, consciousness studies, 
              and sleep science from leading institutions worldwide.
            </p>
          </div>
          
          <div className={styles.newsGrid}>
            {newsArticles.map((article, index) => (
              <div key={article.id} className={`${styles.newsCard} ${styles[`newsDelay${index + 1}`]}`}>
                <div className={styles.newsImageContainer}>
                  <div className={styles.newsImage}>
                    {article.image}
                  </div>
                  <div className={styles.newsCategory}>{article.category}</div>
                </div>
                <div className={styles.newsContent}>
                  <div className={styles.newsMeta}>
                    <span className={styles.newsDate}>{article.date}</span>
                  </div>
                  <h3 className={styles.newsTitle}>{article.title}</h3>
                  <p className={styles.newsExcerpt}>{article.excerpt}</p>
                  <button className={styles.readMoreBtn}>
                    Read Full Article <ArrowRight className={styles.readMoreIcon} />
                  </button>
                </div>
                <div className={styles.newsGlow}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ✅ VIDEO SECTION - REDESIGNED WITH SIDE-BY-SIDE LAYOUT */}
      <section id="video" className={styles.videoSection}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>The Science of Dreams</h2>
            <p className={styles.sectionSubtitle}>
              Explore the fascinating mechanisms of how your brain creates dreams during REM sleep cycles 
              through cutting-edge neuroscience visualization and interactive experiences.
            </p>
          </div>
          
          {/* ✅ NEW: Side-by-Side Video Layout */}
          <div className={styles.videoContainer}>
            {/* Left Side - Video Player */}
            <div className={styles.videoPlayerSide}>
              <div className={styles.videoPlayer}>
                <div className={styles.videoPlaceholder}>
                  <div className={styles.videoBrain}>
                    <div className={styles.videoBrainEmoji}>🧠</div>
                    
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`${styles.neuralWave} ${styles[`wave${i + 1}`]}`}
                      ></div>
                    ))}
                  </div>

                  <div className={styles.playButtonContainer}>
                    <button
                      onClick={toggleVideoPlay}
                      className={styles.playButton}
                    >
                      {isPlaying ? (
                        <Pause className={styles.playIcon} />
                      ) : (
                        <Play className={styles.playIcon} />
                      )}
                    </button>
                  </div>

                  <div className={styles.videoControls}>
                    <div className={styles.videoInfo}>
                      {isPlaying ? 'Playing: Brain Mechanisms During REM Sleep' : 'Brain Mechanisms During REM Sleep'}
                    </div>
                    <div className={styles.progressContainer}>
                      <div className={styles.progressBar}>
                        <div className={`${styles.progress} ${isPlaying ? styles.playing : ''}`}></div>
                      </div>
                      <span className={styles.duration}>4:27</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Video Description */}
            <div className={styles.videoDescriptionSide}>
              <div className={styles.videoInfo}>
                <h3 className={styles.videoTitle}>
                  Understanding REM Sleep and Dream Formation
                </h3>
                <p className={styles.videoSubtext}>
                  Witness the incredible journey of how your brain processes memories, emotions, and experiences 
                  during sleep to create the vivid world of dreams. This high-quality visualization shows neural 
                  pathways activating during different sleep phases, revealing the complex beauty of consciousness.
                </p>
                
                <div className={styles.videoFeatures}>
                  <h4 className={styles.featuresTitle}>What You'll Learn:</h4>
                  <ul className={styles.featuresList}>
                    <li>REM sleep cycle mechanics</li>
                    <li>Neural pathway activation</li>
                    <li>Memory consolidation process</li>
                    <li>Dream content formation</li>
                    <li>Consciousness transitions</li>
                  </ul>
                </div>

                <div className={styles.videoStats}>
                  <div className={styles.statItem}>
                    <span className={styles.statNumber}>4:27</span>
                    <span className={styles.statLabel}>Duration</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statNumber}>1080p</span>
                    <span className={styles.statLabel}>Quality</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statNumber}>5.0★</span>
                    <span className={styles.statLabel}>Rating</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ✅ FINAL CTA SECTION - FIXED SPACING */}
      <section className={styles.finalCtaSection}>
        <div className={styles.ctaContainer}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>
              Ready to Explore Your Inner World?
            </h2>
            <p className={styles.ctaDescription}>
              Join thousands of dreamers who have unlocked the secrets of their subconscious mind. 
              Start your journey into the velvet realm of dreams today and discover what your mind 
              reveals when consciousness fades.
            </p>
            
            <div className={styles.ctaButtons}>
              <button 
                onClick={() => setCurrentPage('signup')}
                className={styles.ctaPrimaryLarge}
              >
                <span>Start Dreaming</span>
                <ArrowRight className={styles.buttonIcon} />
              </button>
              
              <button 
                onClick={() => setCurrentPage('login')}
                className={styles.ctaSecondaryLarge}
              >
                Sign In
              </button>
            </div>
          </div>
          <div className={styles.ctaVisual}>
            <div className={styles.ctaBrain}>
              <div className={styles.ctaBrainEmoji}>🧠</div>
              <div className={styles.ctaRings}>
                <div className={styles.ctaRing1}></div>
                <div className={styles.ctaRing2}></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
