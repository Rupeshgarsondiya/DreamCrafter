"""
Memory-optimized EEG preprocessing for dream decoding
Designed to prevent memory crashes and system instability
"""

import numpy as np
import mne
from scipy.signal import butter, filtfilt
from sklearn.preprocessing import RobustScaler
import h5py
from pathlib import Path
import logging
import gc
from tqdm import tqdm

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MemoryOptimizedEEGPreprocessor:
    def __init__(self, 
                 window_size_sec=10,  # Smaller windows for less memory
                 stride_sec=5, 
                 target_sr=64,  # Lower sampling rate
                 max_channels=16):  # Limit channels
        """
        Memory-optimized EEG Preprocessor
        
        Args:
            window_size_sec: Smaller window size (10s vs 30s)
            stride_sec: Stride between windows
            target_sr: Lower target sampling rate (64Hz vs 128Hz)
            max_channels: Limit number of channels to process
        """
        self.window_size_sec = window_size_sec
        self.stride_sec = stride_sec
        self.target_sr = target_sr
        self.max_channels = max_channels
        self.scaler = RobustScaler()
        
        # Simplified frequency bands
        self.freq_bands = {
            'delta': (0.5, 4),
            'theta': (4, 8), 
            'alpha': (8, 13),
            'beta': (13, 30)
        }

    def process_file_streaming(self, file_path, output_dir):
        """Process file with minimal memory footprint"""
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)
        
        try:
            logger.info(f"Processing {file_path} with memory optimization...")
            
            # Load with minimal memory
            raw = mne.io.read_raw_edf(file_path, preload=False, verbose=False)
            
            # Select limited EEG channels
            raw = self._select_eeg_channels(raw)
            if raw is None:
                return False
            
            # Get basic info before loading data
            sfreq = raw.info['sfreq']
            n_channels = len(raw.ch_names)
            duration = raw.times[-1]
            
            logger.info(f"File: {duration:.1f}s, {n_channels} channels, {sfreq}Hz")
            
            # Process in chunks to avoid memory overload
            chunk_duration = 60  # Process 60 seconds at a time
            all_features = []
            
            for start_time in tqdm(np.arange(0, duration - chunk_duration, chunk_duration), 
                                 desc="Processing chunks"):
                end_time = min(start_time + chunk_duration, duration)
                
                # Load only this chunk
                chunk_raw = raw.copy().crop(tmin=start_time, tmax=end_time)
                chunk_raw.load_data()
                
                # Preprocess chunk
                chunk_raw = self._preprocess_chunk(chunk_raw)
                if chunk_raw is None:
                    continue
                
                # Extract features from chunk
                chunk_features = self._extract_chunk_features(chunk_raw)
                if len(chunk_features) > 0:
                    all_features.extend(chunk_features)
                
                # Clear memory
                del chunk_raw
                gc.collect()
            
            if not all_features:
                logger.error(f"No features extracted from {file_path}")
                return False
            
            # Convert to array and scale
            feature_array = np.array(all_features)
            scaled_features = self.scaler.fit_transform(feature_array)
            
            # Save results
            subject_id = Path(file_path).stem
            output_file = output_dir / f"{subject_id}_features.h5"
            
            with h5py.File(output_file, 'w') as f:
                f.create_dataset('features', data=scaled_features)
                f.create_dataset('sampling_rate', data=self.target_sr)
                f.create_dataset('n_chunks', data=len(scaled_features))
                f.create_dataset('n_channels', data=n_channels)
                f.attrs['subject_id'] = subject_id
                f.attrs['preprocessing_version'] = '3.0_memory_optimized'
            
            logger.info(f"✅ Processed {subject_id}: {len(scaled_features)} windows")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error processing {file_path}: {e}")
            return False
        finally:
            # Ensure cleanup
            gc.collect()

    def _select_eeg_channels(self, raw):
        """Select limited EEG channels to reduce memory"""
        try:
            # Try standard EEG channel selection
            eeg_channels = mne.pick_types(raw.info, eeg=True, exclude='bads')
            
            if len(eeg_channels) == 0:
                # Fallback pattern matching
                ch_names = raw.ch_names
                eeg_patterns = ['EEG', 'C3', 'C4', 'O1', 'O2', 'F3', 'F4', 'P3', 'P4']
                eeg_channels = [i for i, ch in enumerate(ch_names) 
                               if any(pattern in ch.upper() for pattern in eeg_patterns)]
            
            if len(eeg_channels) == 0:
                logger.warning("No EEG channels found")
                return None
            
            # Limit to max_channels
            selected_channels = eeg_channels[:self.max_channels]
            raw.pick(selected_channels)
            
            return raw
            
        except Exception as e:
            logger.error(f"Error selecting channels: {e}")
            return None

    def _preprocess_chunk(self, raw):
        """Apply preprocessing to a chunk"""
        try:
            # Get safe filter frequencies
            sfreq = raw.info['sfreq']
            nyquist = sfreq / 2.0
            
            # Bandpass filter
            l_freq = 0.5
            h_freq = min(30.0, nyquist - 1.0)  # Conservative high freq
            
            raw.filter(l_freq=l_freq, h_freq=h_freq, verbose=False)
            
            # Notch filter if possible
            notch_freqs = [f for f in [50, 60] if f < nyquist - 1]
            if notch_freqs:
                raw.notch_filter(freqs=notch_freqs, verbose=False)
            
            # Resample to target rate
            if sfreq != self.target_sr:
                raw.resample(sfreq=self.target_sr, verbose=False)
            
            # Set reference
            raw.set_eeg_reference('average', projection=False, verbose=False)
            
            return raw
            
        except Exception as e:
            logger.error(f"Preprocessing error: {e}")
            return None

    def _extract_chunk_features(self, raw):
        """Extract features from preprocessed chunk"""
        try:
            data = raw.get_data()
            sfreq = raw.info['sfreq']
            
            # Create small windows
            window_samples = int(self.window_size_sec * sfreq)
            stride_samples = int(self.stride_sec * sfreq)
            
            features = []
            
            for start in range(0, data.shape[1] - window_samples + 1, stride_samples):
                end = start + window_samples
                window_data = data[:, start:end]
                
                # Extract simple features
                window_features = self._extract_window_features(window_data, sfreq)
                if len(window_features) > 0:
                    features.append(window_features)
            
            return features
            
        except Exception as e:
            logger.error(f"Feature extraction error: {e}")
            return []

    def _extract_window_features(self, data, sfreq):
        """Extract features from a small window"""
        try:
            features = []
            
            # Basic statistical features per channel
            for ch in range(int(data.shape[0])):
                ch_data = data[ch]
                features.extend([
                    np.mean(ch_data),
                    np.std(ch_data),
                    np.var(ch_data),
                    np.median(ch_data)
                ])
            
            # Simple frequency features
            for band_name, (low, high) in self.freq_bands.items():
                try:
                    nyquist = sfreq / 2
                    if high < nyquist:
                        low_norm = low / nyquist
                        high_norm = high / nyquist
                        
                        b, a = butter(4, [low_norm, high_norm], btype='band')
                        band_powers = []
                        
                        for ch in range(data.shape):
                            filtered = filtfilt(b, a, data[ch])
                            power = np.mean(filtered ** 2)
                            band_powers.append(power)
                        
                        features.extend(band_powers)
                except:
                    continue
            
            return np.array(features)
            
        except Exception as e:
            logger.warning(f"Window feature extraction error: {e}")
            return np.array([])

