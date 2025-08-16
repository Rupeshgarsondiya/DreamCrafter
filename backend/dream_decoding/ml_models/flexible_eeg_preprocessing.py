import os
import mne
import numpy as np
import h5py
from scipy import signal
import warnings
from tqdm import tqdm
warnings.filterwarnings('ignore')

class FlexibleEEGPreprocessor:
    """
    EEG Preprocessing handling partial datasets with missing files.
    Optimized for RTX 4050 with your 33 downloaded files.
    """

    def __init__(self, sampling_rate=100, max_duration=300, epoch_length=30, overlap=0.5):
        self.fs = sampling_rate
        self.max_duration = max_duration  # Crop to 5 minutes for memory efficiency
        self.epoch_length = epoch_length  # 30-second epochs
        self.overlap = overlap  # 50% overlap between epochs

    def analyze_dataset(self, data_dir='data/raw/comprehensive_1gb'):
        """Analyze what files you actually have"""
        files = [f for f in os.listdir(data_dir) if f.endswith('.edf')]
        
        categories = {
            'Sleep Cassette': [f for f in files if f.startswith('SC4')],
            'Sleep Telemetry': [f for f in files if f.startswith('ST7')],
            'Motor Imagery': [f for f in files if f.startswith('S0') and ('R01' in f or 'R02' in f)],
            'Motor Movement': [f for f in files if f.startswith('S0') and ('R03' in f or 'R04' in f)]
        }
        
        print("📊 Dataset Analysis:")
        print(f"   📁 Total EDF files found: {len(files)}")
        for category, cat_files in categories.items():
            print(f"   🧠 {category}: {len(cat_files)} files")
        
        return files, categories

    def load_and_preprocess(self, file_path):
        """Load and preprocess one EEG EDF file with robust error handling"""
        print(f"   📂 Loading: {os.path.basename(file_path)}")
        
        try:
            # Load EDF file
            raw = mne.io.read_raw_edf(file_path, preload=True, verbose=False)
            
            original_duration = raw.times[-1]
            original_channels = raw.info['nchan']
            original_sfreq = raw.info['sfreq']
            
            print(f"      📊 Original: {original_channels} ch, {original_sfreq}Hz, {original_duration:.1f}s")
            
            # Crop if too long (memory management for RTX 4050)
            if original_duration > self.max_duration:
                raw.crop(tmax=self.max_duration)
                print(f"      ✂️ Cropped to {self.max_duration}s for memory efficiency")
            
            # Select EEG channels only (remove EOG, EMG, etc.)
            eeg_channels = []
            for ch in raw.ch_names:
                ch_upper = ch.upper()
                if any(marker in ch_upper for marker in ['EEG', 'F', 'C', 'P', 'O']):
                    eeg_channels.append(ch)
            
            if eeg_channels:
                # Limit to 19 channels max for RTX 4050 memory
                max_channels = min(len(eeg_channels), 19)
                raw.pick_channels(eeg_channels[:max_channels])
                print(f"      🧠 Selected {len(raw.ch_names)} EEG channels")
            else:
                print(f"      ⚠️ No clear EEG channels found, using first 19 channels")
                if raw.info['nchan'] > 19:
                    raw.pick_channels(raw.ch_names[:19])
            
            # Apply filters
            print(f"      🔄 Filtering...")
            raw.filter(l_freq=0.5, h_freq=40, verbose=False)  # Bandpass
            raw.notch_filter(50, verbose=False)  # Remove power line noise
            
            # Resample if needed
            if original_sfreq != self.fs:
                raw.resample(self.fs)
                print(f"      📉 Resampled from {original_sfreq}Hz to {self.fs}Hz")
            
            return raw
            
        except Exception as e:
            print(f"      ❌ Failed to load {file_path}: {str(e)}")
            return None

    def create_epochs(self, raw):
        """Create overlapping epochs from continuous EEG"""
        try:
            step_size = self.epoch_length * (1 - self.overlap)
            events = mne.make_fixed_length_events(raw, duration=step_size)
            
            epochs = mne.Epochs(
                raw, events, 
                tmin=0, tmax=self.epoch_length - 1/self.fs,
                baseline=None, preload=True, verbose=False
            )
            
            print(f"      ✅ Created {len(epochs)} epochs of {self.epoch_length}s each")
            return epochs
            
        except Exception as e:
            print(f"      ❌ Failed to create epochs: {str(e)}")
            return None

    def extract_comprehensive_features(self, epochs):
        """Extract comprehensive features for dream decoding"""
        data = epochs.get_data()  # Shape: (n_epochs, n_channels, n_timepoints)
        print(f"      🔍 Extracting features from shape: {data.shape}")
        
        features = {}
        
        # 1. Raw signals (for deep learning models)
        features['raw_signals'] = data.astype(np.float32)  # Use float32 for memory
        
        # 2. Spectral features (frequency bands important for sleep/dreams)
        print(f"      🌊 Computing spectral features...")
        bands = {
            'delta': (0.5, 4),    # Deep sleep
            'theta': (4, 8),      # REM sleep, drowsiness
            'alpha': (8, 13),     # Relaxed wakefulness
            'beta': (13, 30),     # Alert wakefulness
            'gamma': (30, 40)     # High-frequency activity
        }
        
        spectral_features = {}
        for band_name, (low, high) in bands.items():
            sos = signal.butter(4, [low, high], btype='band', fs=self.fs, output='sos')
            filtered = signal.sosfilt(sos, data, axis=-1)
            power = np.mean(filtered**2, axis=-1).astype(np.float32)
            spectral_features[f'{band_name}_power'] = power
        
        features['spectral'] = spectral_features
        
        # 3. Statistical features
        print(f"      📈 Computing statistical features...")
        statistical_features = {
            'mean': np.mean(data, axis=-1).astype(np.float32),
            'std': np.std(data, axis=-1).astype(np.float32),
            'max': np.max(data, axis=-1).astype(np.float32),
            'min': np.min(data, axis=-1).astype(np.float32),
            'rms': np.sqrt(np.mean(data**2, axis=-1)).astype(np.float32)
        }
        features['statistical'] = statistical_features
        
        print(f"      ✅ Extracted all features successfully")
        return features

    def save_features(self, features, output_path):
        """Save features to compressed HDF5 file"""
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        print(f"      💾 Saving to: {os.path.basename(output_path)}")
        
        with h5py.File(output_path, 'w') as f:
            for feature_type, feature_data in features.items():
                if isinstance(feature_data, dict):
                    # Create group for nested features
                    group = f.create_group(feature_type)
                    for sub_feature, sub_data in feature_data.items():
                        group.create_dataset(
                            sub_feature, data=sub_data, 
                            compression='gzip', compression_opts=6
                        )
                else:
                    # Direct feature array
                    f.create_dataset(
                        feature_type, data=feature_data,
                        compression='gzip', compression_opts=6
                    )

    def process_all_files(self, data_dir='data/raw/comprehensive_1gb', 
                         output_dir='data/processed/comprehensive_features'):
        """Process all available EEG files"""
        
        print("🚀 Starting EEG preprocessing for your partial dataset...")
        
        # Analyze dataset first
        files, categories = self.analyze_dataset(data_dir)
        
        if not files:
            print(f"❌ No EDF files found in {data_dir}")
            return
        
        print(f"\n🔄 Processing {len(files)} EEG files...")
        os.makedirs(output_dir, exist_ok=True)
        
        processed_count = 0
        total_epochs = 0
        failed_files = []
        
        for i, filename in enumerate(files, 1):
            file_path = os.path.join(data_dir, filename)
            
            print(f"\n📄 [{i}/{len(files)}] Processing: {filename}")
            
            # Load and preprocess
            raw = self.load_and_preprocess(file_path)
            if raw is None:
                failed_files.append(filename)
                continue
            
            # Create epochs
            epochs = self.create_epochs(raw)
            if epochs is None:
                failed_files.append(filename)
                continue
            
            # Extract features
            features = self.extract_comprehensive_features(epochs)
            
            # Save features
            base_name = os.path.splitext(filename)[0]
            output_path = os.path.join(output_dir, f'{base_name}_features.h5')
            self.save_features(features, output_path)
            
            processed_count += 1
            total_epochs += len(epochs)
            
            # Clear memory
            del raw, epochs, features
        
        # Summary
        print(f"\n🎉 Processing Complete!")
        print(f"   📊 Successfully processed: {processed_count}/{len(files)} files")
        print(f"   🧠 Total epochs generated: {total_epochs}")
        print(f"   💾 Features saved to: {output_dir}")
        print(f"   📈 Average epochs per file: {total_epochs/processed_count:.1f}")
        
        if failed_files:
            print(f"   ⚠️ Failed files ({len(failed_files)}):")
            for failed in failed_files:
                print(f"      - {failed}")
        
        print(f"\n🎯 Dataset ready for RTX 4050 training!")
        return processed_count, total_epochs

