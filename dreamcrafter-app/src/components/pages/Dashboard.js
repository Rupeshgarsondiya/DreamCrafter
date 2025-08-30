import React, { useState, useEffect } from 'react';
import dreamAPI from '../../services/dreamAPI';
import authService from '../../services/auth';
import styles from './Dashboard.module.css';
import DreamAnalysisModal from '../analysis/DreamAnalysisModal';
import VelvetHeader from '../layout/VelvetHeader';

const Dashboard = ({ onAuthChange, onHome }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [predictions, setPredictions] = useState([]);
  const [filteredPredictions, setFilteredPredictions] = useState([]);
  const [isFilteredView, setIsFilteredView] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filteredPage, setFilteredPage] = useState(1);
  const [filteredTotalPages, setFilteredTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const currentUser = authService.getCurrentUser();
  const username = currentUser?.username || currentUser?.first_name || currentUser?.email?.split('@')[0] || 'Dreamer';

  useEffect(() => {
    loadUserProfile();
    loadPredictions();
    loadRecommendations();
  }, []);

  const loadUserProfile = async () => {
    try {
      const response = await dreamAPI.getUserProfile();
      setUserProfile(response);
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const loadPredictions = async (page = 1) => {
    setLoading(true);
    try {
      const response = await dreamAPI.getUserPredictions(page, 10, null, startDate, endDate);
      if (response.success && response.data) {
        const predictionsData = response.data.results || response.data.predictions || [];
        const totalCount = response.data.count || response.data.pagination?.total || 0;
        if (page === 1) {
          if (isFilteredView) {
            setFilteredPredictions(predictionsData);
          } else {
            setPredictions(predictionsData);
          }
        } else {
          if (isFilteredView) {
            setFilteredPredictions(prev => [...prev, ...predictionsData]);
          } else {
            setPredictions(prev => [...prev, ...predictionsData]);
          }
        }
        if (totalCount > 0) {
          if (isFilteredView) {
            setFilteredTotalPages(Math.ceil(totalCount / 10));
          } else {
            setTotalPages(Math.ceil(totalCount / 10));
          }
        }
        if (isFilteredView) {
          setFilteredPage(page);
        } else {
          setCurrentPage(page);
        }
      }
    } catch (error) {
      console.error('Failed to load predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = async () => {
    setIsFilteredView(true);
    await loadPredictions(1);
  };

  const resetFilter = async () => {
    setStartDate('');
    setEndDate('');
    setIsFilteredView(false);
    await loadPredictions(1);
  };

  const [recommendations, setRecommendations] = useState([]);
  const [summary, setSummary] = useState(null);
  const [uniqueRecs, setUniqueRecs] = useState([]);
  const loadRecommendations = async () => {
    try {
      const res = await dreamAPI.getUserRecommendations();
      if (res.success) {
        setRecommendations(res.data.recommendations || []);
        setUniqueRecs(res.data.unique_recommendations || []);
        setSummary(res.data.summary || null);
      }
    } catch (e) {
      // ignore
    }
  };

  const handleRefresh = () => {
    loadUserProfile();
    loadPredictions(1);
  };

  const handleHome = () => {
    if (onHome) onHome();
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } finally {
      if (onAuthChange) onAuthChange(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.name.toLowerCase().endsWith('.edf')) {
      setSelectedFile(file);
    } else {
      alert('Please select a valid .edf file');
    }
  };

  const handleAnalysis = async (prediction) => {
    setSelectedPrediction(prediction);
    setShowAnalysisModal(true);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }
    setIsUploading(true);
    setUploadProgress(0);
    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await dreamAPI.uploadAndProcessEEG(selectedFile);
      clearInterval(progressInterval);
      setUploadProgress(100);
      if (result.success) {
        alert('Dream analysis completed successfully!');
        setSelectedFile(null);
        loadPredictions(1);
      } else {
        alert(`Analysis failed: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const loadMorePredictions = () => {
    if (isFilteredView) {
      if (filteredPage < filteredTotalPages) {
        loadPredictions(filteredPage + 1);
      }
    } else {
      if (currentPage < totalPages) {
        loadPredictions(currentPage + 1);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSleepStageText = (stage) => {
    const stages = {
      0: 'Wake',
      1: 'Light Sleep (N1)',
      2: 'Deep Sleep (N2)',
      3: 'Deep Sleep (N3)',
      4: 'REM Sleep'
    };
    return stages[stage] || 'Unknown';
  };


  return (
    <div className={styles.dashboard}>
      <VelvetHeader username={username} onHome={handleHome} onLogout={handleLogout} />

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📤</div>
          <div className={styles.statContent}>
            <h3>{predictions.length}</h3>
            <p>Total Uploads</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🌟</div>
          <div className={styles.statContent}>
            <h3>{predictions.filter(p => p.success).length}</h3>
            <p>Successful Analyses</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>⏱️</div>
          <div className={styles.statContent}>
            <h3>
              {predictions.length > 0
                ? `${Math.round(
                    predictions.reduce(
                      (acc, p) => acc + (p.processing_time || 0), 0
                    )
                  )}s`
                : '0s'}
            </h3>
            <p>Total Processing Time</p>
          </div>
        </div>
      </div>

      <div className={styles.uploadSection}>
        <div className={styles.uploadCard}>
          <h2>Upload EEG File</h2>
          <div className={styles.fileInputWrapper}>
            <input
              type="file"
              id="file-upload"
              accept=".edf"
              className={styles.fileInput}
              onChange={handleFileSelect}
              disabled={isUploading}
            />
            <label htmlFor="file-upload" className={styles.fileDropzone}>
              <div className={styles.fileDropContent}>
                <span>📎</span>
                <span>{selectedFile ? 'Change file (.edf)' : 'Drop or click to choose (.edf) — Upload & Analyze'}</span>
              </div>
            </label>
          </div>
          {selectedFile && (
            <div className={styles.fileInfo}>
              <p>📄 {selectedFile.name}</p>
              <p>📏 {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          )}
          {selectedFile && (
            <button
              className={`${styles.uploadButton} ${styles.ctaPrimary}`}
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload & Analyze'}
            </button>
          )}
          {isUploading && (
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Date Range Filter – positioned above Recent Dreams */}
      <div className={styles.dateFilterSection}>
        <div className={styles.dateFilter}>
          <div className={styles.dateField}>
            <label className={styles.dateLabel}>Start Date</label>
            <input
              type="date"
              className={styles.dateInput}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className={styles.dateField}>
            <label className={styles.dateLabel}>End Date</label>
            <input
              type="date"
              className={styles.dateInput}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className={styles.filterActions}>
            <button className={styles.filterButton} onClick={applyFilter}>Apply</button>
            <button className={styles.filterButton} onClick={resetFilter}>Reset</button>
          </div>
        </div>
      </div>

      <div className={styles.recentDreams}>
        <h2>Recent Dream Analyses</h2>
        {loading ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>⏳</span>
            <h3>Loading dreams...</h3>
            <p>Please wait, your velvet dreams are being fetched.</p>
          </div>
        ) : (isFilteredView ? filteredPredictions.length === 0 : predictions.length === 0) ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>💤</span>
            <h3>{isFilteredView ? 'No dreams in this date range' : 'No dream analyses yet'}</h3>
            <p>{isFilteredView ? 'Try adjusting Start/End dates' : 'Upload your first EEG file and start exploring your subconscious mind!'}</p>
          </div>
        ) : (
          <div className={styles.dreamsGrid}>
            {(isFilteredView ? filteredPredictions : predictions).map((prediction, idx) => (
              <div className={styles.dreamCard} key={idx}>
                <div className={styles.dreamHeader}>
                  <div className={styles.dreamStatus}>
                    <span
                      className={[
                        styles.statusDot,
                        prediction.success
                          ? "completed"
                          : prediction.processing_time
                          ? "processing"
                          : "failed"
                      ].map(s => styles[s]).join(' ')}
                    ></span>
                    {prediction.success
                      ? "Completed"
                      : prediction.processing_time
                      ? "Processing"
                      : "Failed"}
                  </div>
                  <div className={styles.dreamDate}>
                    {formatDate(prediction.timestamp || prediction.date || new Date())}
                  </div>
                </div>
                <div className={styles.dreamContent}>
                  <div className={styles.dreamTitle}>
                    {prediction.dream_title || "Dream #" + (idx + 1)}
                  </div>
                  <div className={styles.dreamDescription}>
                    {prediction.dream_description
                      ? prediction.dream_description.length > 120
                        ? `${prediction.dream_description.substring(0, 120)}...`
                        : prediction.dream_description
                      : 'No description available.'}
                  </div>
                  {/* Dream image thumbnail removed per request */}
                </div>
                <div className={styles.dreamMetrics}>
                  <div className={styles.metric}>
                    <span className={styles.metricLabel}>Sleep Stage</span>
                    <span className={styles.metricValue}>
                      {getSleepStageText(
                        prediction.detected_sleep_stage != null ? prediction.detected_sleep_stage : prediction.sleep_stage
                      )}
                    </span>
                  </div>
                  <div className={styles.metric}>
                    <span className={styles.metricLabel}>Confidence</span>
                    <span className={styles.confidenceScore}>
                      {prediction.confidence_score != null
                        ? (prediction.confidence_score * 100).toFixed(1) + '%'
                        : (prediction.confidence != null
                            ? (prediction.confidence * 100).toFixed(1) + '%'
                            : '--')}
                    </span>
                  </div>
                </div>
                <div className={styles.dreamActions}>
                  <button
                    className={`${styles.analysisButton} ${styles.ctaPrimary}`}
                    onClick={() => handleAnalysis(prediction)}
                  >
                    View Full Analysis
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {(!isFilteredView && currentPage < totalPages) || (isFilteredView && filteredPage < filteredTotalPages) ? (
          <div className={styles.loadMore}>
            <button className={styles.loadMoreButton} onClick={loadMorePredictions}>
              Load More
            </button>
          </div>
        ) : null}
      </div>

      {/* Frequency Recommendations - Summary */}
      {summary && (
        <div className={styles.recentDreams}>
          <h2>Frequency Recommendation</h2>
          <div className={styles.dreamsGrid}>
            <div className={styles.dreamCard}>
              <div className={styles.dreamHeader}>
                <div className={styles.dreamStatus}>Dominant: {summary.dominant} — {summary.dominant_description}</div>
                <div className={styles.dreamDate}>{summary.duration_minutes} min/day</div>
              </div>
              <div className={styles.dreamContent}>
                <div className={styles.dreamTitle}>Listen: {summary.recommend} Frequency</div>
                <div className={styles.dreamDescription}>{summary.tip}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Frequency Recommendations - Alternatives */}
      {summary && uniqueRecs.filter(r => r.dominant !== summary.dominant).length > 0 && (
        <div className={styles.recentDreams}>
          <h2>Alternative Frequencies</h2>
          <div className={styles.dreamsGrid}>
            {uniqueRecs.filter(r => r.dominant !== summary.dominant).map((rec) => (
              <div key={rec.dominant} className={styles.dreamCard}>
                <div className={styles.dreamHeader}>
                  <div className={styles.dreamStatus}>Dominant: {rec.dominant} — {rec.dominant_description}</div>
                  <div className={styles.dreamDate}>{rec.duration_minutes} min/day</div>
                </div>
                <div className={styles.dreamContent}>
                  <div className={styles.dreamTitle}>Listen: {rec.recommend} Frequency</div>
                  <div className={styles.dreamDescription}>{rec.tip}</div>
                  <div className={styles.dreamMetrics}>
                    <div className={styles.metric}>
                      <span className={styles.metricLabel}>Recommended Frequency</span>
                      <span className={styles.metricValue}>{rec.recommend}</span>
                    </div>
                    <div className={styles.metric}>
                      <span className={styles.metricLabel}>Minutes / Day</span>
                      <span className={styles.metricValue}>{rec.duration_minutes}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {showAnalysisModal && (
        <DreamAnalysisModal
          prediction={selectedPrediction}
          onClose={() => setShowAnalysisModal(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