def main():
    """Main processing function with memory management"""
    raw_data_dir = Path("data/raw/comprehensive_1gb")
    output_dir = Path("data/processed/comprehensive_features")
    
    # Get EDF files
    edf_files = list(raw_data_dir.glob("*.edf"))
    edf_files = [f for f in edf_files if "Hypnogram" not in str(f)]
    
    if not edf_files:
        logger.error(f"No EDF files found in {raw_data_dir}")
        return
    
    logger.info(f"Found {len(edf_files)} EDF files to process")
    
    # Process files sequentially (no multiprocessing to save memory)
    preprocessor = MemoryOptimizedEEGPreprocessor()
    
    successful = 0
    failed = 0
    
    for edf_file in tqdm(edf_files, desc="Processing files"):
        try:
            success = preprocessor.process_file_streaming(edf_file, output_dir)
            if success:
                successful += 1
            else:
                failed += 1
                
        except Exception as e:
            logger.error(f"Failed to process {edf_file}: {e}")
            failed += 1
        
        # Force garbage collection between files
        gc.collect()
    
    print(f"\n{'='*50}")
    print(f"Processing Complete!")
    print(f"✅ Successful: {successful}")
    print(f"❌ Failed: {failed}")
    print(f"{'='*50}")

if __name__ == "__main__":
    main()
