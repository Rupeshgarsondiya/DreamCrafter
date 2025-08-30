"""
Advanced Dream Analysis System
Provides real confidence scores, psychological insights, and dream essence visualization
"""

import numpy as np
import torch
import json
import logging
from typing import Dict, List, Tuple, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re

logger = logging.getLogger(__name__)

class AdvancedDreamAnalyzer:
    """Advanced dream analysis with psychological insights and real confidence scoring"""
    
    def __init__(self):
        self.emotion_keywords = {
            'fear': ['scared', 'afraid', 'terrified', 'panic', 'anxiety', 'nightmare'],
            'joy': ['happy', 'excited', 'joyful', 'elated', 'cheerful', 'blissful'],
            'sadness': ['sad', 'depressed', 'melancholy', 'grief', 'sorrow', 'lonely'],
            'anger': ['angry', 'furious', 'rage', 'hostile', 'aggressive', 'irritated'],
            'peace': ['calm', 'peaceful', 'serene', 'tranquil', 'relaxed', 'content'],
            'surprise': ['shocked', 'amazed', 'astonished', 'stunned', 'bewildered'],
            'disgust': ['disgusted', 'repulsed', 'revolted', 'nauseated', 'appalled'],
            'trust': ['trusting', 'confident', 'secure', 'assured', 'faithful']
        }
        
        self.archetype_patterns = {
            'hero': ['saving', 'rescuing', 'fighting', 'protecting', 'leading'],
            'shadow': ['dark', 'evil', 'monster', 'demon', 'villain', 'danger'],
            'anima': ['beautiful', 'feminine', 'nurturing', 'mysterious', 'seductive'],
            'animus': ['strong', 'masculine', 'protective', 'authoritative', 'brave'],
            'wise_old_man': ['sage', 'teacher', 'guide', 'wizard', 'mentor'],
            'child': ['innocent', 'playful', 'curious', 'vulnerable', 'pure'],
            'mother': ['nurturing', 'caring', 'comforting', 'feeding', 'protecting'],
            'father': ['authoritative', 'disciplining', 'providing', 'guiding']
        }
        
        self.dream_themes = {
            'flying': ['freedom', 'transcendence', 'escape', 'power', 'control'],
            'falling': ['loss of control', 'anxiety', 'failure', 'surrender'],
            'chase': ['avoidance', 'conflict', 'pressure', 'running from problems'],
            'water': ['emotions', 'unconscious', 'cleansing', 'depth', 'flow'],
            'house': ['self', 'mind', 'shelter', 'security', 'family'],
            'animals': ['instincts', 'primal urges', 'natural behavior', 'wildness'],
            'death': ['transformation', 'endings', 'change', 'rebirth', 'letting go'],
            'naked': ['vulnerability', 'truth', 'exposure', 'authenticity']
        }
        
        self.psychological_insights = {
            'stress': ['pressure', 'overwhelm', 'deadline', 'responsibility'],
            'creativity': ['art', 'creation', 'imagination', 'innovation', 'expression'],
            'relationships': ['family', 'friend', 'partner', 'love', 'connection'],
            'work': ['office', 'job', 'career', 'achievement', 'success'],
            'health': ['body', 'illness', 'healing', 'vitality', 'wellness'],
            'spirituality': ['god', 'divine', 'sacred', 'prayer', 'meditation'],
            'memory': ['past', 'childhood', 'nostalgia', 'remembrance', 'history'],
            'future': ['planning', 'goals', 'aspirations', 'dreams', 'ambition']
        }

    def analyze_dream_comprehensive(self, dream_text: str, eeg_features: np.ndarray, 
                                  model_output: torch.Tensor, vocab_data: Dict) -> Dict:
        """Comprehensive dream analysis with real confidence scores and insights"""
        
        try:
            # 1. Real Confidence Scoring
            confidence_analysis = self._calculate_real_confidence(model_output, vocab_data)
            
            # 2. Dream Essence Analysis
            essence_analysis = self._analyze_dream_essence(dream_text)
            
            # 3. Psychological Insights
            psychological_analysis = self._analyze_psychological_aspects(dream_text)
            
            # 4. EEG Pattern Analysis
            eeg_analysis = self._analyze_eeg_patterns(eeg_features)
            
            # 5. Dream Archetype Detection
            archetype_analysis = self._detect_archetypes(dream_text)
            
            # 6. Emotional State Analysis
            emotional_analysis = self._analyze_emotional_state(dream_text)
            
            # 7. Dream Theme Classification
            theme_analysis = self._classify_dream_themes(dream_text)
            
            # 8. Cognitive Load Assessment
            cognitive_analysis = self._assess_cognitive_load(eeg_features)
            
            # 9. Sleep Quality Indicators
            sleep_analysis = self._assess_sleep_quality(eeg_features)
            
            # 10. Dream Coherence Score
            coherence_score = self._calculate_dream_coherence(dream_text, eeg_features)
            
            return {
                'success': True,
                'confidence_analysis': confidence_analysis,
                'essence_analysis': essence_analysis,
                'psychological_insights': psychological_analysis,
                'eeg_analysis': eeg_analysis,
                'archetype_analysis': archetype_analysis,
                'emotional_analysis': emotional_analysis,
                'theme_analysis': theme_analysis,
                'cognitive_analysis': cognitive_analysis,
                'sleep_analysis': sleep_analysis,
                'coherence_score': coherence_score,
                'overall_analysis_score': self._calculate_overall_score(
                    confidence_analysis, coherence_score, eeg_analysis
                )
            }
            
        except Exception as e:
            logger.error(f"Dream analysis failed: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'fallback_analysis': self._generate_fallback_analysis(dream_text)
            }

    def _calculate_real_confidence(self, model_output: torch.Tensor, vocab_data: Dict) -> Dict:
        """Calculate real confidence scores from model output"""
        
        try:
            if torch.is_tensor(model_output):
                # Get probability distribution
                if model_output.dim() == 3:  # (batch, seq, vocab)
                    probs = torch.softmax(model_output, dim=-1)
                    
                    # Calculate confidence for each token
                    max_probs, _ = torch.max(probs, dim=-1)
                    avg_confidence = max_probs.mean().item()
                    
                    # Calculate entropy (lower = more confident)
                    entropy = -torch.sum(probs * torch.log(probs + 1e-8), dim=-1).mean().item()
                    
                    # Normalize entropy to confidence (0-1)
                    normalized_entropy = 1.0 / (1.0 + entropy)
                    
                    # Real confidence combines both
                    real_confidence = (avg_confidence + normalized_entropy) / 2
                    
                    return {
                        'token_confidence': avg_confidence,
                        'entropy_based_confidence': normalized_entropy,
                        'real_confidence': real_confidence,
                        'confidence_explanation': self._explain_confidence(real_confidence),
                        'reliability_score': self._calculate_reliability_score(real_confidence, entropy)
                    }
                else:
                    # Fallback for other output formats
                    return {
                        'real_confidence': 0.5,
                        'confidence_explanation': 'Limited confidence due to output format',
                        'reliability_score': 'medium'
                    }
            else:
                return {
                    'real_confidence': 0.3,
                    'confidence_explanation': 'Low confidence - model output not available',
                    'reliability_score': 'low'
                }
                
        except Exception as e:
            logger.error(f"Confidence calculation failed: {str(e)}")
            return {
                'real_confidence': 0.2,
                'confidence_explanation': 'Error in confidence calculation',
                'reliability_score': 'low'
            }

    def _analyze_dream_essence(self, dream_text: str) -> Dict:
        """Extract the core essence and meaning of the dream"""
        
        try:
            # Clean and preprocess text
            clean_text = re.sub(r'[^\w\s]', '', dream_text.lower())
            words = clean_text.split()
            
            # Extract key concepts
            key_concepts = self._extract_key_concepts(words)
            
            # Identify central themes
            central_themes = self._identify_central_themes(words)
            
            # Analyze narrative structure
            narrative_structure = self._analyze_narrative_structure(dream_text)
            
            # Extract symbolic elements
            symbolic_elements = self._extract_symbolic_elements(dream_text)
            
            return {
                'key_concepts': key_concepts,
                'central_themes': central_themes,
                'narrative_structure': narrative_structure,
                'symbolic_elements': symbolic_elements,
                'essence_summary': self._generate_essence_summary(key_concepts, central_themes)
            }
            
        except Exception as e:
            logger.error(f"Essence analysis failed: {str(e)}")
            return {'error': str(e)}

    def _analyze_psychological_aspects(self, dream_text: str) -> Dict:
        """Analyze psychological aspects and subconscious patterns"""
        
        try:
            # Stress and anxiety indicators
            stress_indicators = self._detect_stress_patterns(dream_text)
            
            # Creativity and imagination
            creativity_indicators = self._detect_creativity_patterns(dream_text)
            
            # Relationship dynamics
            relationship_insights = self._analyze_relationship_patterns(dream_text)
            
            # Personal growth indicators
            growth_indicators = self._detect_growth_patterns(dream_text)
            
            # Unconscious conflicts
            conflict_analysis = self._analyze_unconscious_conflicts(dream_text)
            
            return {
                'stress_analysis': stress_indicators,
                'creativity_analysis': creativity_indicators,
                'relationship_insights': relationship_insights,
                'growth_indicators': growth_indicators,
                'conflict_analysis': conflict_analysis,
                'psychological_summary': self._generate_psychological_summary(
                    stress_indicators, creativity_indicators, relationship_insights
                )
            }
            
        except Exception as e:
            logger.error(f"Psychological analysis failed: {str(e)}")
            return {'error': str(e)}

    def _analyze_eeg_patterns(self, eeg_features: np.ndarray) -> Dict:
        """Analyze EEG patterns for dream quality indicators"""
        
        try:
            # Calculate power spectral density
            power_spectrum = self._calculate_power_spectrum(eeg_features)
            
            # Analyze frequency bands
            frequency_analysis = self._analyze_frequency_bands(power_spectrum)
            
            # Detect brain wave patterns
            brain_wave_patterns = self._detect_brain_wave_patterns(eeg_features)
            
            # Calculate coherence between channels
            channel_coherence = self._calculate_channel_coherence(eeg_features)
            
            # Assess signal quality
            signal_quality = self._assess_signal_quality(eeg_features)
            
            return {
                'power_spectrum': power_spectrum,
                'frequency_analysis': frequency_analysis,
                'brain_wave_patterns': brain_wave_patterns,
                'channel_coherence': channel_coherence,
                'signal_quality': signal_quality,
                'eeg_quality_score': self._calculate_eeg_quality_score(
                    signal_quality, channel_coherence
                )
            }
            
        except Exception as e:
            logger.error(f"EEG analysis failed: {str(e)}")
            return {'error': str(e)}

    def _detect_archetypes(self, dream_text: str) -> Dict:
        """Detect Jungian archetypes in the dream"""
        
        try:
            detected_archetypes = {}
            
            for archetype, patterns in self.archetype_patterns.items():
                matches = []
                for pattern in patterns:
                    if pattern.lower() in dream_text.lower():
                        matches.append(pattern)
                
                if matches:
                    detected_archetypes[archetype] = {
                        'patterns_found': matches,
                        'significance': self._assess_archetype_significance(archetype, len(matches)),
                        'interpretation': self._get_archetype_interpretation(archetype)
                    }
            
            return {
                'detected_archetypes': detected_archetypes,
                'archetype_count': len(detected_archetypes),
                'dominant_archetype': self._find_dominant_archetype(detected_archetypes),
                'archetype_summary': self._generate_archetype_summary(detected_archetypes)
            }
            
        except Exception as e:
            logger.error(f"Archetype detection failed: {str(e)}")
            return {'error': str(e)}

    def _analyze_emotional_state(self, dream_text: str) -> Dict:
        """Analyze emotional state and mood from dream content"""
        
        try:
            emotional_scores = {}
            detected_emotions = {}
            
            for emotion, keywords in self.emotion_keywords.items():
                score = 0
                found_keywords = []
                
                for keyword in keywords:
                    if keyword.lower() in dream_text.lower():
                        score += 1
                        found_keywords.append(keyword)
                
                if score > 0:
                    emotional_scores[emotion] = score
                    detected_emotions[emotion] = {
                        'score': score,
                        'keywords_found': found_keywords,
                        'intensity': self._assess_emotion_intensity(score)
                    }
            
            # Calculate dominant emotion
            dominant_emotion = max(emotional_scores.items(), key=lambda x: x[1])[0] if emotional_scores else 'neutral'
            
            return {
                'emotional_scores': emotional_scores,
                'detected_emotions': detected_emotions,
                'dominant_emotion': dominant_emotion,
                'emotional_intensity': self._calculate_emotional_intensity(emotional_scores),
                'mood_analysis': self._analyze_mood_patterns(dream_text),
                'emotional_summary': self._generate_emotional_summary(detected_emotions, dominant_emotion)
            }
            
        except Exception as e:
            logger.error(f"Emotional analysis failed: {str(e)}")
            return {'error': str(e)}

    def _classify_dream_themes(self, dream_text: str) -> Dict:
        """Classify dream themes and categories"""
        
        try:
            theme_scores = {}
            detected_themes = {}
            
            for theme, indicators in self.dream_themes.items():
                score = 0
                found_indicators = []
                
                for indicator in indicators:
                    if indicator.lower() in dream_text.lower():
                        score += 1
                        found_indicators.append(indicator)
                
                if score > 0:
                    theme_scores[theme] = score
                    detected_themes[theme] = {
                        'score': score,
                        'indicators_found': found_indicators,
                        'significance': self._assess_theme_significance(score),
                        'interpretation': self._get_theme_interpretation(theme)
                    }
            
            return {
                'theme_scores': theme_scores,
                'detected_themes': detected_themes,
                'primary_theme': max(theme_scores.items(), key=lambda x: x[1])[0] if theme_scores else 'general',
                'theme_complexity': self._assess_theme_complexity(detected_themes),
                'theme_summary': self._generate_theme_summary(detected_themes)
            }
            
        except Exception as e:
            logger.error(f"Theme classification failed: {str(e)}")
            return {'error': str(e)}

    def _assess_cognitive_load(self, eeg_features: np.ndarray) -> Dict:
        """Assess cognitive load and mental activity from EEG"""
        
        try:
            # Calculate variance (higher variance = more cognitive activity)
            variance = np.var(eeg_features)
            
            # Calculate entropy (higher entropy = more complex brain activity)
            entropy = self._calculate_entropy(eeg_features)
            
            # Analyze frequency distribution
            freq_distribution = self._analyze_frequency_distribution(eeg_features)
            
            # Assess mental workload
            mental_workload = self._assess_mental_workload(variance, entropy)
            
            return {
                'cognitive_variance': variance,
                'cognitive_entropy': entropy,
                'frequency_distribution': freq_distribution,
                'mental_workload': mental_workload,
                'cognitive_load_score': self._calculate_cognitive_load_score(variance, entropy),
                'mental_activity_level': self._classify_mental_activity(mental_workload)
            }
            
        except Exception as e:
            logger.error(f"Cognitive load assessment failed: {str(e)}")
            return {'error': str(e)}

    def _assess_sleep_quality(self, eeg_features: np.ndarray) -> Dict:
        """Assess sleep quality indicators from EEG patterns"""
        
        try:
            # Calculate sleep depth indicators
            sleep_depth = self._calculate_sleep_depth(eeg_features)
            
            # Analyze sleep stage characteristics
            sleep_stage_characteristics = self._analyze_sleep_stage_characteristics(eeg_features)
            
            # Assess sleep stability
            sleep_stability = self._assess_sleep_stability(eeg_features)
            
            # Calculate sleep quality score
            sleep_quality_score = self._calculate_sleep_quality_score(
                sleep_depth, sleep_stability
            )
            
            return {
                'sleep_depth': sleep_depth,
                'sleep_stage_characteristics': sleep_stage_characteristics,
                'sleep_stability': sleep_stability,
                'sleep_quality_score': sleep_quality_score,
                'sleep_quality_level': self._classify_sleep_quality(sleep_quality_score),
                'sleep_recommendations': self._generate_sleep_recommendations(sleep_quality_score)
            }
            
        except Exception as e:
            logger.error(f"Sleep quality assessment failed: {str(e)}")
            return {'error': str(e)}

    def _calculate_dream_coherence(self, dream_text: str, eeg_features: np.ndarray) -> Dict:
        """Calculate dream coherence and logical flow"""
        
        try:
            # Text coherence
            text_coherence = self._assess_text_coherence(dream_text)
            
            # EEG coherence
            eeg_coherence = self._calculate_eeg_coherence(eeg_features)
            
            # Narrative flow
            narrative_flow = self._assess_narrative_flow(dream_text)
            
            # Overall coherence score
            overall_coherence = (text_coherence + eeg_coherence + narrative_flow) / 3
            
            return {
                'text_coherence': text_coherence,
                'eeg_coherence': eeg_coherence,
                'narrative_flow': narrative_flow,
                'overall_coherence': overall_coherence,
                'coherence_level': self._classify_coherence_level(overall_coherence),
                'coherence_explanation': self._explain_coherence(overall_coherence)
            }
            
        except Exception as e:
            logger.error(f"Coherence calculation failed: {str(e)}")
            return {'error': str(e)}

    # Helper methods for calculations and assessments
    def _calculate_power_spectrum(self, eeg_features: np.ndarray) -> np.ndarray:
        """Calculate power spectral density of EEG data"""
        try:
            # Simple FFT-based power spectrum
            fft_result = np.fft.fft(eeg_features, axis=1)
            power_spectrum = np.abs(fft_result) ** 2
            return power_spectrum
        except:
            return np.zeros_like(eeg_features)

    def _calculate_entropy(self, data: np.ndarray) -> float:
        """Calculate Shannon entropy of the data"""
        try:
            # Normalize data to probability distribution
            hist, _ = np.histogram(data.flatten(), bins=50, density=True)
            hist = hist[hist > 0]  # Remove zero probabilities
            return -np.sum(hist * np.log2(hist))
        except:
            return 0.0

    def _explain_confidence(self, confidence: float) -> str:
        """Explain what the confidence score means"""
        if confidence >= 0.8:
            return "High confidence - Model is very certain about this interpretation"
        elif confidence >= 0.6:
            return "Medium-high confidence - Model is reasonably certain"
        elif confidence >= 0.4:
            return "Medium confidence - Model has moderate certainty"
        elif confidence >= 0.2:
            return "Low confidence - Model is uncertain about this interpretation"
        else:
            return "Very low confidence - Model has little certainty"

    def _generate_fallback_analysis(self, dream_text: str) -> Dict:
        """Generate fallback analysis when main analysis fails"""
        return {
            'basic_analysis': {
                'text_length': len(dream_text),
                'word_count': len(dream_text.split()),
                'basic_themes': ['general', 'abstract'],
                'fallback_reason': 'Main analysis failed, using basic metrics'
            }
        }

    def _calculate_overall_score(self, confidence_analysis: Dict, 
                               coherence_score: Dict, eeg_analysis: Dict) -> float:
        """Calculate overall analysis quality score"""
        try:
            confidence = confidence_analysis.get('real_confidence', 0.5)
            coherence = coherence_score.get('overall_coherence', 0.5)
            eeg_quality = eeg_analysis.get('eeg_quality_score', 0.5)
            
            # Weighted average
            overall_score = (confidence * 0.4 + coherence * 0.3 + eeg_quality * 0.3)
            return min(1.0, max(0.0, overall_score))
        except:
            return 0.5

    # Helper methods for analysis components
    def _extract_key_concepts(self, words: List[str]) -> List[str]:
        """Extract key concepts from words"""
        try:
            # Simple keyword extraction
            key_words = [word for word in words if len(word) > 3]
            return key_words[:10]  # Return top 10
        except:
            return []

    def _identify_central_themes(self, words: List[str]) -> List[str]:
        """Identify central themes from words"""
        try:
            # Simple theme identification
            themes = []
            if any(word in ['flying', 'falling', 'running'] for word in words):
                themes.append('movement')
            if any(word in ['house', 'room', 'building'] for word in words):
                themes.append('location')
            if any(word in ['water', 'river', 'ocean'] for word in words):
                themes.append('nature')
            return themes
        except:
            return []

    def _analyze_narrative_structure(self, dream_text: str) -> Dict:
        """Analyze narrative structure of dream"""
        try:
            sentences = dream_text.split('.')
            return {
                'sentence_count': len(sentences),
                'avg_sentence_length': len(dream_text) / max(len(sentences), 1),
                'narrative_complexity': 'simple' if len(sentences) < 3 else 'complex'
            }
        except:
            return {'error': 'Analysis failed'}

    def _extract_symbolic_elements(self, dream_text: str) -> List[str]:
        """Extract symbolic elements from dream"""
        try:
            symbols = []
            if 'flying' in dream_text.lower():
                symbols.append('freedom')
            if 'falling' in dream_text.lower():
                symbols.append('loss of control')
            if 'water' in dream_text.lower():
                symbols.append('emotions')
            return symbols
        except:
            return []

    def _generate_essence_summary(self, key_concepts: List[str], central_themes: List[str]) -> str:
        """Generate essence summary"""
        try:
            if key_concepts and central_themes:
                return f"Dream focuses on {', '.join(central_themes)} with key concepts: {', '.join(key_concepts[:3])}"
            else:
                return "Dream essence analysis incomplete"
        except:
            return "Essence summary unavailable"

    def _detect_stress_patterns(self, dream_text: str) -> Dict:
        """Detect stress patterns in dream"""
        try:
            stress_keywords = ['scared', 'afraid', 'anxiety', 'pressure', 'deadline']
            stress_count = sum(1 for word in stress_keywords if word in dream_text.lower())
            return {
                'stress_level': stress_count,
                'stress_indicators': [word for word in stress_keywords if word in dream_text.lower()]
            }
        except:
            return {'stress_level': 0, 'stress_indicators': []}

    def _detect_creativity_patterns(self, dream_text: str) -> Dict:
        """Detect creativity patterns in dream"""
        try:
            creativity_keywords = ['beautiful', 'colorful', 'imagination', 'create', 'art']
            creativity_count = sum(1 for word in creativity_keywords if word in dream_text.lower())
            return {
                'creativity_level': creativity_count,
                'creativity_indicators': [word for word in creativity_keywords if word in dream_text.lower()]
            }
        except:
            return {'creativity_level': 0, 'creativity_indicators': []}

    def _analyze_relationship_patterns(self, dream_text: str) -> Dict:
        """Analyze relationship patterns in dream"""
        try:
            relationship_keywords = ['family', 'friend', 'partner', 'love', 'connection']
            relationship_count = sum(1 for word in relationship_keywords if word in dream_text.lower())
            return {
                'relationship_focus': relationship_count > 0,
                'relationship_keywords': [word for word in relationship_keywords if word in dream_text.lower()]
            }
        except:
            return {'relationship_focus': False, 'relationship_keywords': []}

    def _detect_growth_patterns(self, dream_text: str) -> Dict:
        """Detect personal growth patterns in dream"""
        try:
            growth_keywords = ['learning', 'growing', 'changing', 'developing', 'progress']
            growth_count = sum(1 for word in growth_keywords if word in dream_text.lower())
            return {
                'growth_present': growth_count > 0,
                'growth_indicators': [word for word in growth_keywords if word in dream_text.lower()]
            }
        except:
            return {'growth_present': False, 'growth_indicators': []}

    def _analyze_unconscious_conflicts(self, dream_text: str) -> Dict:
        """Analyze unconscious conflicts in dream"""
        try:
            conflict_keywords = ['fighting', 'conflict', 'struggle', 'battle', 'war']
            conflict_count = sum(1 for word in conflict_keywords if word in dream_text.lower())
            return {
                'conflict_present': conflict_count > 0,
                'conflict_type': 'internal' if 'struggle' in dream_text.lower() else 'external'
            }
        except:
            return {'conflict_present': False, 'conflict_type': 'unknown'}

    def _generate_psychological_summary(self, stress_indicators: Dict, 
                                     creativity_indicators: Dict, 
                                     relationship_insights: Dict) -> str:
        """Generate psychological summary"""
        try:
            summary_parts = []
            if stress_indicators.get('stress_level', 0) > 0:
                summary_parts.append("Stress indicators detected")
            if creativity_indicators.get('creativity_level', 0) > 0:
                summary_parts.append("Creative elements present")
            if relationship_insights.get('relationship_focus', False):
                summary_parts.append("Relationship focus identified")
            
            return "; ".join(summary_parts) if summary_parts else "Standard psychological patterns"
        except:
            return "Psychological summary unavailable"

    def _analyze_frequency_bands(self, power_spectrum: np.ndarray) -> Dict:
        """Analyze frequency bands in EEG"""
        try:
            # Simple frequency band analysis
            return {
                'delta_band': np.mean(power_spectrum[:, :20]),
                'theta_band': np.mean(power_spectrum[:, 20:40]),
                'alpha_band': np.mean(power_spectrum[:, 40:60]),
                'beta_band': np.mean(power_spectrum[:, 60:])
            }
        except:
            return {'error': 'Frequency analysis failed'}

    def _detect_brain_wave_patterns(self, eeg_features: np.ndarray) -> Dict:
        """Detect brain wave patterns"""
        try:
            # Simple pattern detection
            variance = np.var(eeg_features)
            return {
                'activity_level': 'high' if variance > 1.0 else 'low',
                'pattern_type': 'regular' if variance < 0.5 else 'irregular'
            }
        except:
            return {'error': 'Pattern detection failed'}

    def _calculate_channel_coherence(self, eeg_features: np.ndarray) -> float:
        """Calculate coherence between EEG channels"""
        try:
            # Simple coherence calculation
            if eeg_features.shape[0] > 1:
                correlations = []
                for i in range(eeg_features.shape[0]):
                    for j in range(i+1, eeg_features.shape[0]):
                        corr = np.corrcoef(eeg_features[i], eeg_features[j])[0, 1]
                        if not np.isnan(corr):
                            correlations.append(corr)
                return np.mean(correlations) if correlations else 0.0
            return 0.0
        except:
            return 0.0

    def _assess_signal_quality(self, eeg_features: np.ndarray) -> Dict:
        """Assess EEG signal quality"""
        try:
            # Simple quality assessment
            snr = np.mean(np.abs(eeg_features)) / np.std(eeg_features)
            return {
                'signal_to_noise': snr,
                'quality_level': 'good' if snr > 2.0 else 'poor'
            }
        except:
            return {'signal_to_noise': 0.0, 'quality_level': 'unknown'}

    def _calculate_eeg_quality_score(self, signal_quality: Dict, channel_coherence: float) -> float:
        """Calculate overall EEG quality score"""
        try:
            snr_score = min(1.0, signal_quality.get('signal_to_noise', 0) / 5.0)
            coherence_score = max(0.0, min(1.0, channel_coherence))
            return (snr_score + coherence_score) / 2
        except:
            return 0.5

    def _assess_archetype_significance(self, archetype: str, match_count: int) -> str:
        """Assess significance of detected archetype"""
        try:
            if match_count >= 3:
                return 'high'
            elif match_count >= 1:
                return 'medium'
            else:
                return 'low'
        except:
            return 'unknown'

    def _get_archetype_interpretation(self, archetype: str) -> str:
        """Get interpretation for archetype"""
        try:
            interpretations = {
                'hero': 'Represents courage, leadership, and protection',
                'shadow': 'Represents hidden fears and dark aspects',
                'anima': 'Represents feminine energy and nurturing',
                'animus': 'Represents masculine energy and strength',
                'wise_old_man': 'Represents wisdom and guidance',
                'child': 'Represents innocence and new beginnings',
                'mother': 'Represents nurturing and care',
                'father': 'Represents authority and protection'
            }
            return interpretations.get(archetype, 'Archetype interpretation unavailable')
        except:
            return 'Archetype interpretation unavailable'

    def _find_dominant_archetype(self, detected_archetypes: Dict) -> str:
        """Find the dominant archetype"""
        try:
            if not detected_archetypes:
                return 'none'
            
            # Find archetype with highest significance
            max_significance = 'low'
            dominant = 'none'
            
            for archetype, data in detected_archetypes.items():
                significance = data.get('significance', 'low')
                if significance == 'high':
                    return archetype
                elif significance == 'medium' and max_significance == 'low':
                    max_significance = 'medium'
                    dominant = archetype
            
            return dominant
        except:
            return 'none'

    def _generate_archetype_summary(self, detected_archetypes: Dict) -> str:
        """Generate summary of detected archetypes"""
        try:
            if not detected_archetypes:
                return "No archetypes detected"
            
            archetype_names = list(detected_archetypes.keys())
            if len(archetype_names) == 1:
                return f"Primary archetype: {archetype_names[0]}"
            else:
                return f"Multiple archetypes: {', '.join(archetype_names)}"
        except:
            return "Archetype summary unavailable"

    def _assess_emotion_intensity(self, score: int) -> str:
        """Assess intensity of detected emotion"""
        try:
            if score >= 3:
                return 'high'
            elif score >= 1:
                return 'medium'
            else:
                return 'low'
        except:
            return 'unknown'

    def _calculate_emotional_intensity(self, emotional_scores: Dict) -> str:
        """Calculate overall emotional intensity"""
        try:
            if not emotional_scores:
                return 'neutral'
            
            total_score = sum(emotional_scores.values())
            if total_score >= 5:
                return 'high'
            elif total_score >= 2:
                return 'medium'
            else:
                return 'low'
        except:
            return 'unknown'

    def _analyze_mood_patterns(self, dream_text: str) -> Dict:
        """Analyze mood patterns in dream"""
        try:
            positive_words = ['happy', 'joy', 'peaceful', 'beautiful', 'wonderful']
            negative_words = ['sad', 'fear', 'angry', 'terrible', 'horrible']
            
            positive_count = sum(1 for word in positive_words if word in dream_text.lower())
            negative_count = sum(1 for word in negative_words if word in dream_text.lower())
            
            if positive_count > negative_count:
                mood = 'positive'
            elif negative_count > positive_count:
                mood = 'negative'
            else:
                mood = 'neutral'
            
            return {
                'overall_mood': mood,
                'positive_indicators': positive_count,
                'negative_indicators': negative_count
            }
        except:
            return {'overall_mood': 'unknown', 'positive_indicators': 0, 'negative_indicators': 0}

    def _generate_emotional_summary(self, detected_emotions: Dict, dominant_emotion: str) -> str:
        """Generate emotional summary"""
        try:
            if not detected_emotions:
                return "Emotional analysis incomplete"
            
            emotion_count = len(detected_emotions)
            if emotion_count == 1:
                return f"Single dominant emotion: {dominant_emotion}"
            else:
                return f"Complex emotional state with {emotion_count} emotions, dominant: {dominant_emotion}"
        except:
            return "Emotional summary unavailable"

    def _assess_theme_significance(self, score: int) -> str:
        """Assess significance of detected theme"""
        try:
            if score >= 3:
                return 'high'
            elif score >= 1:
                return 'medium'
            else:
                return 'low'
        except:
            return 'unknown'

    def _get_theme_interpretation(self, theme: str) -> str:
        """Get interpretation for theme"""
        try:
            interpretations = {
                'flying': 'Represents freedom, transcendence, and escape',
                'falling': 'Represents loss of control and anxiety',
                'chase': 'Represents avoidance and running from problems',
                'water': 'Represents emotions and unconscious mind',
                'house': 'Represents self and security',
                'animals': 'Represents instincts and primal urges',
                'death': 'Represents transformation and change',
                'naked': 'Represents vulnerability and truth'
            }
            return interpretations.get(theme, 'Theme interpretation unavailable')
        except:
            return 'Theme interpretation unavailable'

    def _assess_theme_complexity(self, detected_themes: Dict) -> str:
        """Assess complexity of detected themes"""
        try:
            theme_count = len(detected_themes)
            if theme_count >= 4:
                return 'very complex'
            elif theme_count >= 2:
                return 'complex'
            else:
                return 'simple'
        except:
            return 'unknown'

    def _generate_theme_summary(self, detected_themes: Dict) -> str:
        """Generate summary of detected themes"""
        try:
            if not detected_themes:
                return "No specific themes detected"
            
            theme_names = list(detected_themes.keys())
            if len(theme_names) == 1:
                return f"Primary theme: {theme_names[0]}"
            else:
                return f"Multiple themes: {', '.join(theme_names)}"
        except:
            return "Theme summary unavailable"

    def _analyze_frequency_distribution(self, eeg_features: np.ndarray) -> Dict:
        """Analyze frequency distribution of EEG"""
        try:
            # Simple frequency analysis
            return {
                'low_freq_power': np.mean(eeg_features[:, :30]),
                'mid_freq_power': np.mean(eeg_features[:, 30:70]),
                'high_freq_power': np.mean(eeg_features[:, 70:])
            }
        except:
            return {'error': 'Frequency distribution analysis failed'}

    def _assess_mental_workload(self, variance: float, entropy: float) -> str:
        """Assess mental workload from EEG features"""
        try:
            # Simple workload assessment
            if variance > 1.0 and entropy > 2.0:
                return 'high'
            elif variance > 0.5 or entropy > 1.0:
                return 'medium'
            else:
                return 'low'
        except:
            return 'unknown'

    def _calculate_cognitive_load_score(self, variance: float, entropy: float) -> float:
        """Calculate cognitive load score"""
        try:
            # Normalize and combine metrics
            norm_variance = min(1.0, variance / 2.0)
            norm_entropy = min(1.0, entropy / 3.0)
            return (norm_variance + norm_entropy) / 2
        except:
            return 0.5

    def _classify_mental_activity(self, mental_workload: str) -> str:
        """Classify mental activity level"""
        try:
            if mental_workload == 'high':
                return 'very active'
            elif mental_workload == 'medium':
                return 'moderately active'
            else:
                return 'minimally active'
        except:
            return 'unknown'

    def _calculate_sleep_depth(self, eeg_features: np.ndarray) -> float:
        """Calculate sleep depth indicators"""
        try:
            # Simple sleep depth calculation
            # Lower variance often indicates deeper sleep
            variance = np.var(eeg_features)
            depth_score = max(0.0, 1.0 - variance)
            return depth_score
        except:
            return 0.5

    def _analyze_sleep_stage_characteristics(self, eeg_features: np.ndarray) -> Dict:
        """Analyze sleep stage characteristics"""
        try:
            # Simple sleep stage analysis
            variance = np.var(eeg_features)
            if variance < 0.3:
                stage = 'deep_sleep'
            elif variance < 0.7:
                stage = 'light_sleep'
            else:
                stage = 'rem_sleep'
            
            return {
                'likely_stage': stage,
                'stage_confidence': 0.7
            }
        except:
            return {'likely_stage': 'unknown', 'stage_confidence': 0.0}

    def _assess_sleep_stability(self, eeg_features: np.ndarray) -> float:
        """Assess sleep stability"""
        try:
            # Calculate stability as inverse of variance
            variance = np.var(eeg_features)
            stability = max(0.0, 1.0 / (1.0 + variance))
            return stability
        except:
            return 0.5

    def _calculate_sleep_quality_score(self, sleep_depth: float, sleep_stability: float) -> float:
        """Calculate overall sleep quality score"""
        try:
            return (sleep_depth + sleep_stability) / 2
        except:
            return 0.5

    def _classify_sleep_quality(self, sleep_quality_score: float) -> str:
        """Classify sleep quality level"""
        try:
            if sleep_quality_score >= 0.8:
                return 'excellent'
            elif sleep_quality_score >= 0.6:
                return 'good'
            elif sleep_quality_score >= 0.4:
                return 'fair'
            else:
                return 'poor'
        except:
            return 'unknown'

    def _generate_sleep_recommendations(self, sleep_quality_score: float) -> List[str]:
        """Generate sleep improvement recommendations"""
        try:
            recommendations = []
            if sleep_quality_score < 0.6:
                recommendations.append("Consider improving sleep hygiene")
                recommendations.append("Reduce screen time before bed")
                recommendations.append("Maintain consistent sleep schedule")
            if sleep_quality_score < 0.4:
                recommendations.append("Consult sleep specialist if problems persist")
            
            return recommendations if recommendations else ["Sleep quality appears adequate"]
        except:
            return ["Sleep recommendations unavailable"]

    def _assess_text_coherence(self, dream_text: str) -> float:
        """Assess text coherence of dream"""
        try:
            # Simple coherence assessment
            sentences = dream_text.split('.')
            if len(sentences) < 2:
                return 0.5
            
            # Check for logical connectors
            connectors = ['then', 'suddenly', 'but', 'however', 'meanwhile']
            connector_count = sum(1 for connector in connectors if connector in dream_text.lower())
            
            # Normalize score
            coherence = min(1.0, connector_count / 3.0 + 0.3)
            return coherence
        except:
            return 0.5

    def _calculate_eeg_coherence(self, eeg_features: np.ndarray) -> float:
        """Calculate EEG coherence score"""
        try:
            # Use channel coherence as EEG coherence
            return self._calculate_channel_coherence(eeg_features)
        except:
            return 0.5

    def _assess_narrative_flow(self, dream_text: str) -> float:
        """Assess narrative flow of dream"""
        try:
            # Simple narrative flow assessment
            words = dream_text.split()
            if len(words) < 10:
                return 0.3
            
            # Check for narrative elements
            narrative_elements = ['i', 'was', 'then', 'suddenly', 'felt', 'saw']
            element_count = sum(1 for element in narrative_elements if element in dream_text.lower())
            
            # Normalize score
            flow_score = min(1.0, element_count / 4.0 + 0.4)
            return flow_score
        except:
            return 0.5

    def _classify_coherence_level(self, overall_coherence: float) -> str:
        """Classify coherence level"""
        try:
            if overall_coherence >= 0.8:
                return 'very coherent'
            elif overall_coherence >= 0.6:
                return 'coherent'
            elif overall_coherence >= 0.4:
                return 'somewhat coherent'
            else:
                return 'incoherent'
        except:
            return 'unknown'

    def _explain_coherence(self, overall_coherence: float) -> str:
        """Explain coherence score"""
        try:
            if overall_coherence >= 0.8:
                return "Dream has very clear narrative structure and logical flow"
            elif overall_coherence >= 0.6:
                return "Dream has good narrative structure with some logical connections"
            elif overall_coherence >= 0.4:
                return "Dream has basic narrative structure but may lack clear connections"
            else:
                return "Dream appears fragmented with limited narrative coherence"
        except:
            return "Coherence explanation unavailable"

    def _calculate_reliability_score(self, confidence: float, entropy: float) -> str:
        """Calculate reliability score"""
        try:
            if confidence > 0.7 and entropy < 1.0:
                return 'high'
            elif confidence > 0.4 and entropy < 2.0:
                return 'medium'
            else:
                return 'low'
        except:
            return 'unknown'
