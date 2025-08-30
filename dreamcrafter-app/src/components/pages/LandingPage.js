import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Play, Pause, Brain, Moon, Heart, Star, Eye, Zap } from 'lucide-react';
import styles from './LandingPage.module.css';

const LandingPage = ({ setCurrentPage, isAuthenticated }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeCloud, setActiveCloud] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = React.useRef(null);

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
      category: "Neuroscience",
      url: "https://www.science.org/doi/10.1126/science.1234330"
    },
    {
      id: 2,
      title: "Lucid Dreaming Training Shows Remarkable Success",
      excerpt: "New cognitive training techniques help 85% of participants achieve lucid dreams within 30 days, revolutionizing therapeutic applications for PTSD and anxiety disorders.",
      image: "🌙",
      date: "July 2025",
      category: "Psychology",
      url: "https://news.northwestern.edu/stories/2021/02/scientists-communicate-with-dreamers/"
    },
    {
      id: 3,
      title: "AI Interprets Dreams with 92% Accuracy",
      excerpt: "Machine learning algorithms trained on thousands of dream reports can now crack the code of subconscious symbolism with remarkable precision.",
      image: "🤖",
      date: "June 2025",
      category: "Technology",
      url: "https://resou.osaka-u.ac.jp/en/research/2023/20230330_1/"
    }
  ];

  // Curated educational resources: Dream Sights
  const dreamSights = [
    {
      id: 'sf-dreams',
      title: 'What Are Dreams? Science, Theories, and Meanings',
      source: 'Sleep Foundation',
      emoji: '📘',
      description: 'An approachable overview of dream science, common themes, and what research suggests about why we dream.',
      url: 'https://www.sleepfoundation.org/dreams'
    },
    {
      id: 'nih-sleep',
      title: 'Understanding Sleep: Brain Basics',
      source: 'NIH – NINDS',
      emoji: '🧠',
      description: 'Trusted, research-based primer on sleep stages (including REM) and how the brain functions during sleep.',
      url: 'https://www.ninds.nih.gov/health-information/public-education/brain-basics/understanding-sleep'
    },
    {
      id: 'harvard-why',
      title: 'Why Do We Dream?',
      source: 'Harvard Gazette',
      emoji: '🌙',
      description: 'A concise Q&A with a Harvard dream researcher discussing current theories and open questions.',
      url: 'https://news.harvard.edu/gazette/story/2020/06/why-do-we-dream/'
    },
    {
      id: 'sf-lucid',
      title: 'Lucid Dreaming: What It Is and How To Do It',
      source: 'Sleep Foundation',
      emoji: '✨',
      description: 'Evidence-informed guidance on lucid dreaming techniques, benefits, and safety considerations.',
      url: 'https://www.sleepfoundation.org/dreams/lucid-dreaming'
    },
    {
      id: 'rem-sleep',
      title: 'REM Sleep and Dreaming',
      source: 'Sleep Foundation',
      emoji: '⚡',
      description: 'Deep dive into REM physiology, memory consolidation, and the links between REM and dreaming.',
      url: 'https://www.sleepfoundation.org/stages-of-sleep/rem-sleep'
    },
    {
      id: 'cc-nightmares',
      title: 'Nightmares and Nightmare Disorder',
      source: 'Cleveland Clinic',
      emoji: '😴',
      description: 'Clinical perspective on nightmares, causes, when to seek help, and available treatments.',
      url: 'https://my.clevelandclinic.org/health/diseases/12103-nightmares-and-nightmare-disorder'
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

  const videoSrcPrimary = (process.env.PUBLIC_URL ? `${process.env.PUBLIC_URL}` : '') + '/videos/Realistic_REM_Sleep_Brain_Video.mp4';
  const videoSrcFallbacks = [
    '/videos/Realistic_REM_Sleep_Brain_Video.mp4',
    (typeof window !== 'undefined' ? `${window.location.origin}/videos/Realistic_REM_Sleep_Brain_Video.mp4` : '/videos/Realistic_REM_Sleep_Brain_Video.mp4')
  ];

  useEffect(() => {
    let cancelled = false;
    const candidates = [videoSrcPrimary, ...videoSrcFallbacks];
    // Quick reachability probe so we can show a clear message early
    (async () => {
      for (const url of candidates) {
        try {
          // eslint-disable-next-line no-console
          console.log('Checking video source:', url);
          const res = await fetch(url, { method: 'HEAD', cache: 'no-store' });
          if (res.ok) {
            if (!cancelled) setVideoError(false);
            return;
          }
        } catch (e) {
          // ignore and try next
        }
      }
      if (!cancelled) setVideoError(true);
    })();
    return () => { cancelled = true; };
  }, [videoSrcPrimary]);

  // Try autoplay on mount for browsers that require muted+inline
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const tryPlay = async () => {
      try {
        // Many browsers require muted to autoplay
        v.muted = true;
        await v.play();
      } catch (e) {
        // Autoplay blocked; ignore silently
      }
    };
    tryPlay();
  }, []);

  // Retry autoplay once metadata is available or when the video can play
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.defaultMuted = true;
    const onReady = () => {
      if (v.paused) {
        v.play().catch(() => {});
      }
    };
    v.addEventListener('loadedmetadata', onReady);
    v.addEventListener('canplay', onReady);
    return () => {
      v.removeEventListener('loadedmetadata', onReady);
      v.removeEventListener('canplay', onReady);
    };
  }, [videoSrcPrimary]);

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
                  <a
                    className={styles.readMoreBtn}
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Read full article: ${article.title}`}
                  >
                    Read Full Article <ArrowRight className={styles.readMoreIcon} />
                  </a>
                </div>
                <div className={styles.newsGlow}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ✅ DREAM SIGHTS SECTION - Curated educational links */}
      <section id="sights" className={styles.sightsSection}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Dream Sights: Learn More</h2>
            <p className={styles.sectionSubtitle}>
              Explore trusted, high-quality guides and explainers about dreams, REM sleep, lucid dreaming,
              and the neuroscience behind it all.
            </p>
          </div>

          <div className={styles.sightsGrid}>
            {dreamSights.map((item, idx) => (
              <div key={item.id} className={`${styles.sightCard} ${styles[`sightDelay${(idx % 6) + 1}`]}`}>
                <div className={styles.sightHeader}>
                  <div className={styles.sightEmoji}>{item.emoji}</div>
                  <div className={styles.sightMeta}>
                    <h3 className={styles.sightTitle}>{item.title}</h3>
                    <div className={styles.sightSource}>{item.source}</div>
                  </div>
                </div>
                <p className={styles.sightDescription}>{item.description}</p>
                <div className={styles.sightAction}>
                  <a
                    className={styles.sightButton}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Read more: ${item.title} (${item.source})`}
                  >
                    Read more <ArrowRight className={styles.readMoreIcon} />
                  </a>
                </div>
                <div className={styles.sightGlow}></div>
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
                  {videoError ? (
                    <div className={styles.videoInfo}>
                      <h3 className={styles.videoTitle}>Video not found</h3>
                      <p className={styles.videoSubtext}>
                        Place your file at <code>public/videos/brain-neural-activity.mp4</code> and refresh.
                        You can change the filename if you prefer.
                      </p>
                    </div>
                  ) : (
                    <video
                      className={styles.videoTag}
                      ref={videoRef}
                      controls
                      muted
                      autoPlay
                      loop
                      playsInline
                      preload="metadata"
                      onError={() => setVideoError(true)}
                    >
                      <source src={videoSrcPrimary} type="video/mp4" />
                      {videoSrcFallbacks.map((p, i) => (
                        <source key={i} src={p} type="video/mp4" />
                      ))}
                      Your browser does not support the video tag.
                    </video>
                  )}
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
