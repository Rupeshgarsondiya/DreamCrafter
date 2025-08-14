import React, { useState } from 'react';
import { ArrowRight, Sparkles, Play, Pause, Star, Moon, Brain, Zap, Heart, Eye } from 'lucide-react';
import FloatingElement from '../layout/FloatingElement';
import styles from './LandingPage.module.css'; // ✅ ADD THIS CSS IMPORT

const LandingPage = ({ setCurrentPage }) => {
  const [activeVideo, setActiveVideo] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const dreamVideos = [
    {
      id: 1,
      title: "Ocean Dreams",
      preview: "🌊",
      description: "Dive into the depths of oceanic consciousness"
    },
    {
      id: 2,
      title: "Forest Whispers", 
      preview: "🌲",
      description: "Ancient wisdom through woodland dreams"
    },
    {
      id: 3,
      title: "Cosmic Journey",
      preview: "🌟",
      description: "Travel through stellar dreamscapes"
    },
    {
      id: 4,
      title: "Memory Palace",
      preview: "🏰",
      description: "Explore the architecture of remembrance"
    }
  ];

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

  const handleCloudClick = (cloudId) => {
    setActiveVideo(activeVideo === cloudId ? null : cloudId);
  };

  const toggleVideoPlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className={styles.landingPage}>
      {/* SECTION 1: Hero/Home Section */}
      <section id="hero" className={styles.heroSection}>
        {/* Animated Brain with Dream Clouds */}
        <div className={styles.brainContainer}>
          {/* Central Brain */}
          <div className={styles.brainCore}>
            <div className={styles.brainEmoji}>🧠</div>
            <div className={styles.neuralRings}>
              <div className={styles.ring1}></div>
              <div className={styles.ring2}></div>
              <div className={styles.ring3}></div>
            </div>
          </div>

          {/* Dream Clouds around Brain */}
          {dreamVideos.map((dream, index) => (
            <div
              key={dream.id}
              className={`${styles.dreamCloud} ${styles[`cloud${index + 1}`]} ${
                activeVideo === dream.id ? styles.active : ''
              }`}
              onClick={() => handleCloudClick(dream.id)}
              title={dream.title}
            >
              <div className={styles.cloudContent}>
                <span className={styles.dreamPreview}>{dream.preview}</span>
                <div className={styles.cloudGlow}></div>
              </div>
              {activeVideo === dream.id && (
                <div className={styles.dreamDescription}>
                  <h4>{dream.title}</h4>
                  <p>{dream.description}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Hero Text */}
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            <span className={styles.titleLine}>Unlock the</span>
            <span className={styles.titleHighlight}>Velvet Mysteries</span>
            <span className={styles.titleLine}>of Your Dreams</span>
          </h1>
          <p className={styles.heroDescription}>
            A velvet lens on your inner world
          </p>
          <p className={styles.heroSubtext}>
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
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <span>Explore Features</span>
              <Sparkles className={styles.buttonIcon} />
            </button>
          </div>
        </div>

        {/* Background Video Overlay */}
        {activeVideo && (
          <div className={styles.dreamVideoOverlay}>
            <div className={styles.videoContainer}>
              <div className={styles.dreamVisualization}>
                <h3>Experiencing: {dreamVideos.find(d => d.id === activeVideo)?.title}</h3>
                <div className={styles.dreamParticles}>
                  {Array.from({length: 20}, (_, i) => (
                    <div key={i} className={`${styles.particle} ${styles[`particle${i + 1}`]}`}></div>
                  ))}
                </div>
              </div>
              <button 
                className={styles.closeDream}
                onClick={() => setActiveVideo(null)}
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Floating Elements */}
        <FloatingElement element={{ type: 'cloud' }} />
        <FloatingElement element={{ type: 'star' }} />
        <FloatingElement element={{ type: 'sparkle' }} />
      </section>

      {/* SECTION 2: Features Section */}
      <section id="features" className={styles.featuresSection}>
        <div className={styles.featuresContainer}>
          <h2 className={styles.sectionTitle}>Dream Analysis Tools</h2>
          <p className={styles.sectionSubtitle}>
            Unlock the mysteries of your subconscious mind with our advanced dream analysis tools and consciousness exploration features.
          </p>
          
          <div className={styles.featuresGrid}>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className={styles.featureCard}>
                  <div className={styles.featureIcon}>
                    <Icon className={styles.iconSvg} />
                  </div>
                  <h3 className={styles.featureTitle}>{feature.title}</h3>
                  <p className={styles.featureDescription}>{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 3: Dream Research News */}
      <section id="news" className={styles.newsSection}>
        <div className={styles.newsContainer}>
          <h2 className={styles.sectionTitle}>Dream Science Insights</h2>
          <p className={styles.sectionSubtitle}>
            Stay updated with the latest breakthroughs in dream research, consciousness studies, and sleep science from around the world.
          </p>
          
          <div className={styles.newsGrid}>
            {newsArticles.map((article, index) => (
              <div key={article.id} className={styles.newsCard}>
                <div className={styles.newsImage}>
                  {article.image}
                </div>
                <div className={styles.newsContent}>
                  <div className={styles.newsDate}>{article.date}</div>
                  <h3 className={styles.newsTitle}>{article.title}</h3>
                  <p className={styles.newsExcerpt}>{article.excerpt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: Dream Mechanism Video Section */}
      <section id="video" className={styles.videoSection}>
        <div className={styles.videoSectionContainer}>
          <h2 className={styles.sectionTitle}>The Science of Dreams</h2>
          <p className={styles.sectionSubtitle}>
            Explore the fascinating mechanisms of how your brain creates dreams during REM sleep cycles through cutting-edge neuroscience visualization.
          </p>
          
          {/* Video Container */}
          <div className={styles.videoPlayerContainer}>
            <div className={styles.videoPlayer}>
              {/* Mock Video Player */}
              <div className={styles.videoPlaceholder}>
                {/* Animated Brain */}
                <div className={styles.videoBrain}>
                  <div className={styles.videoBrainEmoji}>🧠</div>
                  
                  {/* Neural Activity Waves */}
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`${styles.neuralWave} ${styles[`wave${i + 1}`]}`}
                    ></div>
                  ))}
                </div>

                {/* Play Button */}
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

                {/* Video Controls */}
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
              
              <div className={styles.videoDescription}>
                <h3 className={styles.videoTitle}>
                  Understanding REM Sleep and Dream Formation
                </h3>
                <p className={styles.videoSubtext}>
                  Witness the incredible journey of how your brain processes memories, emotions, and experiences 
                  during sleep to create the vivid world of dreams. This high-quality visualization shows neural 
                  pathways activating during different sleep phases.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: Call to Action */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContainer}>
          <h2 className={styles.ctaTitle}>
            Ready to Explore Your Inner World?
          </h2>
          <p className={styles.ctaDescription}>
            Join thousands of dreamers who have unlocked the secrets of their subconscious mind. 
            Start your journey into the velvet realm of dreams today.
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
      </section>
    </div>
  );
};

export default LandingPage;
