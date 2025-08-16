import os
import h5py
import torch
from torch.utils.data import Dataset, DataLoader
import numpy as np

class EEGTextDataset(Dataset):
    """
    FIXED: PyTorch Dataset for loading processed EEG features
    All HTML entities and bugs fixed
    """

    def __init__(self, features_dir='data/processed/comprehensive_features',
                 max_channels=19, max_timepoints=3000):
        self.features_dir = features_dir
        self.max_channels = max_channels
        self.max_timepoints = max_timepoints
        
        # Get feature files
        if os.path.exists(features_dir):
            self.feature_files = [f for f in os.listdir(features_dir) if f.endswith('.h5')]
        else:
            self.feature_files = []
            
        print(f"📊 Found {len(self.feature_files)} feature files")
        
        if self.feature_files:
            self._load_all_samples()
        else:
            self.samples = []
            print("⚠️ No feature files found. Dataset is empty.")

    def _load_all_samples(self):
        """Load all EEG samples into memory for fast training"""
        self.samples = []
        
        for feature_file in self.feature_files:
            file_path = os.path.join(self.features_dir, feature_file)
            
            try:
                with h5py.File(file_path, 'r') as f:
                    # Load raw EEG signals
                    raw_signals = f['raw_signals'][:]  # Shape: (epochs, channels, timepoints)
                    
                    # Process each epoch as a separate sample
                    for epoch_idx in range(raw_signals.shape[0]):
                        sample = raw_signals[epoch_idx]  # Shape: (channels, timepoints)
                        
                        # Normalize sample to fixed size
                        sample = self._normalize_sample(sample)
                        
                        # Create dummy text label
                        dummy_text = f"Sleep brain activity pattern {len(self.samples)}"
                        
                        self.samples.append({
                            'eeg': sample,
                            'text': dummy_text,
                            'file': feature_file,
                            'epoch': epoch_idx
                        })
                        
            except Exception as e:
                print(f"⚠️ Error loading {feature_file}: {e}")
                continue
        
        print(f"🧠 Loaded {len(self.samples)} EEG samples total")

    def _normalize_sample(self, sample):
        """FIXED: Normalize EEG sample to fixed dimensions"""
        channels, timepoints = sample.shape
        
        # FIXED: Proper comparison operators (not HTML entities)
        # Pad or crop channels
        if channels < self.max_channels:
            padded = np.zeros((self.max_channels, timepoints), dtype=np.float32)
            padded[:channels] = sample
            sample = padded
        elif channels > self.max_channels:
            sample = sample[:self.max_channels]
        
        # Pad or crop timepoints  
        if timepoints < self.max_timepoints:
            padded = np.zeros((self.max_channels, self.max_timepoints), dtype=np.float32)
            padded[:, :timepoints] = sample
            sample = padded
        elif timepoints > self.max_timepoints:
            sample = sample[:, :self.max_timepoints]
        
        # Z-score normalization
        sample = (sample - sample.mean()) / (sample.std() + 1e-8)
        return sample.astype(np.float32)

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        sample = self.samples[idx]
        eeg_tensor = torch.tensor(sample['eeg'])
        return eeg_tensor, sample['text']

# Test the dataset
if __name__ == "__main__":
    print("🧪 Testing EEG Dataset...")
    dataset = EEGTextDataset()
    print(f"Dataset size: {len(dataset)}")
    
    if len(dataset) > 0:
        eeg, text = dataset[0]
        print(f"EEG shape: {eeg.shape}")
        print(f"Text: {text}")
    else:
        print("❌ Dataset is empty. Run preprocessing first!")
