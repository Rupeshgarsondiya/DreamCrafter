import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  Brain, 
  Sparkles, 
  Moon, 
  Star, 
  Eye, 
  Zap, 
  Download,
  LogOut,
  Settings,
  ChevronRight,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import styles from './Dashboard.module.css';

const Dashboard = ({ onAuthChange }) => {
  const [username, setUsername] = useState('Dream Voyager');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [dreamResults, setDreamResults] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
      setAnalysisComplete(false);
    }
  };

  const handleAnalysis = () => {
    if (!uploadedFile) return;
    
    setIsAnalyzing(true);
    // Simulate analysis process
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisComplete(true);
      setDreamResults({
        description: "Your dreams reveal a profound journey through crystalline underwater realms, where ancient wisdom whispers through coral formations and ethereal light dances through deep ocean currents. The subconscious mind weaves tales of transformation and spiritual awakening.",
        images: [
          { id: 1, title: "Cosmic Ocean Dreams", emoji: "🌊✨" },
          { id: 2, title: "Crystal Cave Visions", emoji: "💎🏔️" },
          { id: 3, title: "Ethereal Forest Paths", emoji: "🌲🌙" }
        ],
        insights: [
          "Deep emotional processing detected",
          "Creative inspiration pathways active",
          "Spiritual connectivity enhanced"
        ]
      });
    }, 3000);
  };

  const handleLogout = () => {
    onAuthChange(false);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={styles.dashboard}>
      {/* Velvet Background Effects */}
      <div className={styles.velvetOverlay}>
        <div className={styles.floatingOrb1}></div>
        <div className={styles.floatingOrb2}></div>
        <div className={styles.floatingOrb3}></div>
        <div className={styles.shimmerEffect}></div>
      </div>

      {/* Unique Header Section */}
      <header className={styles.dreamHeader}>
        <div className={styles.headerContent}>
          <div className={styles.welcomeSection}>
            <div className={styles.userGreeting}>
              <div className={styles.greetingText}>
                <h1 className={styles.welcomeTitle}>
                  Welcome back, <span className={styles.usernameHighlight}>{username}</span>
                </h1>
                <p className={styles.dreamQuote}>
                  "Step into the velvet realm where consciousness meets infinity"
                </p>
                <div className={styles.timeDisplay}>
                  <Moon className={styles.timeIcon} />
                  <span>Dream Session • {formatTime(currentTime)}</span>
                </div>
              </div>
              <div className={styles.profileOrb}>
                <div className={styles.orbCore}>
                  <Brain className={styles.brainIcon} />
                </div>
                <div className={styles.orbRings}>
                  <div className={styles.ring1}></div>
                  <div className={styles.ring2}></div>
                </div>
              </div>
            </div>
            
            <div className={styles.headerActions}>
              <button className={styles.actionBtn}>
                <Settings className={styles.actionIcon} />
                <span>Dream Settings</span>
              </button>
              <button className={styles.actionBtn} onClick={handleLogout}>
                <LogOut className={styles.actionIcon} />
                <span>Exit Realm</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className={styles.mainContent}>
        {/* EEG Upload Section */}
        <section className={styles.uploadSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIcon}>
              <Upload />
            </div>
            <div className={styles.sectionTitle}>
              <h2>Neural Data Portal</h2>
              <p>Upload your EEG data to unlock the mysteries of your dreams</p>
            </div>
          </div>

          <div className={styles.uploadArea}>
            <input
              type="file"
              id="eegUpload"
              className={styles.fileInput}
              accept=".edf,.csv,.txt"
              onChange={handleFileUpload}
            />
            <label htmlFor="eegUpload" className={styles.uploadZone}>
              <div className={styles.uploadContent}>
                <div className={styles.uploadIcon}>
                  <Brain className={styles.brainUpload} />
                  <Sparkles className={styles.sparkle1} />
                  <Sparkles className={styles.sparkle2} />
                </div>
                <h3>Drop your EEG files here</h3>
                <p>or click to browse • Supports .EDF, .CSV, .TXT</p>
                {uploadedFile && (
                  <div className={styles.uploadedFile}>
                    <Zap className={styles.fileIcon} />
                    <span>{uploadedFile.name}</span>
                  </div>
                )}
              </div>
            </label>
          </div>

          {uploadedFile && (
            <button 
              className={styles.analyzeBtn}
              onClick={handleAnalysis}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <RotateCcw className={styles.spinning} />
                  <span>Analyzing Dreams...</span>
                </>
              ) : (
                <>
                  <Eye />
                  <span>Begin Dream Analysis</span>
                  <ChevronRight />
                </>
              )}
            </button>
          )}
        </section>

        {/* Results Section */}
        {analysisComplete && dreamResults && (
          <section className={styles.resultsSection}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIcon}>
                <Star />
              </div>
              <div className={styles.sectionTitle}>
                <h2>Your Dream Revelation</h2>
                <p>The depths of your subconscious unveiled</p>
              </div>
            </div>

            {/* Dream Description */}
            <div className={styles.dreamDescription}>
              <div className={styles.descriptionCard}>
                <h3>Dream Narrative</h3>
                <p>{dreamResults.description}</p>
              </div>
            </div>

            {/* Dream Images */}
            <div className={styles.dreamImages}>
              <h3>Visual Manifestations</h3>
              <div className={styles.imageGrid}>
                {dreamResults.images.map((image, index) => (
                  <div key={image.id} className={styles.dreamImage}>
                    <div className={styles.imageContent}>
                      <span className={styles.imageEmoji}>{image.emoji}</span>
                      <h4>{image.title}</h4>
                    </div>
                    <div className={styles.imageOverlay}>
                      <Play className={styles.playIcon} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dream Insights */}
            <div className={styles.dreamInsights}>
              <h3>Consciousness Insights</h3>
              <div className={styles.insightsList}>
                {dreamResults.insights.map((insight, index) => (
                  <div key={index} className={styles.insightItem}>
                    <Sparkles className={styles.insightIcon} />
                    <span>{insight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className={styles.resultActions}>
              <button className={styles.primaryAction}>
                <Download />
                <span>Download Full Report</span>
              </button>
              <button className={styles.secondaryAction}>
                <Brain />
                <span>Deep Dive Analysis</span>
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