def verify_processed_features(feature_dir='data/processed/comprehensive_features'):
    """Verify the processed features"""
    if not os.path.exists(feature_dir):
        print("❌ Feature directory not found!")
        return
    
    feature_files = [f for f in os.listdir(feature_dir) if f.endswith('.h5')]
    
    print(f"\n🔍 Feature Verification:")
    print(f"   📄 Feature files created: {len(feature_files)}")
    
    if feature_files:
        # Check first file
        sample_file = os.path.join(feature_dir, feature_files[0])
        
        with h5py.File(sample_file, 'r') as f:
            print(f"   📊 Sample file structure:")
            for key in f.keys():
                if isinstance(f[key], h5py.Group):
                    print(f"      📁 {key}:")
                    for subkey in f[key].keys():
                        shape = f[key][subkey].shape
                        print(f"         - {subkey}: {shape}")
                else:
                    shape = f[key].shape
                    print(f"      📄 {key}: {shape}")
        
        total_epochs = 0
        for feature_file in feature_files[:5]:  # Check first 5
            with h5py.File(os.path.join(feature_dir, feature_file), 'r') as f:
                if 'raw_signals' in f:
                    epochs = f['raw_signals'].shape[0]
                    total_epochs += epochs
        
        estimated_total = total_epochs * len(feature_files) // min(5, len(feature_files))
        print(f"   🎯 Estimated total epochs: ~{estimated_total}")
    
    print(f"   ✅ Ready for model training!")

if __name__ == '__main__':
    # Run preprocessing
    preprocessor = FlexibleEEGPreprocessor()
    processed, epochs = preprocessor.process_all_files()
    
    # Verify results
    verify_processed_features()
    
    print(f"\n🚀 Next step: Start building your EEG-to-text models!")
