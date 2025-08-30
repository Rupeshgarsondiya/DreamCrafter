import React, { useState } from 'react';
import styles from './DreamAnalysisModal.module.css';

const DreamAnalysisModal = ({ prediction, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Normalize core fields and guard against missing values
  const normalized = {
    filename: prediction.original_filename || prediction.filename || prediction.dream_title || 'Dream Analysis',
    confidence:
      prediction.confidence_score ??
      prediction.confidence ??
      prediction.analysis_metadata?.confidence_score ?? null,
    sleepStage:
      prediction.detected_sleep_stage ??
      prediction.sleep_stage ?? null,
    processingTimeDisplay:
      prediction.processing_time_display ||
      (typeof prediction.processing_time === 'number' ? `${Math.round(prediction.processing_time)}s` : '—'),
    modelVersion: prediction.model_version || prediction.analysis_metadata?.model_version || 'v1',
    createdAt: prediction.created_at || prediction.timestamp || prediction.date || null,
  };

  // Extract advanced analysis data
  const advancedAnalysis = prediction.analysis_metadata?.advanced_analysis || {};
  
  const tabs = [
    { id: 'overview', label: 'Overview', icon: '🔍' },
    { id: 'psychological', label: 'Psychological', icon: '🧠' },
    { id: 'eeg', label: 'EEG Analysis', icon: '⚡' },
    { id: 'archetypes', label: 'Archetypes', icon: '👑' },
    { id: 'emotions', label: 'Emotions', icon: '💭' },
    { id: 'themes', label: 'Themes', icon: '🎭' },
    { id: 'sleep', label: 'Sleep Quality', icon: '😴' },
    { id: 'coherence', label: 'Coherence', icon: '🔗' },
    { id: 'images', label: 'Dream Images', icon: '🖼️' }
  ];

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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

  const getConfidenceColor = (confidence) => {
    if (confidence == null) return '#9CA3AF';
    if (confidence >= 0.8) return '#10B981';
    if (confidence >= 0.6) return '#F59E0B';
    if (confidence >= 0.4) return '#F97316';
    return '#EF4444';
  };

  const renderOverview = () => (
    <div className={styles.tabContent}>
      <div className={styles.overviewGrid}>
        <div className={styles.overviewCard}>
          <div className={styles.cardIcon}>🌙</div>
          <h3>Dream Description</h3>
          <p className={styles.dreamText}>
            {prediction.dream_description || "No dream description available"}
          </p>
        </div>

        <div className={styles.overviewCard}>
          <div className={styles.cardIcon}>📊</div>
          <h3>Analysis Summary</h3>
          <div className={styles.summaryMetrics}>
            <div className={styles.summaryMetric}>
              <span>Overall Score:</span>
              <span className={styles.summaryValue}>
                {advancedAnalysis.overall_analysis_score 
                  ? `${(advancedAnalysis.overall_analysis_score * 100).toFixed(1)}%`
                  : 'N/A'
                }
              </span>
            </div>
            <div className={styles.summaryMetric}>
              <span>Confidence:</span>
              <span 
                className={styles.summaryValue}
                style={{ color: getConfidenceColor(normalized.confidence) }}
              >
                {normalized.confidence != null ? `${(normalized.confidence * 100).toFixed(1)}%` : 'N/A'}
              </span>
            </div>
            <div className={styles.summaryMetric}>
              <span>Sleep Stage:</span>
              <span className={styles.summaryValue}>
                {normalized.sleepStage != null ? getSleepStageText(normalized.sleepStage) : 'Unknown'}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.overviewCard}>
          <div className={styles.cardIcon}>⚡</div>
          <h3>Processing Details</h3>
          <div className={styles.processingDetails}>
            <p><strong>File:</strong> {normalized.filename}</p>
            <p><strong>Processing Time:</strong> {normalized.processingTimeDisplay}</p>
            <p><strong>Model Version:</strong> {normalized.modelVersion}</p>
            <p><strong>Analysis Date:</strong> {formatDate(normalized.createdAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPsychological = () => (
    <div className={styles.tabContent}>
      <div className={styles.psychologicalGrid}>
        {advancedAnalysis.psychological_insights ? (
          <>
            <div className={styles.insightCard}>
              <h3>🧠 Psychological Patterns</h3>
              <div className={styles.insightContent}>
                <p><strong>Summary:</strong> {advancedAnalysis.psychological_insights.psychological_summary}</p>
                
                {advancedAnalysis.psychological_insights.stress_analysis && (
                  <div className={styles.insightSection}>
                    <h4>Stress Indicators</h4>
                    <p>Level: {advancedAnalysis.psychological_insights.stress_analysis.stress_level}</p>
                    {advancedAnalysis.psychological_insights.stress_analysis.stress_indicators.length > 0 && (
                      <p>Keywords: {advancedAnalysis.psychological_insights.stress_analysis.stress_indicators.join(', ')}</p>
                    )}
                  </div>
                )}

                {advancedAnalysis.psychological_insights.creativity_analysis && (
                  <div className={styles.insightSection}>
                    <h4>Creativity Patterns</h4>
                    <p>Level: {advancedAnalysis.psychological_insights.creativity_analysis.creativity_level}</p>
                    {advancedAnalysis.psychological_insights.creativity_analysis.creativity_indicators.length > 0 && (
                      <p>Keywords: {advancedAnalysis.psychological_insights.creativity_analysis.creativity_indicators.join(', ')}</p>
                    )}
                  </div>
                )}

                {advancedAnalysis.psychological_insights.relationship_insights && (
                  <div className={styles.insightSection}>
                    <h4>Relationship Focus</h4>
                    <p>Present: {advancedAnalysis.psychological_insights.relationship_insights.relationship_focus ? 'Yes' : 'No'}</p>
                    {advancedAnalysis.psychological_insights.relationship_insights.relationship_keywords.length > 0 && (
                      <p>Keywords: {advancedAnalysis.psychological_insights.relationship_insights.relationship_keywords.join(', ')}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className={styles.noData}>
            <p>No psychological insights available for this dream.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderEEG = () => (
    <div className={styles.tabContent}>
      <div className={styles.eegGrid}>
        {advancedAnalysis.eeg_analysis ? (
          <>
            <div className={styles.eegCard}>
              <h3>⚡ EEG Pattern Analysis</h3>
              <div className={styles.eegMetrics}>
                <div className={styles.eegMetric}>
                  <span>EEG Quality Score:</span>
                  <span className={styles.eegValue}>
                    {advancedAnalysis.eeg_analysis.eeg_quality_score 
                      ? `${(advancedAnalysis.eeg_analysis.eeg_quality_score * 100).toFixed(1)}%`
                      : 'N/A'
                    }
                  </span>
                </div>
                
                {advancedAnalysis.eeg_analysis.brain_wave_patterns && (
                  <div className={styles.eegMetric}>
                    <span>Activity Level:</span>
                    <span className={styles.eegValue}>
                      {advancedAnalysis.eeg_analysis.brain_wave_patterns.activity_level}
                    </span>
                  </div>
                )}

                {advancedAnalysis.eeg_analysis.signal_quality && (
                  <div className={styles.eegMetric}>
                    <span>Signal Quality:</span>
                    <span className={styles.eegValue}>
                      {advancedAnalysis.eeg_analysis.signal_quality.quality_level}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.eegCard}>
              <h3>📊 Frequency Analysis</h3>
              {advancedAnalysis.eeg_analysis.frequency_analysis && (
                <div className={styles.frequencyBands}>
                  <div className={styles.frequencyBand}>
                    <span>Delta (0.5-4 Hz):</span>
                    <span>{advancedAnalysis.eeg_analysis.frequency_analysis.delta_band?.toFixed(2) || 'N/A'}</span>
                  </div>
                  <div className={styles.frequencyBand}>
                    <span>Theta (4-8 Hz):</span>
                    <span>{advancedAnalysis.eeg_analysis.frequency_analysis.theta_band?.toFixed(2) || 'N/A'}</span>
                  </div>
                  <div className={styles.frequencyBand}>
                    <span>Alpha (8-13 Hz):</span>
                    <span>{advancedAnalysis.eeg_analysis.frequency_analysis.alpha_band?.toFixed(2) || 'N/A'}</span>
                  </div>
                  <div className={styles.frequencyBand}>
                    <span>Beta (13-30 Hz):</span>
                    <span>{advancedAnalysis.eeg_analysis.frequency_analysis.beta_band?.toFixed(2) || 'N/A'}</span>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className={styles.noData}>
            <p>No EEG analysis data available for this dream.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderArchetypes = () => (
    <div className={styles.tabContent}>
      <div className={styles.archetypesGrid}>
        {advancedAnalysis.archetype_analysis?.detected_archetypes ? (
          <>
            <div className={styles.archetypeCard}>
              <h3>👑 Jungian Archetypes</h3>
              <div className={styles.archetypeSummary}>
                <p><strong>Summary:</strong> {advancedAnalysis.archetype_analysis.archetype_summary}</p>
                <p><strong>Dominant:</strong> {advancedAnalysis.archetype_analysis.dominant_archetype}</p>
              </div>
              
              <div className={styles.archetypeList}>
                {Object.entries(advancedAnalysis.archetype_analysis.detected_archetypes).map(([archetype, data]) => (
                  <div key={archetype} className={styles.archetypeItem}>
                    <h4>{archetype.charAt(0).toUpperCase() + archetype.slice(1).replace('_', ' ')}</h4>
                    <p><strong>Significance:</strong> {data.significance}</p>
                    <p><strong>Patterns:</strong> {data.patterns_found.join(', ')}</p>
                    <p><strong>Meaning:</strong> {data.interpretation}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className={styles.noData}>
            <p>No archetype patterns detected in this dream.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderEmotions = () => (
    <div className={styles.tabContent}>
      <div className={styles.emotionsGrid}>
        {advancedAnalysis.emotional_analysis?.detected_emotions ? (
          <>
            <div className={styles.emotionCard}>
              <h3>💭 Emotional Analysis</h3>
              <div className={styles.emotionSummary}>
                <p><strong>Dominant Emotion:</strong> {advancedAnalysis.emotional_analysis.dominant_emotion}</p>
                <p><strong>Emotional Intensity:</strong> {advancedAnalysis.emotional_analysis.emotional_intensity}</p>
                <p><strong>Overall Mood:</strong> {advancedAnalysis.emotional_analysis.mood_analysis?.overall_mood}</p>
              </div>
              
              <div className={styles.emotionBreakdown}>
                {Object.entries(advancedAnalysis.emotional_analysis.detected_emotions).map(([emotion, data]) => (
                  <div key={emotion} className={styles.emotionItem}>
                    <h4>{emotion.charAt(0).toUpperCase() + emotion.slice(1)}</h4>
                    <p><strong>Score:</strong> {data.score}</p>
                    <p><strong>Intensity:</strong> {data.intensity}</p>
                    <p><strong>Keywords:</strong> {data.keywords_found.join(', ')}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className={styles.noData}>
            <p>No emotional patterns detected in this dream.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderThemes = () => (
    <div className={styles.tabContent}>
      <div className={styles.themesGrid}>
        {advancedAnalysis.theme_analysis?.detected_themes ? (
          <>
            <div className={styles.themeCard}>
              <h3>🎭 Dream Themes</h3>
              <div className={styles.themeSummary}>
                <p><strong>Primary Theme:</strong> {advancedAnalysis.theme_analysis.primary_theme}</p>
                <p><strong>Theme Complexity:</strong> {advancedAnalysis.theme_analysis.theme_complexity}</p>
                <p><strong>Summary:</strong> {advancedAnalysis.theme_analysis.theme_summary}</p>
              </div>
              
              <div className={styles.themeBreakdown}>
                {Object.entries(advancedAnalysis.theme_analysis.detected_themes).map(([theme, data]) => (
                  <div key={theme} className={styles.themeItem}>
                    <h4>{theme.charAt(0).toUpperCase() + theme.slice(1)}</h4>
                    <p><strong>Score:</strong> {data.score}</p>
                    <p><strong>Significance:</strong> {data.significance}</p>
                    <p><strong>Indicators:</strong> {data.indicators_found.join(', ')}</p>
                    <p><strong>Meaning:</strong> {data.interpretation}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className={styles.noData}>
            <p>No specific themes detected in this dream.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderSleep = () => (
    <div className={styles.tabContent}>
      <div className={styles.sleepGrid}>
        {advancedAnalysis.sleep_analysis ? (
          <>
            <div className={styles.sleepCard}>
              <h3>😴 Sleep Quality Analysis</h3>
              <div className={styles.sleepMetrics}>
                <div className={styles.sleepMetric}>
                  <span>Sleep Quality Score:</span>
                  <span className={styles.sleepValue}>
                    {advancedAnalysis.sleep_analysis.sleep_quality_score 
                      ? `${(advancedAnalysis.sleep_analysis.sleep_quality_score * 100).toFixed(1)}%`
                      : 'N/A'
                    }
                  </span>
                </div>
                <div className={styles.sleepMetric}>
                  <span>Quality Level:</span>
                  <span className={styles.sleepValue}>
                    {advancedAnalysis.sleep_analysis.sleep_quality_level}
                  </span>
                </div>
                <div className={styles.sleepMetric}>
                  <span>Sleep Depth:</span>
                  <span className={styles.sleepValue}>
                    {advancedAnalysis.sleep_analysis.sleep_depth 
                      ? `${(advancedAnalysis.sleep_analysis.sleep_depth * 100).toFixed(1)}%`
                      : 'N/A'
                    }
                  </span>
                </div>
                <div className={styles.sleepMetric}>
                  <span>Sleep Stability:</span>
                  <span className={styles.sleepValue}>
                    {advancedAnalysis.sleep_analysis.sleep_stability 
                      ? `${(advancedAnalysis.sleep_analysis.sleep_stability * 100).toFixed(1)}%`
                      : 'N/A'
                    }
                  </span>
                </div>
              </div>
            </div>

            {advancedAnalysis.sleep_analysis.sleep_recommendations && (
              <div className={styles.sleepCard}>
                <h3>💡 Sleep Recommendations</h3>
                <ul className={styles.recommendationsList}>
                  {advancedAnalysis.sleep_analysis.sleep_recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <div className={styles.noData}>
            <p>No sleep quality data available for this dream.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderCoherence = () => (
    <div className={styles.tabContent}>
      <div className={styles.coherenceGrid}>
        {advancedAnalysis.coherence_score ? (
          <>
            <div className={styles.coherenceCard}>
              <h3>🔗 Dream Coherence Analysis</h3>
              <div className={styles.coherenceMetrics}>
                <div className={styles.coherenceMetric}>
                  <span>Overall Coherence:</span>
                  <span className={styles.coherenceValue}>
                    {advancedAnalysis.coherence_score.overall_coherence 
                      ? `${(advancedAnalysis.coherence_score.overall_coherence * 100).toFixed(1)}%`
                      : 'N/A'
                    }
                  </span>
                </div>
                <div className={styles.coherenceMetric}>
                  <span>Coherence Level:</span>
                  <span className={styles.coherenceValue}>
                    {advancedAnalysis.coherence_score.coherence_level}
                  </span>
                </div>
                <div className={styles.coherenceMetric}>
                  <span>Text Coherence:</span>
                  <span className={styles.coherenceValue}>
                    {advancedAnalysis.coherence_score.text_coherence 
                      ? `${(advancedAnalysis.coherence_score.text_coherence * 100).toFixed(1)}%`
                      : 'N/A'
                    }
                  </span>
                </div>
                <div className={styles.coherenceMetric}>
                  <span>EEG Coherence:</span>
                  <span className={styles.coherenceValue}>
                    {advancedAnalysis.coherence_score.eeg_coherence 
                      ? `${(advancedAnalysis.coherence_score.eeg_coherence * 100).toFixed(1)}%`
                      : 'N/A'
                    }
                  </span>
                </div>
                <div className={styles.coherenceMetric}>
                  <span>Narrative Flow:</span>
                  <span className={styles.coherenceValue}>
                    {advancedAnalysis.coherence_score.narrative_flow 
                      ? `${(advancedAnalysis.coherence_score.narrative_flow * 100).toFixed(1)}%`
                      : 'N/A'
                    }
                  </span>
                </div>
              </div>
              
              {advancedAnalysis.coherence_score.coherence_explanation && (
                <div className={styles.coherenceExplanation}>
                  <h4>Explanation:</h4>
                  <p>{advancedAnalysis.coherence_score.coherence_explanation}</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className={styles.noData}>
            <p>No coherence analysis data available for this dream.</p>
          </div>
        )}
      </div>
    </div>
  );

  // Dream Images
  const [images, setImages] = React.useState([]);
  const [imgLoading, setImgLoading] = React.useState(false);
  const [imgError, setImgError] = React.useState(null);

  const fetchImages = async () => {
    try {
      setImgError(null);
      setImgLoading(true);
      const id = prediction.id;
      const api = (await import('../../services/dreamAPI')).default;
      const res = await api.listDreamImages(id);
      if (res.success) setImages(res.data.images || []);
    } catch (e) {
      setImgError('Failed to load images');
    } finally {
      setImgLoading(false);
    }
  };

  React.useEffect(() => {
    if (activeTab === 'images') {
      fetchImages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleGenerate = async () => {
    try {
      setImgError(null);
      setImgLoading(true);
      const id = prediction.id;
      const api = (await import('../../services/dreamAPI')).default;
      const res = await api.generateDreamImage(id);
      if (res.success) {
        await fetchImages();
      } else {
        setImgError(res.error?.error || 'Generation failed');
      }
    } catch (e) {
      setImgError('Generation failed');
    } finally {
      setImgLoading(false);
    }
  };

  const renderImages = () => (
    <div className={styles.tabContent}>
      <div className={styles.themesGrid}>
        <div className={styles.themeCard}>
          <h3>🖼️ Dream Images</h3>
          <p className={styles.emotionSummary}>
            Generate a surreal artwork from your dream description. Only dream text is used.
          </p>
          <div style={{display:'flex', gap:12, marginBottom:16}}>
            <button className={styles.shareButton} onClick={handleGenerate} disabled={imgLoading}>
              {imgLoading ? 'Generating…' : 'Generate / Regenerate'}
            </button>
          </div>
          {imgError && (<div className={styles.noData}><p>{imgError}</p></div>)}
          <div className={styles.archetypeList}>
            {images.length === 0 && !imgLoading && (
              <div className={styles.noData}><p>No images yet. Click Generate.</p></div>
            )}
            {images.map((im) => (
              <div key={im.id} className={styles.archetypeItem}>
                <div style={{display:'flex', gap:12, alignItems:'center', flexWrap:'wrap'}}>
                  <img src={im.image_url || ''} alt="Dream" style={{width:'100%', maxWidth:320, borderRadius:12, border:'2px solid rgba(210,105,30,0.25)'}} onError={(e)=>{e.currentTarget.style.display='none';}} />
                  <div style={{display:'flex', gap:8}}>
                    {im.image_url && (
                      <a href={im.image_url} download className={styles.exportButton}>Download</a>
                    )}
                  </div>
                </div>
                <p style={{marginTop:8, color:'#8B4513'}}>Model: {im.model_used} • {new Date(im.created_at).toLocaleString()}</p>
                <div style={{color:'rgba(139,69,19,0.8)'}}>File: {im.image}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'psychological':
        return renderPsychological();
      case 'eeg':
        return renderEEG();
      case 'archetypes':
        return renderArchetypes();
      case 'emotions':
        return renderEmotions();
      case 'themes':
        return renderThemes();
      case 'sleep':
        return renderSleep();
      case 'coherence':
        return renderCoherence();
      case 'images':
        return renderImages();
      default:
        return renderOverview();
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label={`Dream Analysis: ${normalized.filename}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>🧠 Dream Analysis: {normalized.filename}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.modalTabs} role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.tabButton} ${activeTab === tab.id ? styles.activeTab : ''}`}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
            >
              <span className={styles.tabIcon}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className={styles.modalContent} id={`panel-${activeTab}`} role="tabpanel">
          {renderTabContent()}
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.exportButton}>
            📄 Export Analysis
          </button>
          <button className={styles.shareButton}>
            🔗 Share Insights
          </button>
        </div>
      </div>
    </div>
  );
};

export default DreamAnalysisModal;
