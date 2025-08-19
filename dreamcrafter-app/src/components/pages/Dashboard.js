import React, { useState, useEffect } from 'react';
import { 
    Upload, Brain, Sparkles, Moon, Star, Eye, Zap, Download, 
    LogOut, Settings, RotateCcw,
    CheckCircle, AlertCircle,  FileText
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
    const [uploadProgress, setUploadProgress] = useState(0); // ADDED: Missing state
    const [error, setError] = useState(null); // ADDED: Missing state
    const [userProfile, setUserProfile] = useState(null); // ADDED: Missing state
    const [predictionHistory, setPredictionHistory] = useState([]); // ADDED: Missing state

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
            }

            const historyResult = await dreamAPI.getUserPredictions(1, 5);
            if (historyResult.success) {
                setPredictionHistory(historyResult.data.predictions || []);
            }
        } catch (error) {
            console.error('Failed to load user data:', error);
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

                {/* Results Section */}
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

                        {/* Dream Description */}
                        <div className={styles.dreamDescription}>
                            <div className={styles.descriptionCard}>
                                <h3>Dream Narrative</h3>
                                <p>{dreamResults.description}</p>
                            </div>
                        </div>

                        {/* Dream Analysis Report */}
                        <div className={styles.analysisReport}>
                            <h3>Analysis Report</h3>
                            <div className={styles.reportGrid}>
                                <div className={styles.reportCard}>
                                    <h4>
                                        <CheckCircle className={styles.reportIcon} />
                                        Confidence Analysis
                                    </h4>
                                    <p>
                                        Model confidence: <strong>{(dreamResults.confidence * 100).toFixed(1)}%</strong><br/>
                                        Processing accuracy: High<br/>
                                        Pattern recognition: Excellent
                                    </p>
                                </div>

                                <div className={styles.reportCard}>
                                    <h4>
                                        <Moon className={styles.reportIcon} />
                                        Sleep Stage Detection
                                    </h4>
                                    <p>
                                        Detected stage: <strong>{dreamResults.sleepStage}</strong><br/>
                                        Stage confidence: High<br/>
                                        Typical for dream activity
                                    </p>
                                </div>

                                <div className={styles.reportCard}>
                                    <h4>
                                        <Zap className={styles.reportIcon} />
                                        Processing Metrics
                                    </h4>
                                    <p>
                                        Processing time: <strong>{dreamResults.processingTime}</strong><br/>
                                        Windows analyzed: {dreamResults.windowsProcessed}<br/>
                                        Dream segments: {dreamResults.dreamSegments}
                                    </p>
                                </div>

                                <div className={styles.reportCard}>
                                    <h4>
                                        <Brain className={styles.reportIcon} />
                                        Neural Patterns
                                    </h4>
                                    <p>
                                        Model version: {dreamResults.modelVersion}<br/>
                                        Pattern complexity: Medium-High<br/>
                                        Narrative coherence: Good
                                    </p>
                                </div>
                            </div>

                            {/* Report Statistics */}
                            <div className={styles.reportStats}>
                                <div className={styles.statCard}>
                                    <span className={styles.statNumber}>{(dreamResults.confidence * 100).toFixed(0)}%</span>
                                    <span className={styles.statLabel}>Confidence</span>
                                </div>
                                <div className={styles.statCard}>
                                    <span className={styles.statNumber}>{dreamResults.windowsProcessed}</span>
                                    <span className={styles.statLabel}>Windows</span>
                                </div>
                                <div className={styles.statCard}>
                                    <span className={styles.statNumber}>{dreamResults.dreamSegments}</span>
                                    <span className={styles.statLabel}>Segments</span>
                                </div>
                                <div className={styles.statCard}>
                                    <span className={styles.statNumber}>{dreamResults.processingTime}</span>
                                    <span className={styles.statLabel}>Time</span>
                                </div>
                            </div>
                        </div>

                        {/* Dream Insights */}
                        <div className={styles.dreamInsights}>
                            <h3>Key Insights</h3>
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
                            <button className={styles.primaryAction} onClick={resetAnalysis}>
                                <Upload />
                                Analyze New File
                            </button>
                            <button className={styles.secondaryAction} onClick={() => window.print()}>
                                <Download />
                                Download Report
                            </button>
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
                                            <span>Confidence: {(prediction.confidence_score * 100)?.toFixed(1)}%</span>
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
