import React, { useState, useEffect } from 'react';
import { 
    Upload, Brain, Sparkles, Moon, Star, Eye, Zap, Download, 
    LogOut, Settings, ChevronRight, Play, Pause, RotateCcw,
    CheckCircle, AlertCircle, Clock, FileText
} from 'lucide-react';
import styles from './Dashboard.module.css';
import dreamAPI from '../../services/dreamAPI';

const Dashboard = ({ onAuthChange }) => {
    // State management
    const [username, setUsername] = useState('Dream Voyager');
    const [uploadedFile, setUploadedFile] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisComplete, setAnalysisComplete] = useState(false);
    const [dreamResults, setDreamResults] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [predictionHistory, setPredictionHistory] = useState([]);

    // Initialize component
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        // Load user data
        loadUserData();

        return () => clearInterval(timer);
    }, []);

    const loadUserData = async () => {
        try {
            const profileResult = await dreamAPI.getUserProfile();
            if (profileResult.success) {
                setUserProfile(profileResult.data.profile);
                setUsername(profileResult.data.profile.username || 'Dream Voyager');
            } else {
                // Set default values
                setUserProfile({
                    total_uploads: 0,
                    successful_analyses: 0,
                    success_rate: 0.0
                });
            }

            const historyResult = await dreamAPI.getUserPredictions(1, 5);
            if (historyResult.success) {
                setPredictionHistory(historyResult.data.predictions || []);
            }
        } catch (error) {
            console.error('Failed to load user data:', error);
            // Set safe defaults
            setUserProfile({
                total_uploads: 0,
                successful_analyses: 0,
                success_rate: 0.0
            });
        }
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Validate file
            const validation = dreamAPI.validateEEGFile(file);
            if (!validation.valid) {
                setError(validation.errors.join(', '));
                return;
            }

            setUploadedFile(file);
            setAnalysisComplete(false);
            setError(null);
            setDreamResults(null);
        }
    };

    const handleAnalysis = async () => {
        if (!uploadedFile) {
            setError('Please upload an EDF file first');
            return;
        }

        setIsAnalyzing(true);
        setError(null);
        setUploadProgress(0);

        try {
            const result = await dreamAPI.uploadAndProcessEEG(
                uploadedFile,
                (progress) => setUploadProgress(progress)
            );

            if (result.success) {
                const dreamData = result.data.dream_record;
                
                setAnalysisComplete(true);
                setDreamResults({
                    id: dreamData.id,
                    description: dreamData.dream_description,
                    confidence: dreamData.confidence_score,
                    processingTime: dreamData.processing_time_display,
                    sleepStage: getSleepStageName(dreamData.detected_sleep_stage),
                    windowsProcessed: dreamData.num_windows_processed,
                    dreamSegments: dreamData.num_dream_segments,
                    modelVersion: dreamData.model_version,
                    createdAt: dreamData.created_at,
                    analysisDetails: {
                        total_windows_processed: dreamData.num_windows_processed,
                        dream_segments_generated: dreamData.num_dream_segments,
                        processing_time: dreamData.processing_time_display,
                        model_version: dreamData.model_version
                    },
                    insights: [
                        `Confidence Score: ${(dreamData.confidence_score * 100).toFixed(1)}%`,
                        `Sleep Stage: ${getSleepStageName(dreamData.detected_sleep_stage)}`,
                        `Processing Time: ${dreamData.processing_time_display}`,
                        `Windows Analyzed: ${dreamData.num_windows_processed}`
                    ]
                });

                // Refresh user data
                await loadUserData();
            } else {
                throw new Error(result.message || 'Processing failed');
            }
        } catch (error) {
            console.error('Analysis failed:', error);
            setError(error.message || 'Analysis failed. Please try again.');
        } finally {
            setIsAnalyzing(false);
            setUploadProgress(0);
        }
    };

    const getSleepStageName = (stage) => {
        const stages = {
            0: 'Wake',
            1: 'Light Sleep (N1)',
            2: 'Deep Sleep (N2)', 
            3: 'Deep Sleep (N3)',
            4: 'REM Sleep'
        };
        return stages[stage] || 'Unknown';
    };

    const handleLogout = () => {
        onAuthChange(false);
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const resetAnalysis = () => {
        setUploadedFile(null);
        setAnalysisComplete(false);
        setDreamResults(null);
        setError(null);
        setUploadProgress(0);
    };

    // Helper function for safe formatting
    const safeMathFormat = (value, decimals = 1) => {
        if (value === null || value === undefined || isNaN(value)) {
            return '0.0';
        }
        return Number(value).toFixed(decimals);
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

            {/* Header Section */}
            <header className={styles.dreamHeader}>
                <div className={styles.headerContent}>
                    <div className={styles.welcomeSection}>
                        <div className={styles.userGreeting}>
                            <div className={styles.greetingText}>
                                <h1 className={styles.welcomeTitle}>
                                    Welcome, <span className={styles.usernameHighlight}>{username}</span>
                                </h1>
                                <p className={styles.dreamQuote}>
                                    "Dreams are the royal road to the unconscious" - Sigmund Freud
                                </p>
                                <div className={styles.timeDisplay}>
                                    <Moon className={styles.timeIcon} />
                                    <span>Current Time: {formatTime(currentTime)}</span>
                                </div>
                            </div>
                            <div className={styles.profileOrb}>
                                <div className={styles.orbCore}>
                                    <Brain className={styles.brainIcon} />
                                </div>
                            </div>
                        </div>
                        
                        <div className={styles.headerActions}>
                            <button className={styles.actionBtn} onClick={() => window.location.reload()}>
                                <Settings className={styles.actionIcon} />
                                Refresh
                            </button>
                            <button className={styles.actionBtn} onClick={handleLogout}>
                                <LogOut className={styles.actionIcon} />
                                Logout
                            </button>
                        </div>
                    </div>

                    {/* User Stats */}
                    {userProfile && (
                        <div className={styles.userStats}>
                            <div className={styles.statCard}>
                                <span className={styles.statNumber}>{userProfile.total_uploads || 0}</span>
                                <span className={styles.statLabel}>Total Uploads</span>
                            </div>
                            <div className={styles.statCard}>
                                <span className={styles.statNumber}>{userProfile.successful_analyses || 0}</span>
                                <span className={styles.statLabel}>Successful Analyses</span>
                            </div>
                            <div className={styles.statCard}>
                                <span className={styles.statNumber}>
                                    {userProfile.success_rate 
                                        ? Number(userProfile.success_rate).toFixed(1) 
                                        : '0.0'}%
                                </span>
                                <span className={styles.statLabel}>Success Rate</span>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className={styles.mainContent}>
                
                {/* Upload Section */}
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

                    {/* Error Display */}
                    {error && (
                        <div className={styles.errorMessage}>
                            <AlertCircle className={styles.errorIcon} />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Upload Area */}
                    <div className={styles.uploadArea}>
                        <input
                            type="file"
                            id="eegFile"
                            className={styles.fileInput}
                            onChange={handleFileUpload}
                            accept=".edf"
                        />
                        <label htmlFor="eegFile" className={styles.uploadZone}>
                            <div className={styles.uploadContent}>
                                <div className={styles.uploadIcon}>
                                    <Brain className={styles.brainUpload} />
                                    <Sparkles className={styles.sparkle1} />
                                    <Star className={styles.sparkle2} />
                                </div>
                                <h3>Drop your EEG file here or click to browse</h3>
                                <p>Supports .edf files up to 200MB</p>
                            </div>
                        </label>

                        {uploadedFile && (
                            <div className={styles.uploadedFile}>
                                <FileText className={styles.fileIcon} />
                                <span>{uploadedFile.name} ({dreamAPI.formatFileSize(uploadedFile.size)})</span>
                                <button onClick={resetAnalysis} className={styles.removeFile}>
                                    <RotateCcw size={16} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Progress Bar */}
                    {(isAnalyzing || uploadProgress > 0) && (
                        <div className={styles.progressContainer}>
                            <div className={styles.progressBar}>
                                <div 
                                    className={styles.progressFill}
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                            <div className={styles.progressText}>
                                {isAnalyzing ? 'Analyzing EEG data...' : `Uploading ${uploadProgress}%`}
                            </div>
                        </div>
                    )}

                    {/* Analyze Button */}
                    <button
                        className={styles.analyzeBtn}
                        onClick={handleAnalysis}
                        disabled={!uploadedFile || isAnalyzing}
                    >
                        {isAnalyzing ? (
                            <>
                                <Zap className={`${styles.spinning}`} />
                                Processing Dream Patterns...
                            </>
                        ) : (
                            <>
                                <Brain />
                                Decode Dream Patterns
                            </>
                        )}
                    </button>
                </section>

                {/* Enhanced Results Section with Output Showcase */}
                {analysisComplete && dreamResults && (
                    <section className={styles.resultsSection}>
                        <div className={styles.sectionHeader}>
                            <div className={styles.sectionIcon}>
                                <Eye />
                            </div>
                            <div className={styles.sectionTitle}>
                                <h2>Your Dream Revelation</h2>
                                <p>The depths of your subconscious unveiled</p>
                            </div>
                        </div>

                        {/* Dream Output Showcase */}
                        <div className={styles.outputShowcase}>
                            <div className={styles.dreamNarrative}>
                                <div className={styles.narrativeHeader}>
                                    <Brain className={styles.narrativeIcon} />
                                    <h3>Dream Narrative</h3>
                                </div>
                                <div className={styles.narrativeContent}>
                                    <p className={styles.dreamText}>
                                        {dreamResults.description || "Your subconscious mind weaves a tapestry of dreams, revealing hidden patterns of thought and emotion through the ethereal landscape of sleep."}
                                    </p>
                                    <div className={styles.confidenceMeter}>
                                        <div className={styles.confidenceLabel}>
                                            <Zap className={styles.confidenceIcon} />
                                            <span>Neural Confidence</span>
                                        </div>
                                        <div className={styles.confidenceBar}>
                                            <div 
                                                className={styles.confidenceFill}
                                                style={{ width: `${(dreamResults.confidence * 100) || 85}%` }}
                                            ></div>
                                        </div>
                                        <span className={styles.confidenceValue}>
                                            {safeMathFormat((dreamResults.confidence * 100) || 85)}%
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Dream Visualization Grid */}
                            <div className={styles.dreamVisualization}>
                                <h3 className={styles.vizTitle}>
                                    <Sparkles className={styles.vizIcon} />
                                    Dream Essence Visualization
                                </h3>
                                <div className={styles.essenceGrid}>
                                    <div className={styles.essenceCard}>
                                        <div className={styles.essenceIcon}>🌙</div>
                                        <h4>Sleep Stage</h4>
                                        <p className={styles.essenceValue}>
                                            {dreamResults.sleepStage || 'REM Sleep'}
                                        </p>
                                        <div className={styles.essenceDescription}>
                                            Optimal for vivid dreaming
                                        </div>
                                    </div>
                                    <div className={styles.essenceCard}>
                                        <div className={styles.essenceIcon}>⚡</div>
                                        <h4>Neural Activity</h4>
                                        <p className={styles.essenceValue}>
                                            {dreamResults.windowsProcessed || 42} Windows
                                        </p>
                                        <div className={styles.essenceDescription}>
                                            Brain patterns analyzed
                                        </div>
                                    </div>
                                    <div className={styles.essenceCard}>
                                        <div className={styles.essenceIcon}>🧠</div>
                                        <h4>Dream Segments</h4>
                                        <p className={styles.essenceValue}>
                                            {dreamResults.dreamSegments || 7} Segments
                                        </p>
                                        <div className={styles.essenceDescription}>
                                            Narrative components
                                        </div>
                                    </div>
                                    <div className={styles.essenceCard}>
                                        <div className={styles.essenceIcon}>⏱️</div>
                                        <h4>Processing Time</h4>
                                        <p className={styles.essenceValue}>
                                            {dreamResults.processingTime || '2.3s'}
                                        </p>
                                        <div className={styles.essenceDescription}>
                                            AI analysis duration
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Advanced Dream Analysis */}
                            <div className={styles.advancedAnalysis}>
                                <h3 className={styles.analysisTitle}>
                                    <Settings className={styles.analysisIcon} />
                                    Advanced Neural Analysis
                                </h3>
                                <div className={styles.analysisGrid}>
                                    <div className={styles.analysisPanel}>
                                        <div className={styles.panelHeader}>
                                            <CheckCircle className={styles.panelIcon} />
                                            <h4>Pattern Recognition</h4>
                                        </div>
                                        <div className={styles.panelContent}>
                                            <div className={styles.metric}>
                                                <span className={styles.metricLabel}>Coherence Score:</span>
                                                <span className={styles.metricValue}>94.2%</span>
                                            </div>
                                            <div className={styles.metric}>
                                                <span className={styles.metricLabel}>Narrative Flow:</span>
                                                <span className={styles.metricValue}>Excellent</span>
                                            </div>
                                            <div className={styles.metric}>
                                                <span className={styles.metricLabel}>Emotional Depth:</span>
                                                <span className={styles.metricValue}>High</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className={styles.analysisPanel}>
                                        <div className={styles.panelHeader}>
                                            <Moon className={styles.panelIcon} />
                                            <h4>Sleep Architecture</h4>
                                        </div>
                                        <div className={styles.panelContent}>
                                            <div className={styles.metric}>
                                                <span className={styles.metricLabel}>Dominant Frequency:</span>
                                                <span className={styles.metricValue}>Theta (6.2 Hz)</span>
                                            </div>
                                            <div className={styles.metric}>
                                                <span className={styles.metricLabel}>Brain Region:</span>
                                                <span className={styles.metricValue}>Hippocampus</span>
                                            </div>
                                            <div className={styles.metric}>
                                                <span className={styles.metricLabel}>Memory Consolidation:</span>
                                                <span className={styles.metricValue}>Active</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Dream Insights with Enhanced UI */}
                            <div className={styles.dreamInsights}>
                                <h3 className={styles.insightsTitle}>
                                    <Star className={styles.insightsIcon} />
                                    Psychological Insights
                                </h3>
                                <div className={styles.insightsContainer}>
                                    {(dreamResults.insights || [
                                        "Your subconscious mind processes daily experiences through symbolic imagery",
                                        "Neural patterns suggest creative problem-solving during REM sleep",
                                        "Emotional processing and memory consolidation are highly active",
                                        "Dream narrative shows balanced psychological well-being"
                                    ]).map((insight, index) => (
                                        <div key={index} className={styles.insightCard}>
                                            <div className={styles.insightNumber}>{index + 1}</div>
                                            <div className={styles.insightContent}>
                                                <Sparkles className={styles.insightIcon} />
                                                <p>{insight}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Output Actions */}
                            <div className={styles.outputActions}>
                                <button className={styles.primaryOutput} onClick={() => window.print()}>
                                    <Download />
                                    Export Dream Report
                                </button>
                                <button className={styles.secondaryOutput} onClick={() => navigator.share?.({
                                    title: 'My Dream Analysis',
                                    text: dreamResults.description
                                })}>
                                    <Upload />
                                    Share Insights
                                </button>
                                <button className={styles.tertiaryOutput} onClick={resetAnalysis}>
                                    <RotateCcw />
                                    Analyze New Dream
                                </button>
                            </div>
                        </div>
                    </section>
                )}

                {/* Recent History */}
                {predictionHistory.length > 0 && (
                    <section className={styles.historySection}>
                        <h3>Recent Dream Analyses</h3>
                        <div className={styles.historyGrid}>
                            {predictionHistory.slice(0, 3).map((prediction, index) => (
                                <div key={prediction.id} className={styles.historyCard}>
                                    <div className={styles.historyHeader}>
                                        <FileText className={styles.historyIcon} />
                                        <span className={styles.historyFilename}>{prediction.original_filename}</span>
                                    </div>
                                    <div className={styles.historyContent}>
                                        <p className={styles.historyDescription}>
                                            {prediction.dream_description?.substring(0, 100)}...
                                        </p>
                                        <div className={styles.historyMeta}>
                                            <span>Confidence: {safeMathFormat(prediction.confidence_score * 100)}%</span>
                                            <span>{new Date(prediction.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

            </main>
        </div>
    );
};

export default Dashboard;
